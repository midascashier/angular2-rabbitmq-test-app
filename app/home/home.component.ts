import {Component} from 'angular2/core';
import {WorkRequestComponent} from '../work-request/work-request.component';

@Component({
  selector: 'home',
  directives: [WorkRequestComponent],
  templateUrl: 'app/home/home.component.html'
})
export class HomeComponent { }