import {Injectable} from 'angular2/core';
import {StompService} from '../stomp/stomp.service';

import {WorkRequest} from './work-request.model';

@Injectable()
export class WorkRequestService {

  private _request_destination:string = '/exchange/work_request/';
  private _response_destination:string = 'wrr_';

  public workRequests:WorkRequest[];
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
          this.registerResponseQueue();
          clearInterval(intervalId);
          resolve();
        }
      }, 1000);

    });

    return p;
  }

  /**
   * Requests information for a list of customers.
   * @param customerList
   */
  public getCustomers(customerList:string) {
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
   * Requests information for a list of journals.
   * @param journalList
   */
  public getTransactions(journalList:string) {
    if (journalList != '') {
      let journalListArray = journalList.split(",");
      journalListArray.forEach((item) => {
        let workRequest = new WorkRequest("transaction", "getTransactionInfo");
        workRequest.request = {"journalId": item};
        this.processWorkRequest(workRequest);
      });
    }
  }

  /**
   * Generic function to process a work request.
   * @param workRequest
   */
  public processWorkRequest(workRequest:WorkRequest) {
    this.workRequestsSummary[workRequest.module].PENDING++;

    let params = workRequest.request;
    params.module = workRequest.module;
    params.f = workRequest.f;

    let stompAccess = this._request_destination + workRequest.module + '.' + workRequest.f;
    let workRequestId = this._stompService.send(stompAccess, JSON.stringify(params), {"reply-to": this._response_destination});

    workRequest.id = workRequestId;

    this.workRequests.push(workRequest);
  }

  /**
   * Registers a new unique queue for responses.
   */
  private registerResponseQueue() {
    // Creates the reply queue
    this._response_destination += Math.random().toString(36).substr(0, 15);
    let reply_to_headers = {"auto-delete": true, "exclusive": true};
    this._stompService.send('/queue/' + this._response_destination, "", reply_to_headers);

    // Registers to the reply queue.
    this._stompService.subscribe(this._response_destination, this.processWorkResponse);
  }

  /**
   * Generic function that handles work request responses.
   * @param message
   */
  public processWorkResponse = (message:StompFrame) => {
    if (message.body) {

      let response:any = JSON.parse(message.body);
      let workRequestId:number = +message.headers['correlation-id'];

      for (let i = 0; i < this.workRequests.length; i++) {

        let workRequest = this.workRequests[i];
        if (workRequest.id == workRequestId) {
          workRequest.response = response;

          if (response.state == 'ok') {
            workRequest.status = 'COMPLETED';

            this.workRequestsSummary[workRequest.module].PENDING--;
            this.workRequestsSummary[workRequest.module].COMPLETED++;
          } else {
            workRequest.status = 'FAILED';

            this.workRequestsSummary[workRequest.module].PENDING--;
            this.workRequestsSummary[workRequest.module].FAILED++;
          }
        }
      }
    }
  }
}