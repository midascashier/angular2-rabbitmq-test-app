export const CHAT_LOGIN = "LOGIN_USER";
export const CHAT_MESSAGE = "MESSAGE";
export const CHAT_LOGOUT = "LOGOUT";

export class ChatMessage {
  /**
   * What is this message for: login, message, logoutUser.
   */
  action: string;

  timestamp: any; // TODO: Find out how to define date or time types.

  from: string;
  to: string;

  message: string;

  constructor() {
    this.timestamp = new Date();
  }
}