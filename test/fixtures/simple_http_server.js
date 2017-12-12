const http = require('http');

export default class SimpleServer {
  constructor(port = 7000) {
    this.port = port;
    this.mockRequestHandler();

    this.server = http.createServer(async(req, res) => {
      res.writeHead(this.requestHandler.statusCode, this.requestHandler.headers);
      res.end(await this.requestHandler.dataCreator(req));
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.server.close(resolve);
    });
  }

  listen() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, resolve);
    });
  }

  get url() {
    return `http://localhost:${this.port}`;
  }

  mockRequestHandler(statusCode, headers, dataCreator) {
    this.requestHandler = new MockRequestHandler({ statusCode, headers, dataCreator });
    return this.requestHandler;
  }
}

function MockRequestHandler({ statusCode = 500, headers = {}, dataCreator = req => {} }) {
  if (this instanceof MockRequestHandler) {
    this.statusCode = statusCode;
    this.headers = headers;
    this.dataCreator = dataCreator;
    return this;
  }
  return new MockRequestHandler({ statusCode, headers, dataCreator });
}

MockRequestHandler.prototype.setStatusCode = function(statusCode) {
  this.statusCode = statusCode;
  return this;
};

MockRequestHandler.prototype.addHeader = function(name, value) {
  this.headers[name] = value;
  return this;
};

MockRequestHandler.prototype.setHeaders = function(headers) {
  this.headers = headers;
  return this;
};

MockRequestHandler.prototype.echoResponse = function() {
  return this.setDataCreator(
    req =>
      new Promise((resolve, reject) => {
        const body = [];
        req
          .on('data', chunk => body.push(chunk))
          .on('end', () => resolve(Buffer.concat(body).toString()))
          .on('error', err => reject(err));
      })
  );
};

MockRequestHandler.prototype.textResponse = function(text) {
  return this.setDataCreator(req => text);
};

MockRequestHandler.prototype.setDataCreator = function(dataCreator) {
  this.dataCreator = dataCreator;
  return this;
};
