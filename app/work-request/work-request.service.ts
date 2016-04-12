import {Injectable} from 'angular2/core';
import {StompService} from '../stomp/stomp.service';

import {WorkRequest} from './work-request.model';
import {WorkRequestMessage} from './work-request-message.model';
import id = webdriver.By.id;

@Injectable()
export class WorkRequestService {

  private _request_destination:string = '/exchange/work_request/';

  private _response_destination:string = 'wrr_';
  private _response_handler:any = null;

  public workRequests:any;
  public workRequestsSummary:any;

  constructor(private _stompService:StompService) {
    this.workRequests = [];
    this.workRequestsSummary = {};
    this.workRequestsSummary.customer = {PENDING: 0, COMPLETED: 0, FAILED: 0};
    this.workRequestsSummary.transaction = {PENDING: 0, COMPLETED: 0, FAILED: 0};
  }

  public initialize():Promise<{}> {
    let p = new Promise((resolve) => {

      // TODO: Check if this should be changed for some kind of event to know when the connection its ready.
      var intervalId = setInterval(() => {
        if (this._stompService.isConnected) {
          console.log("Requesting to create queue");
          this.registerResponseQueue();
          clearInterval(intervalId);
          resolve();
        }
      }, 1000);

    });

    return p;
  }

  /**
   * Registers a new unique queue for responses.
   */
  private registerResponseQueue() {

    if (this._response_handler === null) {
      // Creates the reply queue
      this._response_destination += Math.random().toString(36).substr(0, 15);
      let reply_to_headers = {"auto-delete": true, "exclusive": true};
      this._stompService.send('/queue/' + this._response_destination, "", reply_to_headers);

      // Registers to the reply queue.
      this._stompService.subscribe(this._response_destination, (message:string, headers:any) => {
        let response:any = JSON.parse(message);
        let workRequestId:number = headers['correlation-id'];

        for (let i = 0; i < this.workRequests.length; i++) {
          if (this.workRequests[i].id == workRequestId) {
            let workRequest:WorkRequest = this.workRequests[i].workRequest;
            workRequest.response = response;

            if (response.state == 'ok') {
              this.workRequestsSummary[workRequest.module].PENDING--;
              this.workRequestsSummary[workRequest.module].COMPLETED++;
            } else {
              this.workRequestsSummary[workRequest.module].PENDING--;
              this.workRequestsSummary[workRequest.module].FAILED++;
            }
          }
        }
      });
    }
  }

  /**
   * Requests information for a list of customers.
   * @param customerList
   */
  getCustomers(customerList:string) {
    if (customerList != '') {
      let customerListArray = customerList.split(",");
      customerListArray.forEach((item) => {
        let workRequest = new WorkRequest("customer", "getCustomerInfo");
        workRequest.request = {"username": item, "companyId": 9};
        this.processWorkRequest(workRequest);
      });
    }
  }

  /**
   * Generic function to process a work request.
   * @param workRequest
   */
  processWorkRequest(workRequest:WorkRequest) {
    this.workRequestsSummary[workRequest.module].PENDING++;

    let params = workRequest.request;
    params.module = workRequest.module;
    params.f = workRequest.f;

    let stompAccess = this._request_destination + workRequest.module + '.' + workRequest.f;
    let workRequestId = this._stompService.send(stompAccess, JSON.stringify(params), {"reply-to": this._response_destination});
    this.workRequests.push({"id": workRequestId, "request": workRequest});
  }
}