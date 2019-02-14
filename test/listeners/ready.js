module.exports = (client, args, extras) => {
    console.log('Ready! ' + client.user.id);
    console.log('Extras: ' + extras.foo);
}