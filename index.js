const fs = require("fs");
const yaml = require("yaml");
const { Client, GatewayIntentBits, Partials, REST, Routes, applicationDirectory } = require("discord.js");

// --- Console element extension for custom logging
const old_error = console.error
console.event = (...msg) => console.log("[EVENT]", ...msg);
console.command = (...msg) => console.log("[COMMAND]", ...msg);
console.error = (...msg) => old_error("[ERROR]", ...msg);

const EVENTS_FOLDERS = "events";
const COMMANDS_FOLDERS = "commands";
const BUTTONS_FOLDER = "buttons"

global.EVENTS_FOLDERS = EVENTS_FOLDERS;
global.COMMANDS_FOLDERS = COMMANDS_FOLDERS;
global.BUTTONS_FOLDER = BUTTONS_FOLDER

// Client init //

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],

    partials: [
        Partials.Message
    ]
});
client.commands = yaml.parse(fs.readFileSync("configs/commands.yml", "utf-8"));

client.login(process.env.TOKEN);
initEvents();
initCommands();

async function initCommands() {
    // --- Get command folders
    const commands_folders = fs.readdirSync(COMMANDS_FOLDERS);
    const commands = [];

    // --- For each command folder
    commands_folders.forEach(commands_folder => {
        // --- Get commands in the folder
        const commandsFolderPath = COMMANDS_FOLDERS + "/" + commands_folder;
        const commandFiles = fs.readdirSync(commandsFolderPath).filter(c => c.split(".").reverse()[0] == "js").map(c => "./" + commandsFolderPath + "/" + c.split(".").slice(0, -1).join("."));

        // --- Store the commands in an array
        commandFiles.forEach(commandFile => {
            const commandClass = require(commandFile);
            const commandObject = new commandClass(client);
            commands.push(commandObject);
        });
    });

    // --- Split the public commands and the testing commands
    const application_commands = commands.filter(command => !command.test);
    const test_commands = commands.filter(command => command.test);

    // --- Get the rest object, the public commands and the testing commands
    const rest = new REST().setToken(process.env.TOKEN);
    const applicationCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
    const guildCommands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID));

    if(parseInt(process.env.UPDATE_COMMANDS)) {
        console.command("Updating commands...");
        // --- Replace old public commands with the new ones //
        for(const command of applicationCommands) await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, command.id));
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {body: application_commands.map(command => command.getData())});

        // --- Replace old testing commands with the new ones //
        for(const command of guildCommands) await rest.delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id));
        
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: test_commands.map(command => command.getData())});
        console.command("Commands updated");
    }

}

async function initEvents() {
    // --- Get event folders
    const events_folders = fs.readdirSync(EVENTS_FOLDERS);

    // --- For each event folder
    events_folders.forEach(events_folder => {
        // --- Get events in the folder
        const eventsFolderPath = EVENTS_FOLDERS + "/" + events_folder;
        const eventFiles = fs.readdirSync(eventsFolderPath).filter(e => e.split(".").reverse()[0] == "js").map(e => "./" + eventsFolderPath + "/" + e.split(".").slice(0, -1).join("."));

        // --- Init all events in the folder
        eventFiles.forEach(eventFile => {
            const eventClass = require(eventFile);
            const eventObject = new eventClass(client);
            eventObject.init();
        });
    });
}

function compareJson(obj1, obj2) {
    if(obj1 == obj2) return true;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if(keys1.length != keys2.length) return false;

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        // If the arrays are of different lengths, they can't be equal
        if (obj1.length !== obj2.length) return false;

        // Compare each element in the arrays
        for (let i = 0; i < obj1.length; i++) {
            if (!compareJson(obj1[i], obj2[i])) return false;
        }
        return true;
    }

    for(let index = 0; index < keys1.length; index++) 
        if(!compareJson(obj1[keys1[index]], obj2[keys1[index]]))
            return false;

    return true;
}