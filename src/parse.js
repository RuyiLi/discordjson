var exports = module.exports = {};

exports.parse = function(key, value, client, msg = null, splitArg = null){
	
	var args = [];
	
	
	if(typeof value == "string"){
		value = value.replace("[ping]", client.ping + "ms");
		value = value.replace("[author]", msg == null ? "[author]" : msg.author.toString());
		if(value.match(/\[arg\]/g) != null){
			let numberOfArgs = value.match(/\[arg\]/g).length;
			let cleaned = msg.content.split(" ").slice(1).join(" ");
			for(var i = 0; i < numberOfArgs; i++){
				args.push(cleaned.split(splitArg)[i]);
			}
		}
	}
	
	if(key == "log"){
		if(Array.isArray(value)){
			for(var i in value){
				console.log(value[i]);
			}
			return;
		}else{
			return console.log(value);
		}
	}else if(key == "reply"){
		return msg.reply(value);
	}else if(key == "edit"){
		return msg.edit(value);
	}else if(key == "send"){
		return msg.channel.send(value);
	}else if(key == "ban"){
		let toSend = value;
		for(var i = 0; i < args.length; i++){
			toSend = toSend.replace("[arg]", args[i]);
		}
		if(args.length == 3){
			msg.guild.fetchMember(args[0]).then(m => m.ban({
				days: parseInt(args[1]),
				reason: args[2]
			})).catch(function(err){
				toSend = err.name + ": " + err.message;
				return msg.edit(toSend);
			});
		}else if(args.length == 2){
			if(args[1].match(/[a-zA-Z]/)){
				msg.guild.fetchMember(args[0]).then(m => m.ban(args[1])).catch(function(err){
					toSend = err.name + ": " + err.message;
					return msg.edit(toSend);
				});
			}else if(!args[1].match(/[a-zA-Z]/)){
				msg.guild.fetchMember(args[0]).then(m => m.ban(parseInt(args[1]))).catch(function(err){
					toSend = err.name + ": " + err.message;
					return msg.edit(toSend);
				});
			}
		}else if(args.length == 1){
			msg.guild.fetchMember(args[0]).then(m => m.ban()).catch(function(err){
				toSend = err.name + ": " + err.message;
				return msg.edit(toSend);
			});
		}
		return msg.edit(toSend);
	}else if(key == "kick"){
		let toSend = value;
		for(var i = 0; i < args.length; i++){
			toSend = toSend.replace("[arg]", args[i]);
		}
		if(args.length == 2){
			msg.guild.fetchMember(args[0]).then(m => m.kick(args[1])).catch(function(err){
				toSend = err.name + ": " + err.message;
				return msg.edit(toSend);
			});
		}else if(args.length == 1){
			msg.guild.fetchMember(args[0]).then(m => m.ban()).catch(function(err){
				toSend = err.name + ": " + err.message;
				return msg.edit(toSend);
			});
		}
		return msg.edit(toSend);
	}else if(key == "script"){
		var script = require(value);
		var func = Object.keys(script)[0];
		script[func](msg, client, discord)
	}
}
