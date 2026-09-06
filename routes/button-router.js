const fs = require("fs");

module.exports = async interaction => {

    // --- If the interaction was not produced by a button, exit
    if(!interaction.isButton()) return;

    const buttonAction = interaction.customId.split("_")[0];
    const buttonData = interaction.customId.split("_").slice(1);

    const buttonsFolder = global.BUTTONS_FOLDER;

    for(const buttonFile of fs.readdirSync(buttonsFolder)) {
        if(buttonFile == ".module.js") continue;
        if(buttonFile.split(".").reverse()[0] != "js") continue;

        const buttonClass = require("../" + buttonsFolder + "/" + buttonFile);
        const buttonObject = new buttonClass(interaction.client, ...buttonData);
        if(buttonAction == buttonObject.action) return await buttonObject.run(buttonAction, interaction);
    }
};