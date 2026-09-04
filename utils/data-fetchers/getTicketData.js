const BlueMessage = require("../../structures/BlueMessage");
const queryDatabase = require("../queryDatabase");
const getGuildData = require("./getGuildData");

module.exports = async (ticket_id, locale = "en", client = null, interaction = null) => {
    const ticket_data = await queryDatabase("SELECT * FROM `Tickets` AS t JOIN `Categories` AS c ON t.category_id = c.category_id WHERE `ticket_id` = ?", [ticket_id]);

    if(!ticket_data || !ticket_data[0]) {
        if(client && interaction) {
            const msg = new BlueMessage(client, "ticket-not-found", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
        }
        throw new Error("Ticket not found in database");
        return;
    }

    return ticket_data[0];
};