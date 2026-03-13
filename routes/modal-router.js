const fs = require("fs");
const queryDatabase = require("../utils/queryDatabase");

module.exports = async interaction => {
    
    // --- If the interaction was not produced by a modal, exit
    if(!interaction.isModalSubmit()) return;

    const modalAction = interaction.customId.split("_")[0];
    const modalData = interaction.customId.split("_").slice(1);

    const modalsFolder = global.MODALS_FOLDER;

    const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
    const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

    for(const modalFile of fs.readdirSync(modalsFolder)) {
        if(modalFile.split(".").reverse()[0] != "js") continue;
        
        const modalClass = require("../" + modalsFolder + "/" + modalFile);
        const modalObject = new modalClass(interaction.client, locale, ...modalData);
        if(modalAction == modalObject.action) return await modalObject.run(modalAction, interaction);
    }
}