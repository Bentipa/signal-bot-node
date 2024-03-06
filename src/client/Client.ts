"use strict";

import { ClientInterface, MessageBus, sessionBus, systemBus } from "dbus-next";
import { EventEmitter } from "stream";
import defaultClientSettings from "../constants/defaultClientSettings";
import ConversationManager from "../managers/ConversationManager";
import Message from "../structures/Message";
import debugLog from "../util/debugLog";
import deepMerge from "../util/deepMerge";
import ClientUser from "./ClientUser";

/**
 * Signal bot client class.
 * @extends EventEmitter
 */
class Client extends EventEmitter {

  settings: any;
  _user: ClientUser;
  _conversations: ConversationManager;
  _bus: MessageBus;
  _busInterface: ClientInterface;
  _connectionCheckInterval: NodeJS.Timeout;

  /**
   * Construct a Client.
   * @param {Object} [settings] - The settings for the Client.
   * @param {Object} [settings.dbus] - D-Bus settings.
   * @param {number} [settings.dbus.connectionCheckInterval=5000] - How frequently the connection should be checked, in milliseconds.
   * @param {string} [settings.dbus.destination=org.asamk.Signal] - D-Bus destination for signal-cli daemon.
   * @param {string} [settings.dbus.accountMode=single|multiple] - D-Bus account mode. Can be `single` or `multiple`.
   * @param {string} [settings.dbus.account] - D-Bus account name (if mode =`multiple`, replace + with _ in phone number).
   * @param {string} [settings.dbus.type=system] - D-Bus type. Can be `system` or `session`.
   */
  constructor(settings: { dbus?: { connectionCheckInterval?: number; destination?: string; accountMode?: string; account?: string; type?: string; }; } = {}) {
    super();
    this.settings = deepMerge(settings, defaultClientSettings);
    if (typeof this.settings.dbus?.connectionCheckInterval !== "number") {
      throw new TypeError(
        `Bad Client settings.dbus.connectionCheckInterval: ${this.settings.dbus?.connectionCheckInterval}`
      );
    }
    if (typeof this.settings.dbus?.destination !== "string") {
      throw new TypeError(
        `Bad Client settings.dbus.destination: ${this.settings.dbus?.destination}`
      );
    }
    if (!["system", "session"].includes(this.settings.dbus?.type)) {
      throw new TypeError(
        `Bad Client settings.dbus.type: ${this.settings.dbus?.type}`
      );
    }
    this._user = new ClientUser({
      client: this,
    });
    this._conversations = new ConversationManager(this);
  }

  /**
   * The ClientUser belonging to this Client.
   * @type {ClientUser}
   * @readonly
   */
  get user() {
    return this._user;
  }

  /**
   * The ConversationManager belonging to this Client.
   * @type {ConversationManager}
   * @readonly
   */
  get conversations() {
    return this._conversations;
  }

  /**
   * Connect to the signal-cli daemon over D-Bus.
   * @return {Promise<undefined>}
   */
  async connect(): Promise<undefined> {
    if (this.settings.dbus.type === "session") {
      this._bus = sessionBus();
    } else {
      this._bus = systemBus();
    }
    const interfaces = await this._bus.getProxyObject(
      this.settings.dbus.destination,
      "/org/asamk/Signal/" +
      (this.settings.dbus.accountMode === "single"
        ? ""
        : this.settings.dbus.account)
    );
    this._busInterface = interfaces.getInterface("org.asamk.Signal");

    /**
     * Disconnect event.
     * Fires when the D-Bus connection is disconnected.
     * The `connect` method must be called again afterwards in order to reconnect.
     * @event Client#disconnect
     */
    // Hacky way of testing connection since dbus-next does not emit an event on disconnect.
    this._connectionCheckInterval = setInterval(async () => {
      try {
        await this.user.getRegistrationStatus();
      } catch (e) {
        if (this.settings.debug) {
          debugLog("Disconnect");
        }
        clearInterval(this._connectionCheckInterval);
        this._bus.disconnect();
        this._busInterface.removeAllListeners();
        this.emit("disconnect");
      }
    }, this.settings.dbus.connectionCheckInterval);

    /**
     * Error event.
     * Fires when an error occurs.
     * @event Client#error
     * @type {Error}
     */
    this._busInterface.on("error", (e) => {
      if (this.settings.debug) {
        debugLog(`Error: ${e}`);
      }
      this.emit("error", e);
    });

    /**
     * Message event.
     * Fires when a message is received.
     * @event Client#message
     * @type {Message}
     */
    this._busInterface.on(
      "MessageReceived",
      (timestamp, authorID, groupID, content, attachments) => {
        if (this.settings.debug) {
          debugLog(
            `MessageReceived: ${timestamp}, ${authorID}, ${groupID?.toString?.(
              "base64"
            )}, ${content}, ${JSON.stringify(attachments)}`
          );
        }
        const conversationID = groupID.length
          ? groupID.toString("base64")
          : authorID;
        let conversation = this.conversations.cache.get(conversationID);
        if (!conversation) {
          conversation = this.conversations.from(conversationID);
          this.conversations._addToCache(conversation);
        }
        const message = new Message({
          client: this,
          // D-Bus lib returns BigInt, which is unnecessary and not compatible with Date()
          timestamp: Number(timestamp),
          authorID,
          conversation,
          attachments,
          content,
        });

        this.emit("message", message);
      }
    );

    // Hacky workaround for dbus-next not handling multiple input signatures well.
    // this._busInterface.$methods
    //   .filter((method) => method.name === "sendMessage")
    //   .forEach((method) => (method.inSignature = "sasas"));
  }
}

export default Client;
