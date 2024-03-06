"use strict";

import Client from "./Client";

/**
 * The user that is being used by the client.
 */
class ClientUser {

  private _client: Client;

  /**
   * Constructs an instance of ClientUser. For internal use only.
   * @param {Object} data
   * @param {Object} data.client
   * @hideconstructor
   */
  constructor(data) {
    this._client = data.client;
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
   * Check if the client user is registered.
   * Should always return `true`.
   * @return {Promise<boolean>}
   */
  async getRegistrationStatus() {
    return await this.client._busInterface.isRegistered();
  }
}

export default ClientUser;
