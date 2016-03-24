import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';

import {StompMessage} from './stomp-message.model';
import {StompConfig} from './stomp-config.interface';

// External Javascript Objects, declare them so the compiler doesn't complain.
declare var Stomp;
declare var SockJS;

@Injectable()
export class StompService {

  _stomp_client: StompClient;

  _config: StompConfig;

  _current_subscriptions: StompSubscription[];

  constructor (
    private _http:Http
  ) {

    this._current_subscriptions = [];

    this.initialize();
  }

  /**
   * Initializes the STOMP Service
   */
  initialize() {
    this.getConfig().then(
      config => {
        this._config = config;
        let url = 'http://' + this._config.host + ":" + this._config.port + '/stomp';
        let ws = new SockJS(url);
        this._stomp_client = Stomp.over(ws);

        this._stomp_client.heartbeat.outgoing = this._config.heartbeat_out;
        this._stomp_client.heartbeat.incoming = this._config.heartbeat_in;

        this._stomp_client.connect(this._config.user, this._config.password, this.on_connect, this.on_error, this._config.virtual_host);
      })
  }

  /**
   * Asynchronously get the service configuration
   * @returns {Promise<R>}
   */
  getConfig() {

    // TODO: Async call to get the config.

    let config = {
      "host": "192.168.10.10",
      "port": 15674,
      "ssl": false,

      "user": "midas",
      "password": "midas",

      "virtual_host": "/",

      "heartbeat_in": 0,
      "heartbeat_out": 0
    };

    return Promise.resolve(config);

    /*return this._http.get('config/stomp.config.json')
      .map(res => res.json())
      .toPromise();*/
  }

  on_connect = function () {
    console.log('connected');
  };

  on_error = function () {
    console.log('error');
  };

  sendDirectMessage(destination: string, payload: any) {
    this._stomp_client.send(destination, {priority: 9}, payload);
  }

  subscribe(destination: string, callback) {

    let subscription:StompSubscription = this._stomp_client.subscribe(destination, callback);

    this._current_subscriptions.push(subscription);

    return subscription;
  }
}