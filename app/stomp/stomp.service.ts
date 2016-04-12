import {Injectable} from 'angular2/core';

import {Http} from 'angular2/http';

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subscription} from 'rxjs/Subscription';
import {StompConfig} from './stomp-config.interface';
import 'rxjs/Rx';

// External Javascript Objects, declare them so the compiler doesn't complain.
declare var Stomp:StompStatic;
declare var SockJS:any;

@Injectable()
export class StompService {

  // Flag to know if there's a valid connection to the broker.
  public isConnected:boolean = false;

  // Configuration for RabbitMQ/Stomp
  public config:StompConfig = null;

  // Stomp Client
  private client:StompClient = null;

  // Resolve Promise made to calling class, when connected
  private resolvePromise:{ (...args:any[]):void };

  // Counter for the objects sent to the client.
  private _message_id:number = 1;

  /**
   * Class Constructor
   **/
  constructor(private _http:Http) {
  }

  /**
   * Initializes the service. Will create a connection with the broker and let the calling object know when it's ready.
   */
  public initialize() {
    let p = new Promise((resolve) => {
      let c = this.configure();
      c.then(() => {
        let tc = this.try_connect();
        tc.then(() => {
          resolve();
        });
      });
    });
    return p;
  }

  /**
   * Perform connection to STOMP broker, returning a Promise
   * which is resolved when connected.
   */
  public try_connect():Promise<{}> {

    if (this.client === null) {
      throw Error("Client not configured!");
    }

    // Attempt connection
    this.client.connect(this.config.user, this.config.password, this.on_connect, this.on_error, this.config.virtual_host);

    return new Promise(
      (resolve) => {
        this.isConnected = true;
        this.resolvePromise = resolve;
      }
    );
  }

  /**
   * After a successful connection, let the caller know.
   */
  public on_connect = () => {
    // Resolve our Promise to the caller
    this.resolvePromise();

    // Clear callback
    this.resolvePromise = null;
  }

  /**
   * Disconnect the STOMP client and clean up
   */
  public disconnect() {
    this.client.disconnect();
  }

  /**
   * Handle errors from stomp.js
   * @param error
   */
  public on_error = (error:string) => {

    // Check for dropped connection and try reconnecting
    if (error.indexOf("Lost connection") != -1) {

      // Attempt reconnection
      console.log("Reconnecting in 5 seconds...");
      setTimeout(() => {
        this.configure()
          .then(() => {
            this.try_connect();
          });
      }, 5000);
    }
  }

  /**
   * Publishes a message to STOMP
   * @param destination
   * @param payload
   * @param parameters
   */
  public send(destination:string, payload:any, parameters?:any):number {

    if (!parameters) {
      parameters = {};
    }
    let correlation_id = this._message_id++;
    parameters.correlation_id = correlation_id;
    this.client.send(destination, parameters, payload);

    return correlation_id;
  }

  /**
   * Subscribes to an STOMP feed.
   * @param destination
   * @param callback
   */
  public subscribe(destination:string, callback:any):Subscription {

    let source = new Observable((observer:Observer<StompFrame>)=> {
      let stomp_subscription = this.client.subscribe(destination, (stompFrame:StompFrame) => {
        observer.next(stompFrame);
      });
      return () => {
        console.log("Removing Subscription");
        stomp_subscription.unsubscribe();
      }
    });

    let obs_subscription:Subscription = source.subscribe(
      (value:any) => {
        callback(value);
      },
      (err:string) => {
        console.log('Error: %s', err)
      },
      () => {
        console.log("onCompleted");
      }
    );

    return obs_subscription;
  }

  /**
   * Un-subscribes a current subscription.
   * @param subscription
   */
  public unsubscribe(subscription:StompSubscription) {
    subscription.unsubscribe();
  }

  /**
   * Configure the STOMP Service
   */
  public configure() {

    return this.getConfig().then(config => {
      if (config === null && this.config === null) {
        throw Error("No configuration provided!");
      }

      if (config != null) {
        this.config = config;
      }

      let url = 'http://' + this.config.host + ":" + this.config.port + '/stomp';
      let ws = new SockJS(url);
      this.client = Stomp.over(ws);

      this.client.heartbeat.outgoing = this.config.heartbeat_out;
      this.client.heartbeat.incoming = this.config.heartbeat_in;

      // this.client.debug = null; // Disables the messaging, can be set to a custom function to decide when to log.
    });
  }

  /**
   * Asynchronously get the service configuration
   * @returns {Promise<R>}
   */
  public getConfig():Promise<StompConfig> {
    if (this.config) {
      return Promise.resolve(this.config);
    } else {
      return this._http.get('/config/stomp.config.json')
        .map(res => res.json())
        .toPromise();
    }
  }
}