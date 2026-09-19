// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { queryDatabase } = require("#utils");
const { getGuildData, getTicketData } = require("#utils").fetches;
const { memberIsAtLeastCategoryHelper } = require("#utils").checks;

// Class for the tck-claim command
module.exports = class TckClaim extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-claim");
    }
    
    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Use the invoking user and resolve the target ticket channel
        const user = interaction.user;
        const ticketChannel = interaction.options?.getChannel("ticket-channel") || interaction.channel;

        // Fetch guild and ticket data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        const bot_ticket = await getTicketData(ticketChannel.id, locale, this.client, interaction);

        // Check if the user is authorized to manage the ticket
        await memberIsAtLeastCategoryHelper(interaction.member, bot_ticket.category_id, locale, this.client, interaction);

        // Assign the ticket to the invoking user
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