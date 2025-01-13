import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { Logger } from './logger/logger';
import { AuthInfo } from './org/authInfo';
import { Connection } from './org/connection';
import { Org } from './org/org';
import { Lifecycle } from './lifecycleEvents';

const PORT = 4000;

class RpcServer {
  private logger: Logger;

  constructor() {
    this.logger = Logger.childFromRoot('RpcServer');
  }

  public start() {
    const server = createServer(this.requestHandler.bind(this));
    server.listen(PORT, () => {
      this.logger.info(`RPC Server is listening on port ${PORT}`);
    });
  }

  private async requestHandler(req: IncomingMessage, res: ServerResponse) {
    const { pathname, query } = parse(req.url || '', true);
    this.logger.info(`Received request for ${pathname}`);

    try {
      switch (pathname) {
        case '/authInfo':
          await this.handleAuthInfo(query, res);
          break;
        case '/connection':
          await this.handleConnection(query, res);
          break;
        case '/org':
          await this.handleOrg(query, res);
          break;
        case '/lifecycle':
          await this.handleLifecycle(query, res);
          break;
        default:
          this.sendResponse(res, 404, { error: 'Not Found' });
      }
    } catch (error) {
      this.logger.error('Error handling request', error);
      this.sendResponse(res, 500, { error: 'Internal Server Error' });
    }
  }

  private async handleAuthInfo(query: any, res: ServerResponse) {
    const username = query.username;
    if (!username) {
      this.sendResponse(res, 400, { error: 'Missing username' });
      return;
    }

    try {
      const authInfo = await AuthInfo.create({ username });
      this.sendResponse(res, 200, { authInfo: authInfo.getFields() });
    } catch (error) {
      this.logger.error('Error creating AuthInfo', error);
      this.sendResponse(res, 500, { error: 'Internal Server Error' });
    }
  }

  private async handleConnection(query: any, res: ServerResponse) {
    const username = query.username;
    if (!username) {
      this.sendResponse(res, 400, { error: 'Missing username' });
      return;
    }

    try {
      const authInfo = await AuthInfo.create({ username });
      const connection = await Connection.create({ authInfo });
      this.sendResponse(res, 200, { connection: connection.getConnectionOptions() });
    } catch (error) {
      this.logger.error('Error creating Connection', error);
      this.sendResponse(res, 500, { error: 'Internal Server Error' });
    }
  }

  private async handleOrg(query: any, res: ServerResponse) {
    const username = query.username;
    if (!username) {
      this.sendResponse(res, 400, { error: 'Missing username' });
      return;
    }

    try {
      const org = await Org.create({ aliasOrUsername: username });
      this.sendResponse(res, 200, { org: org.getOrgId() });
    } catch (error) {
      this.logger.error('Error creating Org', error);
      this.sendResponse(res, 500, { error: 'Internal Server Error' });
    }
  }

  private async handleLifecycle(query: any, res: ServerResponse) {
    const eventName = query.eventName;
    if (!eventName) {
      this.sendResponse(res, 400, { error: 'Missing eventName' });
      return;
    }

    try {
      const listeners = Lifecycle.getInstance().getListeners(eventName);
      this.sendResponse(res, 200, { listeners: listeners.length });
    } catch (error) {
      this.logger.error('Error handling lifecycle event', error);
      this.sendResponse(res, 500, { error: 'Internal Server Error' });
    }
  }

  private sendResponse(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

const rpcServer = new RpcServer();
rpcServer.start();
