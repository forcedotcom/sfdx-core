
export interface OAuth2Options {
    authzServiceUrl?: string;
    tokenServiceUrl?: string;
    clientId?: string;
    clientSecret?: string;
    httpProxy?: string;
    loginUrl?: string;
    proxyUrl?: string;
    redirectUri?: string;
    refreshToken?: string;
    revokeServiceUrl?: string;
    authCode?: string;
    privateKeyFile?: string;
}

export class OAuth2 {
    constructor (options? : OAuth2Options);
    loginUrl: string;
    authzServiceUrl: string;
    tokenServiceUrl: string;
    revokeServiceUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;

    getAuthorizationUrl: (params: any) => string;
    refreshToken: (code: string, callback?) => Promise<any>;
    requestToken: (code: string, callback?) => Promise<any>;
    authenticate: (username: string, password: string, callback?) => Promise<any>;
    revokeToken: (accessToken: string, callback?) => Promise<any>;
}