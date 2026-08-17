const BlueMessage = require("../../structures/BlueMessage");

module.exports = async (ticket_data, locale = "en", client = null, interaction = null) => {
    if(ticket_data.closed == "0") {
        if(client && interaction) {
            const msg = new BlueMessage(client, "ticket-already-open", locale);
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