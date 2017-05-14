const parse = require("./parse.js");
const discord = require("discord.js");
const client = new discord.Client();
var exports = module.exports = {};

exports.start = function(jsonPath){
	var commands = [];
	const json = require(jsonPath)

	if(json.hasOwnProperty("ready")){
		//   /\[(.+?)\]/g
		client.on("ready", () => {
			for(var logMessage in json.ready){
				parse.parse(logMessage, json.ready[logMessage], client);
			}
		})
		client.login(json.token)
	}

	if(json.hasOwnProperty("commands")){
		for(var cmd in json.commands){
			commands.push(cmd);
		}
		console.log("Commands: " + commands);

		client.on("message", msg => {
			
			if(!msg.content.startsWith(json.hasOwnProperty("prefix") ? json.prefix : "!")) return;
			let command = msg.content.includes(" ") ? msg.content.split(" ")[0] : msg.content.substring(1, msg.content.length)
			
			
			if(commands.includes(command)){
				let cmd = commands[commands.indexOf(command)];
				for(var action in json.commands[cmd]){
					parse.parse(action, json.commands[cmd][action], client, msg, json.hasOwnProperty("splitArgsBy") ? json.splitArgsBy : " ")
				}
			}
		})
	}
}


