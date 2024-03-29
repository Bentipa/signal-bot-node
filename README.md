# Signal-Bot

A library for creating bots that interact with the Signal application. Not affiliated with the Signal project or Open Whisper Systems.
This implementation bases on the abandoned [signal-bot](https://github.com/TapuCosmo/signal-bot).

Install with `npm install signal-bot-node`.

Currently, only tested on Linux, with Node.js >=18.0.0.

This library requires a working installation of [signal-cli](https://github.com/AsamK/signal-cli)
running in daemon mode with the phone number you want to use, or the multi-account feature enabled.

Tested on v0.13.1 of signal-cli.

Attention: this library is currently under heavy development and not ready for production use.

## Example Usage

### Basic Commands

```js
const {Client} = require("signal-bot");

const bot = new Client();

const prefix = "!";

bot.on("message", msg => {
  if (!msg.content.startsWith(prefix)) return;
  const command = msg.content.slice(prefix.length);

  if (command === "hello") {
    msg.conversation.sendMessage("Hello World!");
  } else if (command === "whoami") {
    msg.conversation.sendMessage(`You are ${msg.author.id}`);
  }
});

bot.connect();
```

Send the bot `!hello` and it should respond with `Hello World!`.

Send the bot `!whoami` and it should respond with `You are <phone number>`.

## Missing Features

* signal-cli D-Bus missing features:
  - Group conversation invite event
  - Group conversation leave event
  - Reactions
  - Stickers
* Contact management
* Additional user/group member information/profiles
* Group conversation member list
* Group conversation admin functions
