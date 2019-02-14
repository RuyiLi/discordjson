module.exports = (client, msg, args, extras) => {
    msg.reply(args.join(' '));
    msg.reply(extras.test)
}