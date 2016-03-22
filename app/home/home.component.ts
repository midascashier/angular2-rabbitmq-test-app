import {Component} from 'angular2/core';
import {ChatComponent} from '../chat/chat.component';
import {WorkRequestComponent} from '../work-request/work-request.component';

@Component({
  selector: 'home',
  directives: [ChatComponent, WorkRequestComponent],
  templateUrl: 'app/home/home.component.html'
})
export class HomeComponent { }