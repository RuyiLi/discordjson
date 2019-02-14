module.exports = async (client, msg, args) => {
    const ponger = await msg.channel.send('Pinging...');
    await ponger.edit(`Pong! The heartbeat ping is \`${ponger.createdTimestamp - msg.createdTimestamp}\`ms.\nThe client ping is \`${client.ping}\`ms`);
}