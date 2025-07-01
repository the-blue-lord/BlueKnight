const fs = require("fs");

module.exports = async interaction => {

    // --- If the interaction was not produced by a menu, exit
    if(!interaction.isStringSelectMenu()) return;

    const menuAction = interaction.customId.split("_")[0];
    const menuData = interaction.customId.split("_").slice(1);

    const menusFolder = global.MENUS_FOLDER;

    for(const menuFile of fs.readdirSync(menusFolder)) {
        if(menuFile.split(".").reverse()[0] != "js") continue;

        const menuClass = require("../" + menusFolder + "/" + menuFile);
        const menuObject = new menuClass(interaction.client, ...menuData);
        if(menuAction == menuObject.action) return await menuObject.run(menuAction, interaction);
    }
};