/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { PassThrough } from 'node:stream';
import { HttpRequest, HttpRequestOptions, HttpResponse } from '@jsforce/jsforce-node';
import Transport from '@jsforce/jsforce-node/lib/transport';
import { StreamPromise } from '@jsforce/jsforce-node/lib/util/promise';
import { DpopKey } from '../crypto/dpop';

/** The `token_type` of an access token, which decides the `Authorization` scheme. */
export type TokenType = 'DPoP' | 'Bearer';

export type DpopTransportOptions = {
  /** The last `DPoP-Nonce` the server sent, if any. */
  nonce?: string;
  /** The current token type. REST `Bearer` authorization is rewritten to `DPoP` when this returns `DPoP`. */
  tokenType?: () => TokenType | undefined;
  /**
   * The session's current access token. Requests carrying any other token (one a caller swapped in for another
   * API) are sent unchanged. When omitted, every token is treated as the session's.
   */
  accessToken?: () => string | undefined;
  /** Called whenever the server sends a new nonce. */
  onNonce?: (nonce: string) => void;
};

const AUTHORIZATION = /^(?:Bearer|DPoP) (.+)$/;
/** A SOAP `SessionHeader` with any (or no) namespace prefix: 1 = prefix with colon, 2 = attributes, 3 = token. */
const SOAP_SESSION_HEADER =
  /<((?:[A-Za-z_][\w.-]*:)?)SessionHeader(\s[^>]*)?>\s*<\1sessionId(?:\s[^>]*)?>([^<]*)<\/\1sessionId>\s*<\/\1SessionHeader>/;
const XMLNS_ATTRIBUTE = /\sxmlns(?::[\w.-]+)?\s*=\s*(?:"[^"]*"|'[^']*')/g;

/**
 * A jsforce transport that binds every request to a {@link DpopKey} (RFC 9449).
 *
 * - REST requests get a `DPoP` proof header, with an `ath` claim when they carry an access token. The header is
 * signed each time it is read, so jsforce's own transport retries never replay a proof.
 * - SOAP requests, including envelopes callers build themselves, get the proof in a `DpopProofHeader` envelope
 * header in the `SessionHeader`'s namespace instead of HTTP headers, which SOAP endpoints ignore.
 * - A `use_dpop_nonce` challenge is retried once with the challenged nonce and a fresh proof.
 *
 * A `DPoP` header supplied by the caller is sent unchanged, and never retried, since it can't be re-signed.
 */
export class DpopTransport extends Transport {
  public nonce?: string;

  public constructor(public readonly key: DpopKey, private readonly options: DpopTransportOptions = {}) {
    super();
    this.nonce = options.nonce;
  }

  public httpRequest(req: HttpRequest, options: HttpRequestOptions = {}): StreamPromise<HttpResponse> {
    return StreamPromise.create(() => {
      const stream = new PassThrough();
      const promise = this.send(req, options).then(
        (response) => {
          stream.end(response.body);
          return response;
        },
        (err) => {
          stream.end();
          throw err;
        }
      );
      return { stream, promise };
    });
  }

  /**
   * Returns the HTTP authorization headers for a request sent outside this transport, with a new proof.
   *
   * @param method The HTTP method of the request.
   * @param url The request URL.
   * @param accessToken The access token sent with the request.
   */
  public authHeaders(method: string, url: string | URL, accessToken: string): Record<string, string> {
    const { headers } = this.prepare({
      method: method as HttpRequest['method'],
      url: String(url),
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    // Spreading reads the signing getter once.
    return { ...(headers as Record<string, string>) };
  }

  private async send(req: HttpRequest, options: HttpRequestOptions): Promise<HttpResponse> {
    if (getHeader(req.headers, 'DPoP') !== undefined) {
      return super.httpRequest(req, { ...options, retry: { ...options.retry, maxRetries: 0 } });
    }
    const response = await super.httpRequest(this.prepare(req), options);
    if (!this.observe(response)) {
      return response;
    }
    return super.httpRequest(this.prepare(req), options);
  }

  /** Returns a copy of the request bound to this key and the current nonce. */
  private prepare(req: HttpRequest): HttpRequest {
    const headers: Record<string, string> = { ...req.headers };
    const envelope = typeof req.body === 'string' && isSoap(req) ? req.body : undefined;
    const session = envelope === undefined ? null : SOAP_SESSION_HEADER.exec(envelope);
    if (envelope !== undefined && session) return this.prepareSoap(req, envelope, headers, session);
    if ('_message' in req) return { ...req, headers };

    const url = req.url;
    const method = req.method ?? 'GET';
    const authorizationName = Object.keys(headers).find((name) => name.toLowerCase() === 'authorization');
    const accessToken = authorizationName ? AUTHORIZATION.exec(headers[authorizationName])?.[1] : undefined;
    if (accessToken !== undefined && !this.isSessionToken(accessToken)) return { ...req, headers };
    if (authorizationName && accessToken !== undefined) {
      const scheme = this.options.tokenType?.() === 'DPoP' ? 'DPoP' : headers[authorizationName].split(' ')[0];
      headers[authorizationName] = `${scheme} ${accessToken}`;
    }
    // Sign on every read: jsforce reuses this headers object for its own retries.
    Object.defineProperty(headers, 'DPoP', {
      enumerable: true,
      configurable: true,
      get: () => this.key.createProof({ method, url, nonce: this.nonce, accessToken }),
    });
    return { ...req, headers };
  }

  /**
   * SOAP: the access token travels in the envelope's SessionHeader, so the proof goes next to it, in the same
   * namespace. SOAP endpoints ignore HTTP auth headers, so none are sent.
   */
  private prepareSoap(
    req: HttpRequest,
    envelope: string,
    headers: Record<string, string>,
    session: RegExpExecArray
  ): HttpRequest {
    const [sessionHeader, prefix, attributes = '', escapedToken] = session;
    const accessToken = unescapeXml(escapedToken.trim());
    if (!this.isSessionToken(accessToken)) return { ...req, headers };
    for (const name of Object.keys(headers)) {
      if (name.toLowerCase() === 'authorization') delete headers[name];
    }
    const proof = this.key.createProof({ method: req.method ?? 'POST', url: req.url, nonce: this.nonce, accessToken });
    const namespaces = attributes.match(XMLNS_ATTRIBUTE)?.join('') ?? '';
    const proofHeader = `<${prefix}DpopProofHeader${namespaces}><${prefix}proof>${proof}</${prefix}proof></${prefix}DpopProofHeader>`;
    const body = envelope.replace(sessionHeader, () => `${sessionHeader}${proofHeader}`);
    for (const name of Object.keys(headers)) {
      if (name.toLowerCase() === 'content-length') headers[name] = String(Buffer.byteLength(body));
    }
    return { ...req, headers, body };
  }

  /**
   * Records any nonce the server sent.
   *
   * @returns Whether the response is a nonce challenge that should be retried.
   */
  private observe(response: HttpResponse): boolean {
    const nonce = getHeader(response.headers, 'dpop-nonce');
    if (!nonce) return false;
    if (nonce !== this.nonce) {
      this.nonce = nonce;
      this.options.onNonce?.(nonce);
    }
    if (response.statusCode !== 400 && response.statusCode !== 401) return false;
    const challenge = `${getHeader(response.headers, 'www-authenticate') ?? ''} ${response.body ?? ''}`;
    return challenge.toLowerCase().includes('use_dpop_nonce');
  }

  /** Whether the token is the session's own, which the server bound to this key. */
  private isSessionToken(accessToken: string): boolean {
    return this.options.accessToken ? this.options.accessToken() === accessToken : true;
  }
}

/** jsforce's SOAP API, or an envelope a caller built and sent as XML. */
const isSoap = (req: HttpRequest): boolean =>
  '_message' in req || /xml/i.test(getHeader(req.headers, 'content-type') ?? '');

const getHeader = (headers: { [name: string]: string } | undefined, name: string): string | undefined =>
  Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];

const unescapeXml = (value: string): string =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
