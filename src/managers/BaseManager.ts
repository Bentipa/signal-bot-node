"use strict";

import Client from "../client/Client";
import ExtMap from "../structures/ExtMap";


/**
 * BaseManager class.
 * @param {Client} - client
 * @hideconstructor
 */
class BaseManager {

  private _client: Client;
  private _cache: ExtMap;

  constructor(client) {
    this._client = client;
    this._cache = new ExtMap();
  }

  /**
   * The client belonging to the manager.
   * @type {Client}
   * @readonly
   */
  get client() {
    return this._client;
  }

  /**
   * The cache belonging to the manager.
   * @type {ExtMap}
   * @readonly
   */
  get cache() {
    return this._cache;
  }
}

export default BaseManager;
