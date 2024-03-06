"use strict";

import Client from "../client/Client";
import GroupConversation from "./GroupConversation";
import UserConversation from "./UserConversation";

type MessageData = {
  client: Client;
  timestamp: number;
  authorID: string;
  conversation: UserConversation | GroupConversation;
  attachments: Array<Buffer>;
  content: string;
};

/**
 * Message structure.
 */
class Message {

  private _client: Client;
  private _timestamp: number;
  private _author: { id: string };
  private _conversation: UserConversation | GroupConversation;
  private _attachments: Array<Buffer>;
  private _content: string;

  /**
   * Constructs an instance of Message. For internal use only.
   * @param {Object} data
   * @param {Object} data.client
   * @param {number} data.timestamp
   * @param {string} data.authorID
   * @param {(UserConversation|GroupConversation)} data.conversation
   * @param {Array<Buffer>} data.attachments
   * @param {string} data.content
   * @hideconstructor
   */
  constructor(data: MessageData) {
    this._client = data.client;
    this._timestamp = data.timestamp;
    this._author = {
      id: data.authorID
    };
    this._conversation = data.conversation;
    this._attachments = data.attachments || [];
    this._content = data.content || "";
  }

  /**
   * The Client that this instance belongs to.
   * @type {Client}
   * @readonly
   */
  get client() {
    return this._client;
  }

  /**
   * The timestamp of the message, in milliseconds since the Unix epoch.
   * @type {number}
   * @readonly
   */
  get timestamp() {
    return this._timestamp;
  }

  /**
   * The author of the message.
   * An object with only the `id` property.
   * @type {Object}
   * @readonly
   */
  get author() {
    return this._author;
  }

  /**
   * The conversation that the message was sent in. Can be a UserConversation or GroupConversation.
   * @type {(UserConversation|GroupConversation)}
   * @readonly
   */
  get conversation() {
    return this._conversation;
  }

  /**
   * The attachments that were sent with the message.
   * signal-cli automatically downloads attachments.
   * Returns an array of absolute file paths.
   * @type {Array<string>}
   * @readonly
   */
  get attachments() {
    return this._attachments;
  }

  /**
   * The text content of the message.
   * @type {string}
   * @readonly
   */
  get content() {
    return this._content;
  }
}

export default Message;
