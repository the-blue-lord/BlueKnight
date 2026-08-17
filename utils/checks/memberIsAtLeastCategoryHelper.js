const BlueMessage = require("../../structures/BlueMessage");
const memberIsBotAdmin = require("./memberIsBotAdmin");
const memberIsCategoryHelper = require("./memberIsCategoryHelper");

module.exports = async (member, category_id, locale = "en", client = null, interaction = null) => {
    const isBotAdmin = await memberIsBotAdmin(member, client, interaction);
    const isCategoryHelper = await memberIsCategoryHelper(member, category_id, locale, client, interaction);
    
    if(!isBotAdmin && !isCategoryHelper) {
        if(client && interaction) {
            const msg = new BlueMessage(client, "not-category-helper", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
    
        }
    
        throw null;
        return;
    }

    return;
};