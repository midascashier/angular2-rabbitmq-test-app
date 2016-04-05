import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import { HTTP_PROVIDERS, Http } from 'angular2/http';

import { NavBarComponent } from './common/nav-bar.component';

import { BootstrapExamplesComponent } from './bootstrap/bootstrap-examples.component';
import { ChatRoomComponent } from './chat/chat-room.component';
import { WorkRequestComponent } from './work-request/work-request.component';

import {StompService} from './stomp/stomp.service';
import {ChatService} from './chat/chat.service';
import {WorkRequestService} from './work-request/work-request.service';

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html',
  directives: [ROUTER_DIRECTIVES, NavBarComponent],
  providers: [ROUTER_PROVIDERS, HTTP_PROVIDERS, StompService, ChatService, WorkRequestService],
  styleUrls: ['app/app.component.css']
})
@RouteConfig([
  {path: '/bootstrap', name: 'BootstrapExamples', component: BootstrapExamplesComponent, useAsDefault: true},
  {path: '/chat_room', name: 'ChatRoom', component: ChatRoomComponent},
  {path: '/work_request', name: 'WorkRequest', component: WorkRequestComponent}
])
export class AppComponent {
}