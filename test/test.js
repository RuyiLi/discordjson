const { DiscordJSONClient } = require('../index');

const client = new DiscordJSONClient({
    root: __dirname,
    file: './test.json',
    verbose: true
}, {
    disableEveryone: true
});

client.init().then(() => {
    /*
        If no token is provided, discord.json will attempt to find one from your JSON file.
    */
    client.login();
}).catch(console.error);