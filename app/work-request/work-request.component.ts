import {Component, OnInit} from 'angular2/core';

import {WorkRequest} from './work-request.model';
import {WorkRequestService} from './work-request.service';

@Component({
  selector: 'work-request',
  templateUrl: 'app/work-request/work-request.component.html'
})
export class WorkRequestComponent implements OnInit {

  public workRequests:WorkRequest[] = [];

  public workRequestsSummary:any;

  public is_connected:boolean = false;

  constructor(private _workRequestService:WorkRequestService) {
  }

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this._workRequestService.initialize()
      .then(() => {
        this.is_connected = true;
        this.workRequests = this._workRequestService.workRequests;
        this.workRequestsSummary = this._workRequestService.workRequestsSummary;
      });
  }

  /**
   * Requests information for a list of customers.
   * @param customerList
   */
  public getCustomers(customerList:string) {
    if (this.is_connected) {
      this._workRequestService.getCustomers(customerList);
    } else {
      console.log("Hold on the Broker is not ready yet. ");
    }
  }

  /**
   * Requests information for a list of journals.
   * @param journalList
   */
  public getTransactions(journalList:string) {
    if (this.is_connected) {
      this._workRequestService.getTransactions(journalList);
    } else {
      console.log("Hold on the Broker is not ready yet. ");
    }
  }

  /**
   * Hides all requests with the given status
   * @param status
   */
  public hideWorkRequests(status:string) {
    for (let i = this.workRequests.length - 1; i >= 0; i--) {
      if (this.workRequests[i].status == status) {
        this.workRequestsSummary[this.workRequests[i].module][status]--;
        this.workRequests.splice(i, 1);
      }
    }
  }
}