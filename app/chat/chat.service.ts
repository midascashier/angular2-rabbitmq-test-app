import {Injectable} from 'angular2/core';
import {StompService} from '../stomp/stomp.service';
import {ChatMessage} from './chat-message.model';

@Injectable()
export class ChatService {

  // Subscription to the chat room
  private _chatSubscription: StompSubscription = null;

  // Current logged in user
  public screenName: string;

  constructor(
    private _stompService: StompService
  ){}

  /**
   * Logs an user in.
   * @param screenName
   */
  loginUser(screenName: string) {

    this.screenName = screenName;

    let chatMessage = new ChatMessage();
    chatMessage.action = 'login';
    chatMessage.from = this.screenName;

    this._stompService.sendDirectMessage('/queue/test', this.screenName);
  }

  /**
   * Subscribes to the chat room.
   * @param callback
   */
  subscribeToChatRoom(callback) {
    if (this._chatSubscription == null) {
      this._chatSubscription = this._stompService.subscribe('/queue/test', callback);
    }
  }



}