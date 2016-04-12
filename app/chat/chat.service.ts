import {Injectable} from 'angular2/core';
import {Subscription} from 'rxjs/Subscription';
import {StompService} from '../stomp/stomp.service';
import {ChatMessage, CHAT_LOGIN, CHAT_MESSAGE, CHAT_LOGOUT} from './chat-message.model';

@Injectable()
export class ChatService {

  // All messages are sent here.
  private _chat_queue:string = '/exchange/chatRoom/chat';

  // Subscription to the chat room
  private _chatSubscription:Subscription = null;

  // Current messages reported for the chat.
  public chatMessages:ChatMessage[];

  // Current logged in user
  public screenName:string;

  constructor(private _stompService:StompService) {
    this.chatMessages = [];
  }

  /**
   * Initializes the service
   * @returns {Promise<R>|Promise<T>|Promise}
   */
  public initialize():Promise<{}> {
    let p = new Promise((resolve) => {
      // TODO: Check if this should be changed for some kind of event to know when the connection its ready.
      var intervalId = setInterval(() => {
        if (this._stompService.isConnected) {
          clearInterval(intervalId);
          resolve();
        }
      }, 1000);
    });
    return p;
  }

  /**
   * Logs an user in.
   * @param screenName
   */
  public login(screenName:string) {

    let p = new Promise((resolve) => {
      this.screenName = screenName;

      // Registers to the reply queue.
      this._chatSubscription = this._stompService.subscribe(this._chat_queue, this.receiveMessage);

      // Send the login request, this will link the chat queue with the exchange
      let chatMessage = new ChatMessage();
      chatMessage.action = CHAT_LOGIN;
      chatMessage.from = this.screenName;
      chatMessage.message = "I just logged in";
      this._stompService.send(this._chat_queue, JSON.stringify(chatMessage));

      resolve();
    });

    return p;
  }

  /**
   * Parses and processes the chat communication
   * @param message
   */
  public receiveMessage = (message:StompFrame) => {

    if (message.body) {
      // Parse the message.
      let chatMessage = JSON.parse(message.body);
      chatMessage instanceof ChatMessage;

      if (chatMessage.action == CHAT_LOGIN) {
        console.log("A new user has logged into the chat: " + chatMessage.from);
        this.chatMessages.push(chatMessage);
      } else if (chatMessage.action == CHAT_MESSAGE) {
        console.log("A new message was sent. User: " + chatMessage.from + " Message: " + chatMessage.message);
        this.chatMessages.push(chatMessage);
      } else if (chatMessage.action == CHAT_LOGOUT) {
        console.log("An user has logged out of the chat: " + chatMessage.from);
        this.chatMessages.push(chatMessage);
      } else {
        console.log("Unknown message received: " + chatMessage);
      }
    } else {
      console.log("Unknown message received: " + message);
    }
  }

  /**
   * Sends a message to the current chat room.
   * @param message
   */
  public sendMessage(message:string) {
    if (this._chatSubscription != null) {

      let chatMessage = new ChatMessage();
      chatMessage.action = CHAT_MESSAGE;
      chatMessage.from = this.screenName;
      chatMessage.to = 'all';
      chatMessage.message = message;
      this._stompService.send(this._chat_queue, JSON.stringify(chatMessage));
    }
  }

  /**
   * Logs out of the chat.
   */
  public logout() {
    if (this._chatSubscription != null) {
      let chatMessage = new ChatMessage();
      chatMessage.action = CHAT_LOGOUT;
      chatMessage.from = this.screenName;
      chatMessage.to = 'all';
      chatMessage.message = "I just logged out";
      this._stompService.send(this._chat_queue, JSON.stringify(chatMessage));

      this._chatSubscription.unsubscribe();

      this.screenName = null;
      this._chatSubscription = null;
      this.chatMessages = [];
    }
  }
}