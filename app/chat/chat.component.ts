import {Component} from 'angular2/core';

import {ChatService} from './chat.service';

@Component({
  selector: 'chat',
  templateUrl: 'app/chat/chat.component.html'
})
export class ChatComponent {

  // Logged in ScreenName
  private screenName: string;

  constructor(
    private _chatService: ChatService
  ){
    this.screenName = _chatService.screenName;
  }

  /**
   * Registers a new user into the chat
   * @param screenName
   */
  loginUser(screenName: string){
    this._chatService.loginUser(screenName);

    // TODO: Do the login action as a promise, if successful then set the screenName
    this.screenName = this._chatService.screenName;
  }
}