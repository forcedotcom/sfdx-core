# genericTimeout

Socket timeout occurred while listening for results.

# genericHandshakeTimeout

The streaming request failed to handshake at %s.

# handshakeApiVersionError

Invalid API version specified for streaming connection handshake: %s

# handshakeApiVersionError.actions

- Set the API version to match the org as an environment variable (e.g., SFDX_API_VERSION=XX.0).

# waitParamValidValueError

Invalid value was specified for wait. Please provide a wait value greater than %s minutes.

# invalidApiVersion

Invalid api version is being reported by config (apiVersion=%s).

# dpopStreamingUnsupported

The Streaming API doesn't accept DPoP-bound sessions, and the session for %s is DPoP-bound.

# dpopStreamingUnsupported.actions

- Run the command without streaming, if it has an option to poll instead.
- Or set SF_DISABLE_DPOP=true and log in to the org again with "sf org login web" to get a bearer session.
