// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { getGuildData, getTicketData } = require("#fetches");
const { memberIsAtLeastCategoryHelper } = require("#checks");

// Class for the tck-assign command
module.exports = class TckAssign extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-assign");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Read the target user and ticket channel
        const user = interaction.options?.getUser("user");
        const ticketChannel = interaction.options?.getChannel("ticket-channel") || interaction.channel;

        // Fetch guild and ticket data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        const bot_ticket = await getTicketData(ticketChannel.id, locale, this.client, interaction);

        // Check if the user is authorized to manage the ticket
        await memberIsAtLeastCategoryHelper(interaction.member, bot_ticket.category_id, locale, this.client, interaction);

        // Assign the ticket to the selected user
        await queryDatabase("UPDATE `Tickets` SET `assignee_id` = ? WHERE `ticket_id` = ?", [user.id, ticketChannel.id]);

        // Build the response message
        const msg = new BlueMessage(this.client, "ticket-assigned", locale, {
            assignee_id: user.id,
            ticket_id: ticketChannel.id
        });

        // Send the response message
        interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        // Return
        return;
    }
};