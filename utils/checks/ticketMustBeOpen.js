const BlueMessage = require("../../structures/BlueMessage");

module.exports = async (ticket_data, message_id, locale = "en", client = null, interaction = null) => {
    if(ticket_data.closed == "1") {
        if(client && interaction) {
            const msg = new BlueMessage(client, message_id, locale);
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