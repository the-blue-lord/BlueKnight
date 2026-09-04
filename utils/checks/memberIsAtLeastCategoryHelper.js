const BlueMessage = require("../../structures/BlueMessage");
const memberIsBotAdmin = require("./memberIsBotAdmin");
const memberIsCategoryHelper = require("./memberIsCategoryHelper");
const { MessageFlags } = require("discord.js");

module.exports = async (member, category_id, locale = "en", client = null, interaction = null, reply_sent = true) => {
    const isBotAdmin = await memberIsBotAdmin(member, client, interaction);
    const isCategoryHelper = await memberIsCategoryHelper(member, category_id, locale, client, interaction);

    if(!isBotAdmin && !isCategoryHelper) {
        if(client && interaction) {
            const msg = new BlueMessage(client, "not-category-helper", locale);
            
            const interaction_is_replied = interaction.replied || interaction.deferred;
            const blueReply = interaction_is_replied ? (...a) => interaction.editReply(...a) : (...a) => interaction.reply(...a);

            await blueReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: MessageFlags.Ephemeral
            });
    
        }
    
        throw null;
        return;
    }

    return;
};