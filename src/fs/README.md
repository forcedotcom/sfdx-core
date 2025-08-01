# Isomorphic filesystem support

We want to support web and nodejs use of this library.

fs.ts is meant to work in both scenarios.

memfs is a **nearly** drop-in replacement for node:fs, with some inconsistencies.

VirtualFS type should be an intersection type (the commonality between node:fs and memfs).

- it can be more restrictive or more open as needed

Then we can provide any overrides necessary to deal with the inconsistencies.

That way, consumers can use import our `fs` module instead of `node:fs` and use it comfortably. So other libraries can then become isomorphic without a lot of work

We, as a library, should handle the type complexity so that it's solid and reliable for consumers. minimal complexity is OK in the library, especially in types, since they are dev-time only.

## ruled out

Any kind of use of Proxy
