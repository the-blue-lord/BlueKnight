// Imports

require("dotenv").config();
const fs = require("fs");
const yaml = require("yaml");
const path = require("path");
const mysql = require("mysql");
const { Client, GatewayIntentBits, Partials, REST, Routes, applicationDirectory } = require("discord.js");



// Console element extension for custom logging

const old_error = console.error
console.event = (...msg) => console.log("[EVENT]", ...msg);
console.command = (...msg) => console.log("[COMMAND]", ...msg);
console.error = (...msg) => old_error("[ERROR]", ...msg);



// Global variables

global.EVENTS_FOLDERS = "events";
global.COMMANDS_FOLDER = "commands";
global.BUTTONS_FOLDER = "buttons";
global.MENUS_FOLDER = "menus";
global.MODALS_FOLDER = "modals";



// Initializations

initProcessListeners();

initDatabase();

initClient();



// Initializers

function initProcessListeners() {
    process.on("SIGINT", async () => {
        if (global.DATABASE) {
            global.DATABASE.end();
            console.log("Database connection closed.");
        }
        process.exit(0);
    });
    
    process.on("uncaughtException", async (err) => {
        console.error("Uncaught Exception:", err);
    });
    
    process.on("unhandledRejection", async (reason, promise) => {
        console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });
}

function initDatabase() {
    global.DATABASE = mysql.createConnection({
        host: process.env.HOST,
        port: process.env.PORT,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        charset: "utf8mb4"
    });
}

async function initClient() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ],

        partials: [
            Partials.Message
        ]
    });
    client.commands = yaml.parse(fs.readFileSync("configs/commands.yml", "utf-8"));

    await client.login(process.env.TOKEN);

    global.client = client;

    initEvents(client);

    initCommands(client);
}

async function initCommands(client) {
    // Fetch commands
    const { test_commands, commands } = getFolderCommands(client, "commands");

    //console.log(JSON.stringify(test_commands, null, 4));

    // Register the commands
    await client.application?.commands?.set(commands);
    await client.guilds?.cache?.get(process.env.GUILD_ID)?.commands?.set(test_commands);

    // Log commands registration
    console.command("Commands registered");
}

async function initEvents(client) {
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

function readDirSeparately(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    const files = [];
    const directories = [];

    for (const entry of entries) {
        if (entry.isFile()) {
            files.push(entry.name);
        } else if (entry.isDirectory()) {
            directories.push(entry.name);
        }
    }

    return { files, directories };
}

function getFolderCommands(client, folderPath) {
    const commands = [];
    const test_commands = [];

    const { files, directories } = readDirSeparately(folderPath);

    files.forEach(file => {
        if(file == "000-index.json") return;
        const commandClass = require(path.join(__dirname, folderPath, file));
        const commandObject = new commandClass(client);
        const data = commandObject.getData();
        if(commandObject.test) test_commands.push(data);
        else commands.push(data);
    });

    directories.forEach(directory => {
        const subData = JSON.parse(fs.readFileSync(path.join(folderPath, directory, "000-index.json"), "utf-8"));
        const { test_commands: test_options, commands: options} = getFolderCommands(client, path.join(folderPath, directory));
        if(test_options.length) test_commands.push({
            "type": subData.type,
            "name": subData.name,
            "description": subData.description,
            "options": test_options
        });
        if(options.length) commands.push({
            "type": subData.type,
            "name": subData.name,
            "description": subData.description,
            "options": options
        });
    });

    return {test_commands, commands};
}