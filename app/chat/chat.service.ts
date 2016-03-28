import {Injectable} from 'angular2/core';
import {StompService} from '../stomp/stomp.service';
import {ChatMessage} from './chat-message.model';

@Injectable()
export class ChatService {

  // Subscription to the chat room
  private _chatSubscription: StompSubscription = null;

  // Current logged in user
  public screenName: string;

  constructor( private _stompService: StompService ){}

  /**
   * Logs an user in.
   * @param screenName
   */
  loginUser(screenName: string) {

    this.screenName = screenName;

    let chatMessage = new ChatMessage();
    chatMessage.action = 'loginUser';
    chatMessage.from = this.screenName;

    console.log(chatMessage);
    this._stompService.send('/topic/chat', JSON.stringify(chatMessage));
  }

  /**
   * Sends a message to the current chat room.
   * @param message
   */
  sendMessage(message: string) {
    if (this._chatSubscription != null) {

      let chatMessage = new ChatMessage();
      chatMessage.action = 'message';
      chatMessage.from = this.screenName;
      chatMessage.to = 'all';
      chatMessage.message = message;
      console.log(chatMessage);
      this._stompService.send('/topic/chat', JSON.stringify(chatMessage));
    }
  }

  /**
   * Subscribes to the chat room.
   * @param callback
   */
  subscribeToChatRoom(callback) {
    if (this._chatSubscription == null) {
      this._chatSubscription = this._stompService.subscribe('/queue/' + this.screenName, callback);
    }
  }
}