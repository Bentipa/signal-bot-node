"use strict";

import Client from "../client/Client";

type BaseConversationData = {
  client: Client;
  id: string;
};

/**
 * BaseConversation structure.
 */
class BaseConversation {

  private _client: Client;
  private _id: string;

  /**
   * Constructs an instance of BaseConversation. For internal use only.
   * @param {Object} data
   * @param {Object} data.client
   * @param {string} data.id
   * @hideconstructor
   */
  constructor(data: BaseConversationData) {
    this._client = data.client;
    this._id = data.id;
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
   * The ID of the conversation.
   * @type {string}
   * @readonly
   */
  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }
}

export default BaseConversation;
