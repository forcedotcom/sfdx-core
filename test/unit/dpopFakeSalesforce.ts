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
import { webcrypto } from 'node:crypto';
import {
  expectedAccessTokenHash,
  FakeResponse,
  getHeader,
  RecordedRequest,
  stripQuery,
  verifyProof,
} from './dpopTestHelpers';

export const SOAP_ENV_NS = 'http://schemas.xmlsoap.org/soap/envelope/';
export const APEX_NS = 'http://soap.sforce.com/2006/08/apex';
export const METADATA_NS = 'http://soap.sforce.com/2006/04/metadata';

/** How far a proof's `iat` may be from now. */
const MAX_PROOF_AGE_SECONDS = 60;

export type FakeSalesforceOptions = {
  /** The public key the session's access token is bound to. */
  publicJwk: webcrypto.JsonWebKey;
  /** The DPoP-bound access token currently valid for the session. */
  accessToken: () => string;
  /** The nonce the server requires, if any. */
  nonce?: () => string | undefined;
};

/**
 * Accepts a request only the way Salesforce accepts a DPoP-bound session, as observed against real orgs:
 *
 * - REST: `Authorization: DPoP <token>` with a `DPoP` proof header.
 * - SOAP: the token in the envelope's `SessionHeader`, and the proof in a `DpopProofHeader` envelope header in the
 * same XML namespace as that `SessionHeader`. HTTP auth headers are ignored, so a proof sent only as an HTTP
 * header, or in another namespace, is rejected.
 *
 * Every proof must be signed by the session's key for this method, URL, token, and nonce, and never replayed.
 */
export class FakeSalesforce {
  /** Every rejection reason, in order. */
  public readonly rejections: string[] = [];
  private readonly jtis = new Set<string>();

  public constructor(private readonly options: FakeSalesforceOptions) {}

  /**
   * @returns Why Salesforce would reject the request, or undefined if it would accept it.
   */
  public check(request: RecordedRequest): string | undefined {
    return isSoap(request) ? this.checkSoap(request) : this.checkRest(request);
  }

  /**
   * A route that answers accepted requests with `respond` and rejected ones with `INVALID_SESSION_ID`.
   */
  public respond(
    respond: (request: RecordedRequest) => FakeResponse = (): FakeResponse => ({ statusCode: 200, body: { ok: true } })
  ): (request: RecordedRequest) => FakeResponse {
    return (request) => {
      const reason = this.check(request);
      if (reason === undefined) return respond(request);
      this.rejections.push(reason);
      return isSoap(request) ? soapInvalidSession(reason) : restInvalidSession(reason);
    };
  }

  private checkRest(request: RecordedRequest): string | undefined {
    const authorization = getHeader(request.headers, 'Authorization');
    if (authorization === undefined) return 'no Authorization header';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'DPoP') return `Authorization scheme is ${scheme}, not DPoP`;
    return this.checkProof(getHeader(request.headers, 'DPoP'), request, token);
  }

  private checkSoap(request: RecordedRequest): string | undefined {
    let envelope: XmlElement;
    try {
      envelope = parseXml(request.body ?? '');
    } catch (e) {
      return `malformed envelope: ${(e as Error).message}`;
    }
    const header = find(envelope, [
      { uri: SOAP_ENV_NS, local: 'Envelope' },
      { uri: SOAP_ENV_NS, local: 'Header' },
    ]);
    if (!header) return 'no SOAP Header';
    const session = header.children.find((child) => child.local === 'SessionHeader');
    if (!session) return 'no SessionHeader';
    const token = session.children.find((child) => child.local === 'sessionId' && child.uri === session.uri)?.text;
    if (token === undefined) return 'no sessionId in the SessionHeader';
    const proofHeader = header.children.find((child) => child.local === 'DpopProofHeader' && child.uri === session.uri);
    if (!proofHeader) return `no DpopProofHeader in the SessionHeader namespace (${session.uri ?? 'none'})`;
    const proof = proofHeader.children.find((child) => child.local === 'proof' && child.uri === session.uri)?.text;
    return this.checkProof(proof?.trim(), request, unescapeXml(token.trim()));
  }

  private checkProof(proof: string | undefined, request: RecordedRequest, token: string): string | undefined {
    if (token !== this.options.accessToken()) return 'unknown access token';
    if (!proof) return 'no DPoP proof';
    let decoded: ReturnType<typeof verifyProof>;
    try {
      decoded = verifyProof(proof);
    } catch (e) {
      return `invalid proof signature: ${(e as Error).message}`;
    }
    const { header, payload } = decoded;
    if (header.typ !== 'dpop+jwt') return `proof typ is ${header.typ}`;
    if (header.jwk.x !== this.options.publicJwk.x || header.jwk.y !== this.options.publicJwk.y) {
      return 'proof is signed by a key the token is not bound to';
    }
    if (payload.htm !== request.method) return `proof htm ${payload.htm} does not match ${request.method}`;
    if (payload.htu !== stripQuery(request.url)) return `proof htu ${payload.htu} does not match ${request.url}`;
    if (payload.ath !== expectedAccessTokenHash(token)) return 'proof ath does not match the access token';
    if (Math.abs(Date.now() / 1000 - payload.iat) > MAX_PROOF_AGE_SECONDS) return 'proof iat is out of range';
    const nonce = this.options.nonce?.();
    if (nonce !== undefined && payload.nonce !== nonce) return `proof nonce ${payload.nonce ?? 'none'} is not ${nonce}`;
    if (this.jtis.has(payload.jti)) return 'proof jti was replayed';
    this.jtis.add(payload.jti);
    return undefined;
  }
}

const isSoap = (request: RecordedRequest): boolean =>
  (getHeader(request.headers, 'Content-Type') ?? '').includes('xml') && (request.body ?? '').includes('Envelope');

const restInvalidSession = (reason: string): FakeResponse => ({
  statusCode: 401,
  body: [{ errorCode: 'INVALID_SESSION_ID', message: `Session expired or invalid: ${reason}` }],
});

const soapInvalidSession = (reason: string): FakeResponse => ({
  statusCode: 500,
  headers: { 'content-type': 'text/xml' },
  body:
    `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="${SOAP_ENV_NS}"` +
    ' xmlns:sf="urn:fault.partner.soap.sforce.com"><soapenv:Body><soapenv:Fault>' +
    `<faultcode>sf:INVALID_SESSION_ID</faultcode><faultstring>INVALID_SESSION_ID: ${reason}</faultstring>` +
    '</soapenv:Fault></soapenv:Body></soapenv:Envelope>',
});

/** An XML element with its namespace URI resolved, as a namespace-aware server sees it. */
export type XmlElement = {
  name: string;
  uri?: string;
  local: string;
  text: string;
  children: XmlElement[];
};

const TAG =
  /<(\/?)([A-Za-z_][\w.-]*(?::[A-Za-z_][\w.-]*)?)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|<\?[\s\S]*?\?>|<!--[\s\S]*?-->/g;
const ATTRIBUTE = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/**
 * Parses the element structure of an XML document and resolves each element's namespace. Enough XML for SOAP
 * envelopes: no DTDs or CDATA.
 */
export const parseXml = (xml: string): XmlElement => {
  const document: XmlElement = { name: '#document', local: '#document', text: '', children: [] };
  const stack: Array<{ element: XmlElement; namespaces: Map<string, string> }> = [
    { element: document, namespaces: new Map() },
  ];
  let textStart = 0;
  for (const match of xml.matchAll(TAG)) {
    const top = stack[stack.length - 1];
    top.element.text += xml.slice(textStart, match.index);
    textStart = (match.index ?? 0) + match[0].length;
    const [, closing, name, attributes, selfClosing] = match;
    if (name === undefined) continue;
    if (closing) {
      if (top.element.name !== name) throw new Error(`</${name}> closes <${top.element.name}>`);
      stack.pop();
      continue;
    }
    const namespaces = new Map(top.namespaces);
    for (const [, attribute, doubleQuoted, singleQuoted] of (attributes ?? '').matchAll(ATTRIBUTE)) {
      const value = doubleQuoted ?? singleQuoted;
      if (attribute === 'xmlns') namespaces.set('', value);
      else if (attribute.startsWith('xmlns:')) namespaces.set(attribute.slice('xmlns:'.length), value);
    }
    const [prefix, local] = name.includes(':') ? name.split(':') : ['', name];
    if (prefix && !namespaces.has(prefix)) throw new Error(`unbound prefix ${prefix}`);
    const element: XmlElement = { name, uri: namespaces.get(prefix) ?? undefined, local, text: '', children: [] };
    if (element.uri === '') element.uri = undefined;
    top.element.children.push(element);
    if (!selfClosing) stack.push({ element, namespaces });
  }
  if (stack.length !== 1) throw new Error(`<${stack[stack.length - 1].element.name}> is not closed`);
  return document;
};

const find = (root: XmlElement, path: Array<{ uri: string; local: string }>): XmlElement | undefined =>
  path.reduce<XmlElement | undefined>(
    (element, step) => element?.children.find((child) => child.uri === step.uri && child.local === step.local),
    root
  );

const unescapeXml = (value: string): string =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

/** apex-node's executeAnonymous envelope, verbatim (`encodeBody` in @salesforce/apex-node). */
export const apexNodeExecuteAnonymousEnvelope = (accessToken: string, escapedApex: string): string =>
  `<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema"
xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:cmd="http://soap.sforce.com/2006/08/apex"
xmlns:apex="http://soap.sforce.com/2006/08/apex">
    <env:Header>
        <cmd:SessionHeader>
            <cmd:sessionId>${accessToken}</cmd:sessionId>
        </cmd:SessionHeader>
        <apex:DebuggingHeader><apex:debugLevel>DEBUGONLY</apex:debugLevel></apex:DebuggingHeader>
    </env:Header>
    <env:Body>
        <executeAnonymous xmlns="http://soap.sforce.com/2006/08/apex">
            <apexcode>${escapedApex}</apexcode>
        </executeAnonymous>
    </env:Body>
</env:Envelope>`;

export const EXECUTE_ANONYMOUS_RESPONSE =
  `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="${SOAP_ENV_NS}" xmlns="${APEX_NS}">` +
  '<soapenv:Body><executeAnonymousResponse><result><compiled>true</compiled><success>true</success></result>' +
  '</executeAnonymousResponse></soapenv:Body></soapenv:Envelope>';
