import { expect } from 'chai';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { Logger } from '../../src/logger/logger';
import { AuthInfo } from '../../src/org/authInfo';
import { Connection } from '../../src/org/connection';
import { Org } from '../../src/org/org';
import { Lifecycle } from '../../src/lifecycleEvents';
import { RpcServer } from '../../src/rpcServer';

describe('RpcServer', () => {
  let rpcServer: RpcServer;
  let server: ReturnType<typeof createServer>;

  beforeEach(() => {
    rpcServer = new RpcServer();
    server = createServer(rpcServer['requestHandler'].bind(rpcServer));
  });

  afterEach(() => {
    server.close();
  });

  it('should handle /authInfo endpoint', (done) => {
    const username = 'test@example.com';
    const request = new IncomingMessage(null);
    request.url = `/authInfo?username=${username}`;
    const response = new ServerResponse(request);

    response.on('finish', () => {
      expect(response.statusCode).to.equal(200);
      done();
    });

    server.emit('request', request, response);
  });

  it('should handle /connection endpoint', (done) => {
    const username = 'test@example.com';
    const request = new IncomingMessage(null);
    request.url = `/connection?username=${username}`;
    const response = new ServerResponse(request);

    response.on('finish', () => {
      expect(response.statusCode).to.equal(200);
      done();
    });

    server.emit('request', request, response);
  });

  it('should handle /org endpoint', (done) => {
    const username = 'test@example.com';
    const request = new IncomingMessage(null);
    request.url = `/org?username=${username}`;
    const response = new ServerResponse(request);

    response.on('finish', () => {
      expect(response.statusCode).to.equal(200);
      done();
    });

    server.emit('request', request, response);
  });

  it('should handle /lifecycle endpoint', (done) => {
    const eventName = 'testEvent';
    const request = new IncomingMessage(null);
    request.url = `/lifecycle?eventName=${eventName}`;
    const response = new ServerResponse(request);

    response.on('finish', () => {
      expect(response.statusCode).to.equal(200);
      done();
    });

    server.emit('request', request, response);
  });

  it('should return 404 for unknown endpoints', (done) => {
    const request = new IncomingMessage(null);
    request.url = '/unknown';
    const response = new ServerResponse(request);

    response.on('finish', () => {
      expect(response.statusCode).to.equal(404);
      done();
    });

    server.emit('request', request, response);
  });

  it('should return 500 for internal server errors', (done) => {
    const request = new IncomingMessage(null);
    request.url = '/authInfo';
    const response = new ServerResponse(request);

    response.on('finish', () => {
      expect(response.statusCode).to.equal(500);
      done();
    });

    server.emit('request', request, response);
  });
});
