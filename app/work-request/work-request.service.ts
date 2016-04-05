import {Injectable} from 'angular2/core';
import {StompService} from '../stomp/stomp.service';

import {WorkRequest} from './work-request.model';
import {WorkRequestMessage} from './work-request-message.model';

@Injectable()
export class WorkRequestService {

  private _work_request_queue = '/exchange/work_request/';

  public workRequests:WorkRequest[];

  constructor(private _stompService:StompService) {
    this.workRequests = [];
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
        workRequest.request = {"username": item};

        this.processWorkRequest(workRequest)
          .then((response) => {
            workRequest.status = "COMPLETED";

            let customerInfo = response.customerInfo;
            let responseFormatted = `U: ${customerInfo.username} FN: ${customerInfo.firstName} LN: ${customerInfo.lastName} B: ${customerInfo.balance} ${customerInfo.currency}`;
            workRequest.response = responseFormatted;
          })
          .catch((err) => {
            workRequest.status = "FAILED";
            workRequest.response = err;
          });
      });
    }
  }

  /**
   * Requests information for a list of transactions.
   * @param transactionList
   */
  getTransactions(transactionList:string) {

    if (transactionList != '') {
      let transactionListArray = transactionList.split(",");
      transactionListArray.forEach((item) => {

        let workRequest = new WorkRequest("transaction", "getTransactionInfo");
        workRequest.request = {"journalId": item};

        this.processWorkRequest(workRequest)
          .then((response) => {
            workRequest.status = "COMPLETED";
            let transactionInfo = response.transactionInfo;
            let responseFormatted = `J: ${transactionInfo.caJournal_Id} S: ${transactionInfo.caTransactionStatus_Id} A: ${transactionInfo.Amount} ${transactionInfo.CurrencyCode}`;
            workRequest.response = responseFormatted;
          })
          .catch((err) => {
            workRequest.status = "FAILED";
            workRequest.response = err;
          });
      });
    }
  }

  /**
   * Generic function to process a work request. Will return a promise for when the request is finished.
   * @param workRequest
   */
  processWorkRequest(workRequest:WorkRequest) {

    this.workRequests.push(workRequest);

    let promise = new Promise(
      (resolve, reject) => {

        let reply_to_headers = {"auto-delete": true, "exclusive": true};
        let reply_to_queue = 'wrq_' + Math.random().toString(36).substr(0, 25);
        this._stompService.send('/queue/' + reply_to_queue, "", reply_to_headers);

        let reply_to_subscription = this._stompService.subscribe(reply_to_queue, (message) => {

          let response = JSON.parse(message);
          if (response.state == 'ok') {
            resolve(response.response);
          } else {
            reject(response.userMessage);
          }

          reply_to_subscription.unsubscribe();
        });

        let stompRequest = workRequest.request;
        stompRequest.module = workRequest.module;
        stompRequest.f = workRequest.f;

        let stompAccess = this._work_request_queue + workRequest.module + '.' + workRequest.f;
        this._stompService.send(stompAccess, JSON.stringify(stompRequest), {"reply-to": reply_to_queue});
      }
    );
    return promise;
  }
}