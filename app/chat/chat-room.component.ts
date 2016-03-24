import {Component, OnInit} from 'angular2/core';
import {ChatService} from './chat.service';

@Component({
  selector: 'chat-room',
  templateUrl: 'app/chat/chat-room.component.html'
})
export class ChatRoomComponent implements OnInit {

  _chatMessages: string[];

  constructor(private _chatService: ChatService) {
    this._chatMessages = [];
  }

  /**
   * When the chat room component is created, request a chat room subscription.
   */
  ngOnInit() {
    this._chatService.subscribeToChatRoom((message: string) => {
      if (this._chatMessages instanceof Array) {
        this._chatMessages.push(message.body);
      }
    });
  }
}