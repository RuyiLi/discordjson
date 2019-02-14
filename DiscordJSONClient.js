const { Client } = require('discord.js');
const path = require('path');
const fs = require('fs');

const ERRORS = {
    FILE_NOT_FOUND: (p) => new Error(`Could not find file ${p}.`),
    MISSING_SRC: (c) => new Error(`Command "${c}" missing required property "src".`),
    NO_COMMAND_NAME: new Error('Command missing required property "name".'),
    DUPLICATE_COMMAND: (c) => new Error(`Duplicate command "${c}."`),
    NO_PREFIX: new Error('No prefix configured.')
}

module.exports = class DiscordJSONClient extends Client {
    constructor(options, clientOptions = {}) { 
        super(clientOptions);

        this.client = this;

        /*
            JSON file containing bot data
        */
        this._json = require(path.join(options.root, options.file));

        /*

        */
        this.verbose = !!options.verbose;

        /*

        */
        this.surpressWarnings = !!options.surpressWarnings;

        /*
            Root directory where main bot file is being executed
        */
        this.root = options.root;

        /*
            @Array
            Bot prefixes, case-sensitive
        */
        this.prefixes = this._json.prefixes;

        /*
            @String
            Token! fix ur docs
        */
        this._token = this._json.token;

        this.events = this._json.events;
        this.commands = this._json.commands;
        this._commands = {};
    }

    initEvents() {
        /*
            Option 1: Specify root directory for events
            Option 2: Create array of objects in the form of 
            "events": [
                {
                    "name": "eventName"
                    "src": "file.js",
                    "foo": "bar"
                }
            ]
            Option 3: Create object in the form of 
            "events": {
                "eventName": {
                    "src": "file.js",
                    "foo": "bar"
                }
            }
        */

        let numEvents = 0;


        if(typeof this.events === 'string') {
            for(const file of fs.readdirSync(path.join(this.root, this.events))) {
                if(!file.endsWith('.js')) continue;
                const event = file.slice(0, -3);

                // if(this.client.listeners(event).length && !this.surpressWarnings) console.log(`[DiscordJSON] [WARN] Duplicate event: ${event}`);

                this.client.on(event, (args = null) => require(path.join(this.root, file)(this.client, args)));

                if(this.verbose) console.info(`[DiscordJSON] [INFO] Loaded ${event} event.`)
                numEvents++;
            }
        } else if(this.events instanceof Array) {
            for(const event of this.events) {
                // if(this.client.listeners(event.name).length && !this.surpressWarnings) console.log(`[DiscordJSON] [WARN] Duplicate event: ${event}`);

                const fpath = path.join(this.root, event.src);
                if(!fs.existsSync(fpath)) throw ERRORS.FILE_NOT_FOUND(fpath);

                this.client.on(event.name, (args = null) => require(fpath)(this.client, args, event));

                if(this.verbose) console.info(`[DiscordJSON] [INFO] Loaded ${event.name} event.`);
                numEvents++;
            }
        } else {
            for(const event of Object.entries(this.events)) {
                // if(this.client.listeners(event[0]).length && !this.surpressWarnings) console.log(`[DiscordJSON] [WARN] Duplicate event: ${event}`);
                // Requiring a JSON file removes all duplicate keys so this is redundant
                
                const fpath = path.join(this.root, event[1].src);
                if(!fs.existsSync(fpath)) throw ERRORS.FILE_NOT_FOUND(fpath);

                this.client.on(event[0], (args = null) => require(fpath)(this.client, args, event[1]));

                if(this.verbose) console.info(`[DiscordJSON] [INFO] Loaded ${event[0]} event.`);
                numEvents++;
            }
        }
        return numEvents;
    }

    handleMessage(msg) {
        if(msg.author.bot) return;
        let pre;
        if(this.prefixes.some(prefix => {
            pre = prefix;
            return msg.content.startsWith(prefix);
        })) {
            const [ command, ...args ] = msg.content.slice(pre.length).split(' ');
            if(!this._commands[command]) return;
            if(this.verbose) console.info(`[DiscordJSON] [INFO] Command ${command} executed with arguments [${args.join(', ')}]`);
            try {
                this._commands[command].run(this.client, msg, args, this._commands[command]);
            } catch(err) {
                throw err; //TODO proper handling
            }
        }
    }

    initCommands() {
        /*
            Option 1: Specify root directory for commands
            Option 2: Create array of objects in the form of 
            "events": [
                {
                    "name": "commandName"
                    "src": "file.js",
                    "foo": "bar"
                }
            ]
            Option 3: Create object in the form of 
            "commands": {
                "commandName": {
                    "src": "file.js",
                    "foo": "bar"
                }
            }
        */

        let numCommands = 0;

        if(typeof this.commands === 'string') {
            for(const file of fs.readdirSync(path.join(this.root, this.commands))) {
                if(!file.endsWith('.js')) continue;
                const command = file.slice(0, -3);
                this._commands[command] = {
                    name: command,
                    run: require(path.join(this.root, this.commands, file))
                }

                if(this.verbose) console.info(`[DiscordJSON] [INFO] Loaded ${command} command.`)
                numCommands++;
            }
        } else if(this.commands instanceof Array) {
            for(const cmd of this.commands) {
                const command = {
                    ...cmd,
                    names: [...(cmd.name ? [cmd.name] : []), ...(cmd.names || []), ...(cmd.aliases || [])],
                    run: require(path.join(this.root, cmd.src))
                };

                if(command.names.length === 0) throw ERRORS.NO_COMMAND_NAME;
                if(command.names.some(name => !!this._commands[name])) throw ERRORS.DUPLICATE_COMMAND(command.names[0]);
                if(!command.src) throw ERRORS.MISSING_SRC(command.names[0]);
                
                for(const name of command.names)
                    this._commands[name] = command;

                if(this.verbose) console.info(`[DiscordJSON] [INFO] Loaded ${command.names[0]} command.`)
                numCommands++;
            }
        } else {
            for(const command of Object.entries(this.commands)) {
                if(!command[1].src) throw ERRORS.MISSING_SRC(command[0]);
                this._commands[command[0]] = {
                    ...command[1],
                    names: [command[0], ...(command[1].aliases || [])],
                    run: require(path.join(this.root, command[1].src))
                };
                if(command.names.some(name => !!this._commands[name])) throw ERRORS.DUPLICATE_COMMAND(command[0]);

                if(this.verbose) console.info(`[DiscordJSON] [INFO] Loaded ${command[0]} event.`);
                numCommands++;
            }
        }

        this.client.on('message', this.handleMessage);
        return numCommands;
    }

    async init() {
        if(!this.prefixes || this.prefixes.length === 0) 
            throw ERRORS.NO_PREFIX;

        if(this.events) {
            const start = Date.now();
            let numEvents;
            try {   
                numEvents = await new Promise((res, rej) => {
                    try {
                        res(this.initEvents())
                    } catch(err) {
                        rej(err);
                    }
                });
            } catch(err) {
                throw err;
            }
            if(this.verbose) console.info(`[DiscordJSON] [INFO] Loaded ${numEvents} events in ${Date.now() - start}ms.`)
        }

        if(this.commands) {
            const start = Date.now();
            let numCommands;
            try {   
                numCommands = await new Promise((res, rej) => {
                    try {
                        res(this.initCommands());
                    } catch(err) {
                        rej(err);
                    }
                });
            } catch(err) {
                throw err;
            }
            if(this.verbose) console.info(`[DiscordJSON] [INFO] Loaded ${numCommands} commands in ${Date.now() - start}ms.`)
        }
    }

    login(token = this._token) {
        super.login(token);
    }
}