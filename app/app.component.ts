import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';

import { NavBarComponent } from './common/nav-bar.component';

import { HomeComponent } from './home/home.component';
import { ChatRoomComponent } from './chat/chat-room.component';
import { WorkRequestListComponent } from './work-request/work-request-list.component';

import {ChatService} from './chat/chat.service';
import {StompService} from './stomp/stomp.service';

@Component({
  selector: 'my-app',
  templateUrl: 'app/app.component.html',
  directives: [ ROUTER_DIRECTIVES, NavBarComponent ],
  providers: [ ROUTER_PROVIDERS, ChatService, StompService ]
})
@RouteConfig([
  { path: '/home', name: 'Home', component: HomeComponent, useAsDefault: true },
  { path: '/chat_room', name: 'ChatRoom', component: ChatRoomComponent },
  { path: '/work_request_list', name: 'WorkRequestList', component: WorkRequestListComponent }
])
export class AppComponent {}