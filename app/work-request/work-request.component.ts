import {Component, OnInit} from 'angular2/core';

import {WorkRequest} from './work-request.model';
import {WorkRequestService} from './work-request.service';

@Component({
  selector: 'work-request',
  templateUrl: 'app/work-request/work-request.component.html'
})
export class WorkRequestComponent implements OnInit {

  public workRequests:WorkRequest;

  constructor(private _workRequestService:WorkRequestService) {

  }

  /**
   * Initializes the component.
   */
  ngOnInit() {
    this.workRequests = this._workRequestService.workRequests;
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
}