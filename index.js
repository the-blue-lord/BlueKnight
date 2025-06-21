// Imports

require("dotenv").config();
const fs = require("fs");
const yaml = require("yaml");
const mysql = require("mysql");
const { Client, GatewayIntentBits, Partials, REST, Routes, applicationDirectory } = require("discord.js");



// Console element extension for custom logging

const old_error = console.error
console.event = (...msg) => console.log("[EVENT]", ...msg);
console.command = (...msg) => console.log("[COMMAND]", ...msg);
console.error = (...msg) => old_error("[ERROR]", ...msg);



// Initializations

initProcessListeners();

initDatabase();

initClient();

initEvents();

initCommands();



// Initializers

function initProcessListeners() {
    process.on('SIGINT', async () => {
        if (global.DATABASE) {
            global.DATABASE.end();
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
    
    process.on('uncaughtException', async (err) => {
        console.error('Uncaught Exception:', err);
    });
    
    process.on('unhandledRejection', async (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

function initDatabase() {
    global.DATABASE = mysql.createConnection({
        host: process.env.HOST,
        port: process.env.PORT,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        charset: 'utf8mb4'
    });

    global.EVENTS_FOLDERS = "events";
    global.COMMANDS_FOLDERS = "commands";
    global.BUTTONS_FOLDER = "buttons";
    global.MENUS_FOLDER = "menus";
    global.MODALS_FOLDER = "modals";
}

function initClient() {
    global.client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ],

        partials: [
            Partials.Message
        ]
    });
    global.client.commands = yaml.parse(fs.readFileSync("configs/commands.yml", "utf-8"));

    global.client.login(process.env.TOKEN);
}

async function initCommands() {
    // Get command folders
    const command_folders = fs.readdirSync(global.COMMANDS_FOLDERS);
    const commands = [];

    // For each command folder
    command_folders.forEach(command_folder => {
        // Get commands in the folder
        const commandFolderPath = global.COMMANDS_FOLDERS + "/" + command_folder;
        const commandFiles = fs.readdirSync(commandFolderPath).filter(c => c.split(".").reverse()[0] == "js").map(c => "./" + commandFolderPath + "/" + c.split(".").slice(0, -1).join("."));

        // Store the commands in an array
        commandFiles.forEach(commandFile => {
            const commandClass = require(commandFile);
            const commandObject = new commandClass(client);
            commands.push(commandObject);
        });
    });

    // Split the public commands and the testing commands
    const application_commands = commands.filter(command => !command.test && !command.guild_specific);
    const test_commands = commands.filter(command => command.test);
    const guild_commands = commands.filter(command => !command.test && command.guild_specific);

    // Get the rest object, the public commands and the testing commands
    const rest = new REST().setToken(process.env.TOKEN);
    const applicationCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));

    if(parseInt(process.env.UPDATE_GUILD_COMMANDS)) {
        console.command("Updating guild commands...");
        for(const [guild_id, guild] of client.guilds.cache) {
            const commandsInGuild = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, guild.id));
            if(commandsInGuild.length) {
                await Promise.all(commandsInGuild.map(async command => {
                    await rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, guild.id, command.id));
                }));
            }
            if(guild_commands.length) await rest.put(Routes.applicationCommands(process.env.CLIENT_ID, guild.id), {body: guild_commands.map(command => command.getData())});
        }
        console.command("Guild commands updated");
    }

    if(parseInt(process.env.UPDATE_COMMANDS)) {
        console.command("Updating commands...");

        // Replace old public commands with the new ones //
        await Promise.all(applicationCommands.map(async command => {
            await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, command.id));
        }));
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: application_commands.map(command => command.getData())});

        // Add new testing commands //
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: test_commands.map(command => command.getData())});

        console.command("Commands updated");
    }
}

async function initEvents() {
    // Get event folders
    const event_folders = fs.readdirSync(global.EVENTS_FOLDERS);

    // For each event folder
    event_folders.forEach(event_folder => {
        // Get events in the folder
        const eventFolderPath = global.EVENTS_FOLDERS + "/" + event_folder;
        const eventFiles = fs.readdirSync(eventFolderPath).filter(e => e.split(".").reverse()[0] == "js").map(e => "./" + eventFolderPath + "/" + e.split(".").slice(0, -1).join("."));

        // Init all events in the folder
        eventFiles.forEach(eventFile => {
            const eventClass = require(eventFile);
            const eventObject = new eventClass(client);
            eventObject.init();
        });
    });
}