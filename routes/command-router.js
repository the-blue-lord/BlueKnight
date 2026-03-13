const fs = require("fs");
const path = require("path");

const COMMANDS_FOLDER = global.COMMANDS_FOLDER;

module.exports = async (interaction) => {
    // --- If the interaction it's not a chat input command, exit
    if(!interaction.isChatInputCommand()) return;

    const {lastDir, commandName } = findDir(interaction);

    const commandFiles = fs.readdirSync(lastDir).filter(c => c.split(".").reverse()[0] == "js").map(c => path.join(lastDir, c.split(".").slice(0, -1).join(".")));

    // --- For each command in the folder
    for(const commandFile of commandFiles) {
        // --- Get the command object
        const commandClass = require(commandFile);
        const commandObject = new commandClass(interaction.client);

        // --- If it's the right one, run it
        if(commandObject.name == commandName) {
            await commandObject.run(interaction);
            return;
        }
    }
};

function findDir(interaction) {
    var lastDir = path.join(__dirname, "..", COMMANDS_FOLDER);
    var keys = [interaction.commandName, interaction.options.getSubcommandGroup(false), interaction.options.getSubcommand(false)];

    for(let i = 0; i < keys.length; i++) {
        const commandName = keys[i];
        if(!commandName) continue;

        const dir = fs.readdirSync(lastDir, {withFileTypes: true})
            ?.filter(e => e.isDirectory())
            ?.map(d => d.name)
            ?.find(dir =>
                JSON.parse(fs.readFileSync(path.join(lastDir, dir, "000-index.json"), "utf8")).name == commandName
            );

        if(!dir) return { lastDir, commandName };

        lastDir = path.join(lastDir, dir);
    };

    return { lastDir, commandName: keys[keys.length - 1] };
}