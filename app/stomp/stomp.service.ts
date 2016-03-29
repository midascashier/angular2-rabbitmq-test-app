import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import 'rxjs/Rx';

import {StompConfig} from './stomp-config.interface';

// External Javascript Objects, declare them so the compiler doesn't complain.
declare var Stomp:StompStatic;
declare var SockJS:any;

@Injectable()
export class StompService {

  _stomp_client: StompClient;

  _config: StompConfig;

  _current_subscriptions: StompSubscription[];

  constructor (private _http:Http) {

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
      });
  }
  on_connect = function () {
    console.log('connected');
  };
  on_error = function () {
    console.log('error');
  };

  /**
   * Asynchronously get the service configuration
   * @returns {Promise<R>}
   */
  getConfig() {
    return this._http.get('/config/stomp.config.json')
      .map(res => res.json())
      .toPromise();
  }

  /**
   * Publishes a message to STOMP
   * @param destination
   * @param payload
   */
  send(destination: string, payload: any, parameters?: any) {

    if (!parameters) {    // TODO: Find out what other settings can go here.
      parameters = {priority: 9};
    }

    this._stomp_client.send(destination, parameters, payload);
  }

  /**
   * Subscribes to an STOMP feed.
   * @param destination
   * @param callback
   */
  subscribe(destination: string, callback:any) {

    let subscription:StompSubscription = this._stomp_client.subscribe(destination, (stompFrame: StompFrame) => {
      if (stompFrame.body){
        callback(stompFrame.body);
      }
    });

    this._current_subscriptions.push(subscription);

    return subscription;
  }
}