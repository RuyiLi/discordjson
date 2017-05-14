var exports = module.exports = {};

exports.ping = function(msg, client, discord){
	return msg.edit("Ping: `" + client.ping + "ms`");
}