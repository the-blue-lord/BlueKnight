const BlueMessage = require("../../structures/BlueMessage");
const memberIsBotAdmin = require("./memberIsBotAdmin");

module.exports = async (member, locale = "en", client = null, interaction = null) => {
    const isBotAdmin = await memberIsBotAdmin(member, client, interaction);

    if(!isBotAdmin) {
        if(client && interaction) {
            const msg = new BlueMessage(client, "not-admin", locale);
            
            const interaction_is_replied = interaction.replied || interaction.deferred;
            const blueReply = interaction_is_replied ? (...a) => interaction.editReply(...a) : (...a) => interaction.reply(...a);

            await blueReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: 64 // MessageFlags.Ephemeral = 64
            });
        }

        throw null;
        return;
    }

    return;
};