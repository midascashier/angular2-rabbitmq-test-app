import {Injectable} from 'angular2/core';
import {StompService} from '../stomp/stomp.service';
import {ChatMessage} from './chat-message.model';

@Injectable()
export class ChatService {

  // List of messages received in the chat.
  private messageList: ChatMessage[];

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

    this._stompService.sendDirectMessage(chatMessage);
  }

  /**
   * Sends a new message to the chat.
   * @param message
   */
  sendMessage(to: string, message: string) {

    let chatMessage = new ChatMessage();
    chatMessage.action = 'message';
    chatMessage.from = this.screenName;
    chatMessage.to = to;
    chatMessage.message = message;

    this._stompService.sendDirectMessage(chatMessage);
  }

}