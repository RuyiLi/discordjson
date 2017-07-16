# discordjson
A discord.js framework.

DO NOT USE THIS UNLESS YOU ARE CREATING A SIMPLE RESPONSE BOT, THIS IS VERY UNSTABLE AND NOT MAINTAINED.

##Installation
---
```npm install discordjson```

##Example
---
bot.json
```
{
	"token": "Your token here",
	"prefix": "!",
	"splitArgsBy": ", ",
	"ready":{
		"log": "Bot started."
	},
	"commands":{
		"ping":{
			"edit": "Pong! [ping]",
			"log": "Sent ping."
		}
	}
}
```

bot.js
```
const djson = require("discordjson");
const botjson = require("./bot.json")

djson.start(botjson);
```

##Commands
---
```token```: Your bot's token. This is required.

```prefix```: The prefix of your bot's commands. The default prefix is "!".

```splitArgsBy```: Some functions require arguments. This specifies what the bot should split the arguments with (e.g !ban userid, time, reason).

```ready```: This is called when the bot starts up.

```commands```: This is your command handler. You can specify command names and their function.

```log```: Logs something to the console.

```reply```: Replies to the message that executed the command.

```edit```: Edits a message. This can only be used with selfbots.

```send```: Sends a message to the channel the command was executed in.

```ban```: Requires at least one [arg], for a maximum of 3. The first argument should be the user id, the second the length of the member's ban, and the third the reason for the ban.

```kick```: Requires at least one [arg], for a maximum of 2. The first argument should be the user id, and the second the reason for the kick.

```script```: Executes a script at the given path. This is recommended for a larger variety of commands. The message, client, and discord object will be passed as parameters. An example of such a script:
```
var exports = module.exports = {};

exports.ping = function(msg, client, discord){
	return msg.edit("Ping: `" + client.ping + "ms`");
}
```

```[user]```: When put in a value, this will automatically be replaced with the user who sent the message.

```[ping]```: When put in a value, this will automatically be replaced with the client's ping in milliseconds.
