# Connection Apex Symbols Endpoint

## Objective

Expose the Salesforce Tooling Apex Symbols endpoint through `@salesforce/core` as an Apex-specific `Connection`
capability. Consumers must be able to retrieve symbol data for standard Apex classes, org-defined Apex classes, and
installed-package Apex classes, and dynamic Apex classes without constructing authenticated URLs themselves. Support
exact, namespace-qualified class lookups as well as broad Apex type discovery across every shipping category, with
optional filters. Treat the endpoint's sole current `TYPE_STUB` response shape as the fixed contract rather than
exposing its ineffective `format` query parameter. Provide a bounded materialized API for exact and ordinary requests and
a genuinely streaming API for broad responses.

The implementation must not introduce a new class. It should adapt the existing `Connection` and use plain TypeScript
types, functions, async iterators, and the existing `SfError` where local errors are required.

## Implementation status

- Complete: public Apex request and wire contracts, URL construction, and `Connection.retrieveApexSymbols()`
  overloads.
- Complete: direct `undici.fetch` transport with true cancellation, proxy support, total/idle timeouts, decompressed
  byte limits, bounded error bodies, no retries, and no local concurrency behavior.
- Complete: bounded materialization, stable endpoint/error mapping, and diagnostic summaries that omit requested names.
- Complete: incremental `TYPE_STUB` iteration using `@streamparser/json` with bounded input chunks, response/item/count
  limits, backpressure, envelope validation, and upstream cancellation.
- Complete: child-process memory regression proving a 128 MiB synthetic response can be consumed under a 96 MiB V8
  heap limit; measured peak RSS was approximately 181 MiB. The bounded materialized path failed deterministically
  with `ApexSymbolsResponseTooLargeError`.
- Remaining: public usage documentation, final API review, and benchmark-based confirmation of default limits.

## Scope

### In scope

- `GET /services/data/{apiVersion}/tooling/symbols`.
- Apex categories `BUILTIN`, `DATABASE`, and `DYNAMIC`.
- Exact unqualified and namespace-qualified Apex class lookups through optional `namespace` and `name` filters.
- Broad Apex type discovery through requests that omit `namespace` and/or `name`.
- Dynamic Apex class lookup and discovery through the same request, response, materialization, and streaming APIs as
  the other categories.
- A single strongly typed `TYPE_STUB` response contract; `format` is not part of the public request.
- Internal selection of the server's maximum REST API version without exposing a caller override or mutating the
  shared `Connection`.
- Bounded buffering, timeout, cancellation, backpressure, and true response streaming.
- Incremental consumption of `TYPE_STUB` responses.
- Raw streaming of the `TYPE_STUB` response for low-memory incremental consumption.
- Endpoint-owned enforcement of the cross-session single-in-flight-request limit.
- Exactly one HTTP attempt for each transport-eligible symbols API invocation, with no client-side retry, queueing,
  coalescing, or preflight concurrency check.
- Public exports, documentation, unit tests, and memory tests.
- Explicit endpoint-availability behavior for the minimum org core release, 264.

### Out of scope

- Effect services, Effect schemas, catalog persistence, or provider routing. Those remain in
  `salesforcedx-vscode-services`.
- Converting type stubs into source files or canonical language-server symbols.
- Retrieving Apex source code or Metadata API components. This endpoint supplies Apex symbol/type-stub data, not
  source text.
- Inferring support from REST API version alone.
- Reconstructing members hidden by managed-package IP filtering.

## Confirmed endpoint behavior

Live probes were run on 2026-08-25.

- The shipping route is `/services/data/{apiVersion}/tooling/symbols`. The route in `symbols.md`,
  `/tooling/apex/symbols`, is stale.
- `category` is required and accepts `BUILTIN`, `DATABASE`, or `DYNAMIC`. It selects three distinct Apex class/type
  populations:

  | Category   | Apex symbols requested                                                                                           |
  | ---------- | ---------------------------------------------------------------------------------------------------------------- |
  | `BUILTIN`  | Standard Apex classes and related types with documentation, such as `System.String`.                             |
  | `DATABASE` | Org-defined and installed-package Apex classes and related types.                                                |
  | `DYNAMIC`  | Dynamic Apex classes and related types supplied by the endpoint; this category excludes installed-package types. |

- On `org-farm-264-2`, an unqualified `DATABASE` request returned 889 stubs: 76 unnamespaced and 813 in namespace
  `FSLQA`.
- `DYNAMIC` is a first-class request category, not a fallback for `DATABASE`. Core must pass it through unchanged and
  must not infer, merge, or fan out across categories.
- `namespace` and `name` are optional exact filters and have behaved case-insensitively.
- A valid miss is HTTP 200 with `{ "typeStubs": [] }`.
- A returned stub can contain `compileError`. This means the type was identified but a usable symbol projection was
  not produced. It is not equivalent to a miss.
- `format=TYPE_STUB`, an omitted `format`, and an invalid format produced the same response on the v264 endpoint.
  `TYPE_STUB` is the only shape returned by the current endpoint, so Core omits the parameter and exposes that shape
  directly. A future server capability with a different response shape requires an intentional API revision.
- The live `ApexTypeStub` includes top-level `typeParameters`; this field is absent from `symbols.md` and must be
  represented in the raw contract.
- Endpoint availability is a core-train capability, not a REST-version capability. A non-v264 org advertising v67.0
  returned 404, while a v264 org served the endpoint at v67.0 and v68.0.
- The server permits only one symbol-table request in flight at a time per org. A request submitted while another is
  active can fail with:

  ```json
  [
    {
      "message": "Symbol table request already in progress for this org. Please retry later.",
      "errorCode": "UNKNOWN_EXCEPTION"
    }
  ]
  ```

  The endpoint owns this cross-session constraint. Core must send the invocation once, then surface this response
  without retrying, queueing, or coalescing it with another request.

### Response transport observations

An exact request returned these relevant headers:

```text
content-type: application/json;charset=UTF-8
transfer-encoding: chunked
content-encoding: gzip
connection: close
```

There was no `content-length`. Chunked HTTP transfer makes incremental byte consumption possible, but it does not
prove that the server emits individual stubs promptly. The JSON response is one envelope containing one array; there
is no documented cursor, `nextRecordsUrl`, limit, or record framing.

## Availability and minimum org release

The endpoint is available only on org core release 264 or later. This is a requirement on the org's core train, not
an equivalence with a REST API number.

`Connection` currently exposes `retrieveMaxApiVersion()` but no authoritative org core-release number. Therefore:

- Do not map v67.0, v68.0, or any other REST version to org release 264.
- Do not add a numeric REST-version precheck or a public capability Boolean inferred from REST version.
- Always resolve the endpoint request against the server's maximum REST API version so a project-pinned older
  `connection.version` does not create a false negative. This choice is internal; do not expose an API-version request
  control.
- Use the first real symbols request as the feature check; do not issue a separate probe that can duplicate work or
  acquire the org-level symbol-generation lock.
- Convert a route-level 404 into a stable `ApexSymbolsEndpointUnavailableError` whose structured data includes
  `minimumOrgRelease: 264`, the internally selected REST API version, and the original cause. The message must explain
  that the org may be older than release 264 or that the endpoint is unavailable at the server's maximum REST
  version.
- Scope an unavailable observation to the internally selected REST API version. Do not cache one 404 as proof that
  every REST version on the org is unsupported.
- A schema-valid HTTP 200, including `{ "typeStubs": [] }`, proves endpoint availability for that internally selected
  version.
- Authentication, authorization, timeout, malformed response, and server-busy failures are not evidence that the
  endpoint is unsupported.

## Endpoint-owned concurrency

The one-in-flight limit is enforced across sessions by the Salesforce endpoint. Core must not attempt to reproduce
that coordination in a process-local registry or lock:

- Every valid invocation that is not already aborted dispatches exactly one HTTP request, including overlapping
  invocations for the same org from the same process or `Connection` instance.
- Do not add a mutex, semaphore, in-flight registry, promise chain, or org-ID admission check.
- Do not provide a wait option, queue, priority, timeout-to-acquire, coalescing mode, or retry control.
- When requests overlap, the endpoint decides which request proceeds. Core surfaces the result of each invocation.
- Detect the documented `UNKNOWN_EXCEPTION` error code and message together and map that response to a stable
  `ApexSymbolsRequestInProgressError`, while preserving the original server error as the cause and structured data.
- Do not retry the in-progress response. A later explicit caller invocation is a new request, not continuation of a
  queued request.

For raw streaming, an invocation remains active at the endpoint until its response body completes or transport work
is aborted. `cancel()`, early iterator return, timeouts, size failures, and parse failures must abort and clean up the
HTTP request promptly, but Core does not track or allocate an org-level slot.

## Critical Jsforce constraint

Do not implement the streaming API by returning `Connection.request(...).stream()`.

In the current `@jsforce/jsforce-node` dependency, `Transport.httpRequest()` always installs a `complete` listener.
`createHttpRequestHandlerStreams()` reacts to that listener by calling `readAll()` into a `MemoryWriteStream`.
Consequently, the promise side buffers the entire response even when a consumer reads the exposed stream. Merely
surfacing `StreamPromise.stream()` would retain the OOM risk.

The transport spike established that Jsforce's low-level request function emits chunks without buffering when no
`complete` listener is attached. It is still insufficient: destroying the exposed duplex does not propagate to the
underlying Undici fetch controller, and a controlled test showed that the server request remained active. That would
leave the endpoint's cross-session in-flight request occupied after consumer cancellation.

The selected implementation is a narrowly scoped functional transport in Core using `undici.fetch` directly:

- Add `undici` as a direct dependency rather than relying on Jsforce's transitive installation.
- Use the patched Undici 8.x line. Core's declared Node runtime floor is intentionally raised from Node 22.0 to Node
  22.19 to satisfy Undici's engine requirement. The initial audited resolution is Undici 8.10.0. Jsforce's separate
  transitive Undici remains outside this call path and outside the scope of this change.
- Define no transport class. Isolate fetch, proxy-agent creation, abort handling, decompressed-byte counting, and
  cleanup in `src/org/apexSymbolsTransport.ts`.
- Supply the current Connection access token, Sforce call options, SFDX headers, explicit `httpProxy`, and standard
  proxy environment behavior.
- Use an owned `AbortController` so caller abort, `cancel()`, early iterator return, total timeout, idle timeout, and
  size failures terminate the underlying request and release the socket.
- Use plain `fetch`, which has no automatic HTTP retry. Do not use Undici retry interceptors or agents.
- Do not implement auth refresh-and-replay. Surface HTTP 401 from the single request.
- Keep response status, headers, and raw body available to the endpoint adapter, with bounded error-body handling.

Controlled local tests must continue proving early chunk delivery, server-observed cancellation, one request for HTTP
420, incremental decompressed-byte limits, idle timeout, and pre-abort before dispatch.

## Proposed public API

Names are proposed and should receive API review before implementation.

### Data-only request types

Add `src/org/apexSymbols.ts` containing no classes:

```ts
export const apexSymbolCategories = ['BUILTIN', 'DATABASE', 'DYNAMIC'] as const;
export type ApexSymbolCategory = (typeof apexSymbolCategories)[number];

export type ApexSymbolsRequest = {
  readonly category: ApexSymbolCategory;
  readonly namespace?: string;
  readonly name?: string;
};
```

`undefined` omits an optional query parameter. Do not trim, split, case-fold, or reinterpret `namespace` or `name` in
Core. URL construction must use `URL`/`URLSearchParams` so reserved characters are encoded correctly.

The API is intentionally Apex-specific. Representative request shapes are:

```ts
// Standard Apex class.
{ category: 'BUILTIN', namespace: 'System', name: 'String' }

// An org-defined Apex class in the org's default namespace.
{ category: 'DATABASE', name: 'MyClass' }

// An installed-package Apex class.
{ category: 'DATABASE', namespace: 'MyPackage', name: 'MyClass' }

// An exact dynamic Apex class lookup.
{ category: 'DYNAMIC', name: 'MyDynamicClass' }

// Broad discovery of org-defined and installed-package Apex types.
{ category: 'DATABASE' }

// Broad discovery of dynamic Apex types.
{ category: 'DYNAMIC' }
```

The response describes Apex symbols, signatures, type relationships, and available documentation. It does not imply
that Apex source is available. `DYNAMIC` uses the same typed `TYPE_STUB` envelope and streaming representation; it
does not require a separate method or response model.

### Request controls

```ts
export type ApexSymbolsTransportControls = {
  /** Total time allowed, including time to first byte. */
  readonly timeoutMs?: number;
  /** Maximum idle time between response chunks. */
  readonly idleTimeoutMs?: number;
  /** Maximum decompressed response bytes. */
  readonly maxResponseBytes?: number;
  readonly signal?: AbortSignal;
};

export type ApexSymbolsMaterializedControls = ApexSymbolsTransportControls & {
  readonly mode: 'materialized';
  /** Maximum number of type stubs materialized for TYPE_STUB responses. */
  readonly maxTypeStubs?: number;
  /** Maximum serialized size of one decompressed type stub. */
  readonly maxStubBytes?: number;
};

export type ApexSymbolsStreamControls = ApexSymbolsTransportControls & {
  readonly mode: 'stream';
};

export type ApexSymbolsRequestControls = ApexSymbolsMaterializedControls | ApexSymbolsStreamControls;

export type ApexTypeStubIterationOptions = {
  /** Maximum decompressed bytes accepted from a generic input iterator. */
  readonly maxResponseBytes?: number;
  /** Maximum number of stubs emitted or materialized. */
  readonly maxTypeStubs?: number;
  /** Maximum serialized size of one decompressed stub. */
  readonly maxStubBytes?: number;
  readonly signal?: AbortSignal;
};
```

- `mode` is the required discriminator whenever controls are supplied.
- Omitting controls is shorthand for bounded materialization with documented defaults; it does not create a third
  union member with an optional discriminator.
- `maxTypeStubs` and `maxStubBytes` are valid only for `mode: 'materialized'`. Raw streaming applies transport byte
  limits; callers parsing a raw stream pass item limits separately to `iterateApexTypeStubs()`.
- Do not accept objects that mix fields from both union members or silently infer a mode from the fields present.

- Resolve the internal route version with `await connection.retrieveMaxApiVersion()`.
- Do not accept an API version in `ApexSymbolsRequest`, `ApexSymbolsRequestControls`, method overloads, or another
  public request option.
- Build the URL with the internally resolved version without calling `setApiVersion()` or `useLatestApiVersion()`.
- Initial defaults are a 30-minute total timeout, 60-second idle timeout, 512 MiB raw-stream response limit, and 64
  MiB materialized response limit. Confirm or revise them with the benchmark task before API review.
- Initial materialization defaults are 10,000 type stubs and 8 MiB per type stub. Confirm or revise them with the
  benchmark task before API review.
- Do not add retry, wait, queue, coalescing, or local admission controls.
- Count decompressed bytes because those determine parser and heap pressure. Reject early from `content-length` only
  for an unencoded response; compressed length does not describe decompressed heap pressure. Always enforce the
  incremental decompressed limit because length may be absent, misleading, or compressed.

### Bounded materialization

Add overloads to the existing `Connection`:

```ts
public retrieveApexSymbols(
  request: ApexSymbolsRequest,
  controls?: ApexSymbolsMaterializedControls
): Promise<ApexTypeStubResponse>;

public retrieveApexSymbols(
  request: ApexSymbolsRequest,
  controls: ApexSymbolsStreamControls
): Promise<ApexSymbolsStreamResponse>;

public retrieveApexSymbols(
  request: ApexSymbolsRequest,
  controls: ApexSymbolsRequestControls
): Promise<ApexTypeStubResponse | ApexSymbolsStreamResponse>;
```

- `TYPE_STUB` is implicit and is the sole response contract. The request does not expose `format`.
- `mode: 'materialized'` and omitted controls return the bounded materialized response; `mode: 'stream'` returns the
  raw streaming response. The overloads must preserve that return-type distinction.
- The union overload supports callers whose control value is itself typed as `ApexSymbolsRequestControls`. Callers
  passing a literal or narrowed union member resolve through the earlier precise overload; an unnarrowed union
  returns `ApexTypeStubResponse | ApexSymbolsStreamResponse`.
- Materialization must be built on the bounded streaming path, not `Connection.request()`.
- Abort and throw an existing `SfError` with a stable name when the decompressed-byte limit is crossed.
- Do not silently truncate or return partial JSON.
- Preserve all server fields, including unknown additive fields. Runtime schema normalization belongs to consumers.

### Raw streaming

Expose a plain-object response rather than a new response class:

```ts
export type ApexSymbolsStreamResponse = {
  readonly apiVersion: string;
  readonly statusCode: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: AsyncIterable<Uint8Array>;
  readonly cancel: (reason?: unknown) => void;
};
```

- `ApexSymbolsStreamResponse` is returned by `retrieveApexSymbols(..., { mode: 'stream' })`; do not add a separate
  `streamApexSymbols()` method.
- The stream contains the JSON encoding of the same `TYPE_STUB` contract. It exists to support incremental,
  low-memory consumption rather than to expose alternate response formats.
- Apply byte limits, total timeout, idle timeout, caller abort, and backpressure while streaming.
- Stopping iteration early must abort the HTTP request and release sockets/listeners.
- Do not log response bodies or authorization headers.
- Expose request ID and Salesforce limit headers through `headers` for diagnostics.

### Incremental `TYPE_STUB` consumption

Export a functional async generator for consumers that need broad typed results without accumulating the envelope:

```ts
export const iterateApexTypeStubs = (
  body: AsyncIterable<Uint8Array>,
  options?: ApexTypeStubIterationOptions
): AsyncIterable<ApexTypeStub> => ...;
```

- Parse and emit elements of the top-level `typeStubs` array one at a time.
- Use a maintained streaming JSON parser after dependency and bundle review. Do not implement JSON tokenization with
  regular expressions or an ad hoc parser.
- Respect backpressure: do not parse the next stub until the consumer requests it.
- Bound total decompressed bytes and the maximum serialized size of one stub.
- Reject malformed envelopes, unexpected top-level shapes, truncated JSON, and trailing non-whitespace content.
- Preserve `compileError` stubs as values. Parsing must not filter them.
- Keep runtime canonicalization and Effect validation outside Core.

The selected parser is `@streamparser/json`. It is dependency-free, dual CommonJS/ESM, includes TypeScript
declarations, supports Node and browser runtimes, and is MIT licensed. The iterator uses its `$.typeStubs.*` path
filter with `keepStack: false`, so completed siblings are not retained. Core feeds bounded subchunks into the
synchronous parser and drains emitted values before reading more input, preserving source-level backpressure without
introducing a parser or response class.

`retrieveApexSymbols()` for `TYPE_STUB` may collect this iterator after enforcing the materialization limit. Broad
consumers should use `retrieveApexSymbols(..., { mode: 'stream' })` plus `iterateApexTypeStubs()` or a convenience
iterator added after API review.

## Raw `TYPE_STUB` contracts

Define readonly TypeScript types for:

- `ApexTypeStubResponse`
- `ApexTypeStub`, including recursive `innerTypes` and top-level `typeParameters`
- `ApexMethodStub`
- `ApexFieldStub`
- `ApexPropertyStub`
- `ApexAccessorStub`
- `ApexParameterStub`
- `ApexAnnotationStub`
- `ApexAnnotationParameterStub`
- recursive `ApexTypeReference`
- `ApexTypeKind`

Model observed nullable and omitted fields honestly. Do not normalize missing arrays to empty arrays in Core. The
wire contract should be permissive of additive server fields at runtime even though the exported TypeScript types
describe known fields.

## Errors and retry behavior

### Preserve server outcomes

- HTTP 200 plus an empty array is a miss.
- HTTP 200 plus a stub with `compileError` is a found but incomplete stub.
- HTTP 404 becomes `ApexSymbolsEndpointUnavailableError` for the internally selected server-maximum REST version,
  with the documented minimum org release of 264. Do not infer availability solely from REST API version.
- HTTP 403 `INVALID_INPUT` is a request-contract failure.
- Authentication, authorization, network, and malformed-response failures remain operational failures.

### Local bounded-stream errors

Use the existing `SfError` rather than defining error classes. Assign stable names and structured data for at least:

- `ApexSymbolsResponseTooLargeError`
- `ApexSymbolsRequestTimeoutError`
- `ApexSymbolsRequestAbortedError`
- `ApexSymbolsIdleTimeoutError`
- `ApexSymbolsMalformedResponseError`
- `ApexSymbolsEndpointUnavailableError`
- `ApexSymbolsRequestInProgressError`
- `ApexSymbolsRequestError`
- `ApexSymbolsInvalidControlError`

### One-attempt failure behavior

- Each valid, non-pre-aborted invocation makes exactly one HTTP attempt. Core does not suppress a call because another
  request appears to be active locally; the endpoint owns that decision across sessions.
- Disable transport retries for this call path, including retries for network errors, timeouts, HTTP 401, 420/429,
  5xx responses, and the documented org-level in-progress response.
- Do not refresh authentication and replay a failed symbols request. A 401 is surfaced as the outcome of that attempt.
- A later explicit invocation by the caller is a new request. Core never schedules one as a continuation of a failed
  invocation.
- Preserve the original server error as the cause of any stable Core error mapping.

## Implementation sequence

### 1. Contract and query construction

- Add the Apex category, request, response, and stub types in `src/org/apexSymbols.ts`.
- Add a pure URL builder that accepts instance URL, numeric API version, and request fields.
- Represent top-level generic type parameters observed on `System.List`.
- Export the public types and constants from `src/index.ts`.
- Add unit tests for all categories; standard `System.String`; an unnamespaced org-defined class; a
  namespace-qualified installed-package class; exact and broad dynamic Apex class requests; omitted filters; URL
  encoding; and internal server-maximum version selection.

### 2. Non-buffering transport spike and decision

- Record the Jsforce `complete` listener and `MemoryWriteStream` buffering path as the reason not to use
  `Connection.request().stream()`.
- Record the controlled finding that Jsforce's raw stream emits early bytes but does not propagate destruction to the
  underlying request.
- Use the selected Core-owned functional `undici.fetch` transport and direct dependency.
- Verify proxy behavior, gzip decoding, chunked transfer, server-observed abort, bounded error handling, and that no
  transport retry or auth-refresh replay exists on this call path.
- Do not proceed to API review until the memory regression proves heap usage does not scale with streamed response
  size.

### 3. Bounded raw stream

- Implement the `mode: 'stream'` branch of `Connection.retrieveApexSymbols()` on the chosen transport, without a
  local concurrency registry or lock.
- Add total and idle timers, `AbortSignal` composition, decompressed-byte counting, and deterministic cleanup.
- Abort transport work promptly on every terminal path so an abandoned stream does not unnecessarily retain the
  endpoint-owned in-flight request.
- Bound error bodies separately so a failed HTTP response cannot become another unbounded allocation.
- Add diagnostic summary logging: category, whether filters are present, API version, status, time to
  first byte, total time, decompressed bytes, and request ID. Never log names, response bodies, or credentials by
  default.

### 4. Incremental `TYPE_STUB` parser

- Evaluate a maintained streaming JSON parser for Node 22, TypeScript declarations, browser/bundle impact, license,
  security posture, and backpressure behavior. The normal minimum-module-age rule is explicitly waived for this
  effort, but maintenance and security review still apply.
- Implement `iterateApexTypeStubs()` as an async generator.
- Add per-item and total limits and malformed/truncated input handling.
- Verify that consumer cancellation aborts parsing and the upstream HTTP request.

### 5. Bounded materialized convenience API

- Implement the omitted-controls and `mode: 'materialized'` branches of `Connection.retrieveApexSymbols()` by
  consuming the bounded internal stream.
- Return `ApexTypeStubResponse`; no materialized path returns `unknown`.
- Choose and document finite defaults based on benchmarks.
- Verify the method never changes `connection.version`.
- Map route-level 404 to the stable v264 minimum-release availability error without misclassifying other failures.

### 6. Documentation and consumer handoff

- Add public API examples for exact `BUILTIN`, exact unnamespaced `DATABASE`, exact namespace-qualified `DATABASE`,
  exact `DYNAMIC`, broad `DATABASE`, broad `DYNAMIC`, cancellation, and size-limit failures.
- Show both discriminated control modes and document that omitted controls mean bounded materialization.
- Document `DYNAMIC` as the category for dynamic Apex classes, distinct from `DATABASE`, and make clear that Core
  does not perform cross-category fallback or merge results.
- Document that broad `DATABASE` requests can be expensive and can serialize with other symbol generation in the org.
- Document the difference between miss and `compileError`.
- Update the Apex stub fetcher to use Core only in a separate consumer change after the Core API is released.
- Update Services SVC-11/SVC-12 to consume Core rather than construct the endpoint URL directly.

## Test plan

### Unit tests

- Every category under the implicit `TYPE_STUB` contract, and absence of a `format` query parameter.
- Discriminated-control typing and runtime behavior: omitted controls and `mode: 'materialized'` return materialized
  values; `mode: 'stream'` returns `ApexSymbolsStreamResponse`; fields belonging to the other branch are rejected.
- Exact standard-class lookup for `System.String`, an unnamespaced org-defined Apex class lookup, and a
  namespace-qualified installed-package Apex class lookup. Assert that Core preserves the requested namespace and
  class name and maps the returned type stubs without treating them as source.
- Exact dynamic Apex class hit and miss, plus a broad `DYNAMIC` response containing multiple type stubs. Assert that
  Core sends `category=DYNAMIC`, preserves optional namespace/name filters, uses the same response contract, and does
  not issue an implicit `DATABASE` or `BUILTIN` request.
- Internal server-maximum API-version resolution; the shared connection version remains unchanged and there is no
  caller version override.
- A pre-v264 org advertising the same maximum REST version as a v264 org: route 404 is unavailable and route 200 is
  available. This test must prove there is no REST-version-only gate.
- A connection configured below the endpoint's route version that succeeds through the internally selected server
  maximum.
- Exact miss, one stub, multiple stubs, recursive inner types, recursive generics, triggers, and compile errors.
- One-byte and irregular chunk boundaries across every JSON token type.
- Gzip-decoded input where the decompressed limit is larger than the compressed input.
- No `content-length`, misleading `content-length`, and early length rejection when available.
- Total timeout before headers, idle timeout mid-body, caller abort, and consumer early return.
- Backpressure with a deliberately slow consumer.
- Oversized total response and oversized single stub.
- Malformed envelope, truncated array, invalid JSON, and bounded HTTP error bodies.
- Concurrent and identical calls through the same `Connection`, and through separate connections for the same org,
  each dispatch once; Core does not serialize, reject locally, or coalesce them.
- The documented server `UNKNOWN_EXCEPTION` body maps to `ApexSymbolsRequestInProgressError` and preserves the cause.
- Streaming completion, early return, cancellation, timeout, size failure, and transport failure all clean up the
  underlying request promptly.
- Network failure, timeout, HTTP 401, 420/429, 5xx, and server-busy cases each invoke the transport exactly once.
- Listener/socket cleanup on success, failure, timeout, size limit, and cancellation.

### Memory regression test

- Generate a synthetic chunked `TYPE_STUB` response substantially larger than the test process heap budget.
- Run the iterator in a child process with a deliberately small `--max-old-space-size`.
- Consume one stub at a time without retaining them and assert completion plus bounded peak RSS.
- Run the bounded materialized API against the same stream and assert a deterministic
  `ApexSymbolsResponseTooLargeError`, not process OOM.
- Include a single oversized stub to prove the per-item limit works.

## Benchmark and defaults decision

These are development-time measurements, not committed live-org tests. Use manually captured measurements and
representative mocked or synthetic responses when selecting public defaults. Measure at least:

- Exact small `DATABASE` hit and miss.
- Exact small `DYNAMIC` hit and miss.
- Exact large `BUILTIN` such as `System.String`.
- Broad `DATABASE` with hundreds of types.
- Broad `DYNAMIC` with representative mocked or captured payloads.
- Broad `BUILTIN` where permitted.
- Slow time-to-first-byte and slow-body simulations.

Choose finite defaults that allow normal exact requests and provide clear guidance for broad streaming. Record the
measurements and rationale in the PR. Raising a materialization limit must be explicit; streaming must remain the
recommended broad-query path.

## Acceptance criteria

- No new classes are introduced.
- The endpoint is documented and enforced as requiring org core release 264 or later without pretending that a REST
  API version identifies the org core release.
- Consumers can retrieve symbols for standard Apex classes, org-defined Apex classes, namespace-qualified
  installed-package Apex classes, and dynamic Apex classes through one Apex-specific API.
- Consumers can request every Apex category and omit or provide namespace/name filters without selecting a format.
- Exact and broad `DYNAMIC` requests use the same public API and typed `TYPE_STUB` response as the other Apex
  categories, without implicit fallback, fan-out, or merging.
- The API clearly represents returned data as Apex type stubs/symbols and never as Apex source code.
- `TYPE_STUB` requests have complete public TypeScript wire types, including top-level generic parameters.
- Materialized requests always return `ApexTypeStubResponse`; explicit streaming returns the raw bytes for that same
  response contract.
- Exact requests have a convenient bounded materialized API.
- Broad responses can be consumed incrementally with backpressure and without whole-response buffering.
- `ApexSymbolsRequestControls` is a discriminated union with only `mode: 'materialized'` and `mode: 'stream'`; the
  selected mode determines the return type and valid limits through the single `retrieveApexSymbols()` entry point.
- Finite byte, item, total-time, idle-time, and per-item protections fail deterministically before OOM.
- Cancellation aborts network work and releases resources.
- Concurrent invocations each dispatch exactly once; Core performs no local admission, serialization, queueing, or
  coalescing.
- Every valid, non-pre-aborted invocation makes one HTTP attempt; Core performs no retry or auth-refresh replay for
  any failure.
- The documented server-side in-progress error is surfaced as a stable error without retry.
- Proxy behavior, Salesforce headers, and diagnostics are preserved.
- The implementation never mutates the configured API version on the shared `Connection`.
- The public request and controls types contain no API-version selector; Core resolves the server maximum internally.
- Availability is established from the actual request result, not REST API version alone.
- Tests prove that heap usage does not grow with total streamed response size.
- Existing `Connection.request()` behavior and existing consumers remain unchanged.

## Open contract items

- Whether a future endpoint version will introduce another response shape that warrants a separate API revision.
- Whether the endpoint will add server-side pagination, cursoring, limits, or record framing.
- Whether an empty `namespace` has distinct semantics from an omitted namespace.
- Whether the server can expose a more specific reason than the current generic `compileError` string.
