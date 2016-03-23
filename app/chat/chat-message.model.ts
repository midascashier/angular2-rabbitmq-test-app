export class ChatMessage {
  /**
   * What is this message for: loginUser, message, logoutUser.
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