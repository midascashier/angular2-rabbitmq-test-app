import {Injectable} from 'angular2/core';
import {StompService} from '../stomp/stomp.service';
import {ChatMessage, CHAT_LOGIN, CHAT_MESSAGE, CHAT_LOGOUT} from './chat-message.model';

@Injectable()
export class ChatService {

  // All messages are sent here.
  private _chat_queue: string = '/exchange/chatRoom/chat';

  // Subscription to the chat room
  private _chatSubscription:StompSubscription = null;

  // Current messages reported for the chat.
  public chatMessages:ChatMessage[];

  // Current logged in user
  public screenName:string;

  constructor(private _stompService:StompService) {
    this.chatMessages = [];
  }

  /**
   * Logs an user in.
   * @param screenName
   */
  login(screenName:string) {

    if (!this._chatSubscription) {

      this.screenName = screenName;

      // Subscribe to the newly created queue and define the function that will handle all communications.
      this._chatSubscription = this._stompService.subscribe(this._chat_queue, (message) => { this.receiveMessage(message); } );

      // Send the login request, this will link the chat queue with the exchange
      let chatMessage = new ChatMessage();
      chatMessage.action = CHAT_LOGIN;
      chatMessage.from = this.screenName;
      chatMessage.message = "I just logged in";
      this._stompService.send(this._chat_queue, JSON.stringify(chatMessage));

      // TODO: ACCEPT THE PROMISE
    } else {
      // TODO: REJECT THE PROMISE
    }
  }

  /**
   * Parses and processes the chat communication
   * @param message
   */
  receiveMessage(message:string) {
    // Parse the message.
    let chatMessage = JSON.parse(message);
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
  }

  /**
   * Sends a message to the current chat room.
   * @param message
   */
  sendMessage(message:string) {
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
  logout() {
    if (this._chatSubscription != null) {
      let chatMessage = new ChatMessage();
      chatMessage.action = CHAT_LOGOUT;
      chatMessage.from = this.screenName;
      chatMessage.to = 'all';
      chatMessage.message = "I just logged out";
      this._stompService.send(this._chat_queue, JSON.stringify(chatMessage));

      this._stompService.unsubscribe(this._chatSubscription);

      this.screenName = null;
      this._chatSubscription = null;
      this.chatMessages = [];
    }
  }
}