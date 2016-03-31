import {Injectable} from 'angular2/core';
import {StompService} from '../stomp/stomp.service';
import {ChatMessage} from './chat-message.model';

@Injectable()
export class ChatService {

  // Subscription to the chat room
  private _chatSubscription:StompSubscription = null;

  // Current logged in user
  public screenName:string;

  constructor(private _stompService:StompService) {
  }

  /**
   * Logs an user in.
   * @param screenName
   */
  loginUser(screenName:string) {

    this.screenName = screenName;

    // Create temporary queue
    let reply_queue = Math.random().toString(36).substring(7);
    this._stompService.send(reply_queue, "", {"exclusive": true, "auto-delete": true});
    let tmpLoginSubscription = this._stompService.subscribe(reply_queue, (message) => {
      tmpLoginSubscription.unsubscribe();
      let response = JSON.parse(message);
      console.log(response);

      let chatQueue = response.newQueue.substr(4);
      this._chatSubscription = this._stompService.subscribe(chatQueue, (message:string) => {
        let chatMessage:ChatMessage = JSON.parse(message);
        console.log(chatMessage);
      });

    });

    let chatMessage = new ChatMessage();
    chatMessage.action = 'PleaseLoginUser';
    chatMessage.from = this.screenName;
    console.log(chatMessage);
    this._stompService.send('/queue/chatAdmin', JSON.stringify(chatMessage), {"reply-to": reply_queue});
  }

  /**
   * Sends a message to the current chat room.
   * @param message
   */
  sendMessage(message:string) {
    if (this._chatSubscription != null) {

      let chatMessage = new ChatMessage();
      chatMessage.action = 'message';
      chatMessage.from = this.screenName;
      chatMessage.to = 'all';
      chatMessage.message = message;
      console.log(chatMessage);
      this._stompService.send('/exchange/chatRoom', JSON.stringify(chatMessage));
    }
  }

  /**
   * Subscribes to the chat room.
   * @param callback
   */
  subscribeToChatRoom(callback:any) {
    if (this._chatSubscription == null) {
      this._chatSubscription = this._stompService.subscribe('/queue/' + this.screenName, callback);
    }
  }
}