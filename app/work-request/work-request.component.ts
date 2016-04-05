import {Component, OnInit} from 'angular2/core';

import {WorkRequest} from './work-request.model';
import {WorkRequestService} from './work-request.service';

@Component({
  selector: 'work-request',
  templateUrl: 'app/work-request/work-request.component.html'
})
export class WorkRequestComponent implements OnInit {

  public workRequests:WorkRequest[];

  public workRequestsSummary:any;

  constructor(private _workRequestService:WorkRequestService) {

  }

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.workRequests = this._workRequestService.workRequests;
    this.workRequestsSummary = this._workRequestService.workRequestsSummary;
  }

  /**
   * Requests information for a list of customers.
   * @param customerList
   */
  getCustomers(customerList:string) {
    this._workRequestService.getCustomers(customerList);
  }

  /**
   * Requests information for a list of journals.
   * @param journalList
   */
  getTransactions(journalList:string) {
    this._workRequestService.getTransactions(journalList);
  }

  /**
   * Hides all requests with the given status
   * @param status
   */
  hideWorkRequests(status:string) {
    for (let i=this.workRequests.length-1; i >= 0; i--) {
      if (this.workRequests[i].status == status) {
        this.workRequestsSummary[this.workRequests[i].module][status]--;
        this.workRequests.splice(i, 1);
      }
    }
  }
}