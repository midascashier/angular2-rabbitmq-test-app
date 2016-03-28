import {Component, OnInit} from 'angular2/core';
import {ChatService} from './chat.service';
import {ChatMessage} from './chat-message.model';

@Component({
  selector: 'chat-room',
  templateUrl: 'app/chat/chat-room.component.html'
})
export class ChatRoomComponent implements OnInit {

  _chatMessages:ChatMessage[];

  public screenName:string;

  constructor(private _chatService:ChatService) {
    this._chatMessages = [];
  }

  /**
   * When the chat room component is created, request a chat room subscription.
   */
  ngOnInit() {
    this.screenName = this._chatService.screenName;

    this._chatService.subscribeToChatRoom((message:string) => {

      let chatMessage:ChatMessage = JSON.parse(message);

      if (this._chatMessages instanceof Array) {
        console.log(chatMessage);
        this._chatMessages.push(chatMessage);
      }
    });
  }

  /**
   * Sends a new message to the chat.
   * @param message
   */
  sendMessage(message:string) {
    this._chatService.sendMessage(message);
    //this._chatMessages.push(message);
  }
}