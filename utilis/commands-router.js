const fs = require("fs");

const COMMANDS_FOLDERS =global. COMMANDS_FOLDERS;

module.exports = (interaction) => {
    // --- If the interaction it's not a chat input command, exit
    if(!interaction.isChatInputCommand) return;

    // --- Get command folders
    const commands_folders = fs.readdirSync(COMMANDS_FOLDERS);

    // --- Fore each command folder
    for(let i = 0; i < commands_folders.length; i++) {
        const commands_folder = commands_folders[i];

        // --- Get commands in the folder
        const commandsFolderPath = COMMANDS_FOLDERS + "/" + commands_folder;
        const commandFiles = fs.readdirSync(commandsFolderPath).filter(c => c.split(".").reverse()[0] == "js").map(c => "../" + commandsFolderPath + "/" + c.split(".").slice(0, -1).join("."));

        // --- For each command in the folder
        for(let j = 0; j < commandFiles.length; j++) {
            const commandFile = commandFiles[i];

            // --- Get the command object
            const commandClass = require(commandFile);
            const commandObject = new commandClass(interaction.client);

            // --- If it's the right one, run it
            if(commandObject.name == interaction.commandName) {
                commandObject.run(interaction);
                return;
            }
        }
    }
};