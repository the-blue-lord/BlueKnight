const BlueMessage = require("../../structures/BlueMessage");

module.exports = async (ticket_data, message_id, locale = "en", client = null, interaction = null) => {
    if(ticket_data.closed == "1") {
        if(client && interaction) {
            const msg = new BlueMessage(client, message_id, locale);
            
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