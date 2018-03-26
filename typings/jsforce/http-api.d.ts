import { Connection, RequestInfo } from './connection';
import { EventEmitter } from 'events';

export interface HttpApiOptions {
    Name?: string;
    responseType?: string;
    transport?: object; // Type Me
    noContentResponse?: object; // Type me
}

export interface Header {
    key: string;
    value: string;
}

export interface HttpResponse {
    headers: Header[];
    body: string;
}

export class SessionRefreshDelegate {
    constructor(conn: Connection, options: HttpApiOptions);
    private refresh(since, callback: () => {}): void;
}

export class HttpApi extends EventEmitter {
    constructor(conn: Connection, options: HttpApiOptions);
    public request(request: RequestInfo, callback: () => {}): Promise<object>;
    public getRefreshDelegate(): SessionRefreshDelegate;
    protected beforeSend(request: RequestInfo): void;
    protected getResponseContentType(response: HttpResponse): string;
    protected parseResponseBody(response: HttpResponse): string;
    protected getResponseBody(response: HttpResponse): string;
    protected isSessionExpired(response: HttpResponse): boolean;
    protected isErrorResponse(response: HttpResponse): boolean;
    protected hasErrorInResponseBody(response: HttpResponse): boolean;
    protected parseError(body: string): string;
    protected getError(respomse: HttpResponse, body: string): Error;
    private parseJSON(str: string): string;
    private parseText(str: string): string;

}
