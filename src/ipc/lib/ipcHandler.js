// TODO: Refine IPC structure
const http = require('http');

module.exports = class IpcHandler {
  constructor(serverIP, serverPort) {
    this.serverIP = serverIP;
    this.serverPort = serverPort;
    this.events = {};
    this.ffmpegPath = '';
    this.extensionPath = '';
    this.userID = -1;
    this.userEmail = '';
    this.appId = '';
    this.appLocale = '';
    this.APPVersion = '';
    this.devMode = false;
    this.raven = null;
    this.requestQueue = [];
  }

  /**
   * serve the ipc
   * @return {void}
   **/
  serve() {
    const server = http
      .createServer((request, response) => {
        const eventName = request.url.split('/')[1].split('?')[0];

        if (eventName in this.events) {
          let body = '';
          request.on('data', data => {
            body += data;
          });
          if (request.method === 'GET') {
            this.processRequest(eventName, request, response, body);
          } else {
            request.on('end', () => {
              this.processRequest(eventName, request, response, body);
            });
          }
        }
      })
      .listen(this.serverPort, this.serverIP);
    server.on('error', err => {
      this.serverPort++;
      this.serve();
    });
    server.timeout = 0;
    console.log(`server running: ${this.serverIP}:${this.serverPort}`);
  }

  /**
   * process request got from http and call event function
   * @return {void}
   **/
  processRequest(eventName, request, response, body) {
    try {
      let data = '';
      let queueIndex = -1;
      if (request.method === 'GET') {
        let dataGET = {};

        request.url
          .split('/')[1]
          .split('?')[1]
          .split('&')
          .map(
            param =>
              (dataGET[param.split('=')[0]] = decodeURIComponent(
                param.split('=')[1]
              ))
          );
        data = JSON.stringify(dataGET);
      } else {
        data = body;
      }

      const currentUserID = this.userID;

        this.events[eventName](
          data,
          (eventName, payload, headers) => {
            this.emitEvent(request, response, payload, headers, queueIndex);
          },
          currentUserID,
          response,
          request,
          this
        );

    } catch (error) {
      console.log(error);
      this.sendRavenError(error);
    }
  }

  /**
   * listen for an event
   * @param {string} eventName - event name we can to listen
   * @param {function} callback - call back function of event including parameters (data, emiter)
   * @return {void}
   **/
  listenForEvent(eventName, callback) {
    this.events[eventName] = callback;
  }
  /**
   * emit an event to front
   * @param {any} request - http request object
   * @param {any} response - http response
   * @param {any} data - data we got from post
   * @return {void}
   **/
  emitEvent(request, response, data, headers, queueIndex) {
    let headersToSend = {};
    if (!headers) {
      headersToSend = { 'Content-Type': 'text/plain' };
    } else {
      headersToSend = headers;
    }
    request.resume();
    response.writeHead(200, headersToSend);
    response.end(JSON.stringify(data));
  }

  /**
   * config and install raven sentry
   * @param {any} Raven - raven object ref
   * @return {void}
   **/
  configRaven(Raven) {
    if (this.userID >= 0 && '' !== this.host && null === this.raven) {
      this.raven = Raven;
    }
  }

  /**
   * send raven exception error
   * @param {any} error - the error object that thrown
   * @return {void}
   **/
  sendRavenError(error) {
    if (this.devMode && null !== this.raven) {
      this.raven.captureException(error);
      this.raven.setContext({
        user: {
          email: this.userEmail,
          id: this.userID,
          host: this.appId,
          hostVersion: this.appVersion,
          language: this.appLocale,
          appVersion: this.APPVersion
        },
        origin: 'ipc'
      });
    }
  }
};
