import {Component, OnInit, OnDestroy} from 'angular2/core';
import {FORM_DIRECTIVES} from 'angular2/common';

import {ChatService} from './chat.service';
import {ChatMessage} from './chat-message.model';

@Component({
  selector: 'chat-room',
  templateUrl: 'app/chat/chat-room.component.html'
})
export class ChatRoomComponent implements OnInit, OnDestroy {

  private _screenName:string;

  private _chatMessages:ChatMessage[]

  constructor(private _chatService:ChatService) {
  }

  /**
   * When the chat room component is created, check if the user needs to login
   */
  ngOnInit() {
    this._screenName = this._chatService.screenName;
    this._chatMessages = this._chatService.chatMessages;

    if (this._screenName) {
      this.loginUser(this._screenName);
    }
  }

  /**
   * Lifecycle hook to clean up things.
   */
  ngOnDestroy() {
    this._chatService.logout();
  }

  /**
   * Registers a new user into the chat
   * @param screenName
   */
  loginUser(screenName:string) {
    this._chatService.login(screenName);

    // TODO: Do this as a promise
    this._screenName = screenName;
  }

  /**
   * Sends a new message to the chat.
   * @param message
   */
  sendMessage(newMessageInput:any) {
    this._chatService.sendMessage(newMessageInput.target.value);
    newMessageInput.focus();
  }
}