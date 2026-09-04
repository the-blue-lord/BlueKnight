// Imports
const { MessageFlags } = require("discord.js");
const BlueButton = require("../structures/BlueButton");
const deleteTicket = require("../routes/tickets/deleteTicket");
const getGuildData = require("../utils/data-fetchers/getGuildData");
const getTicketData = require("../utils/data-fetchers/getTicketData");
const memberIsAtLeastCategoryHelper = require("../utils/checks/memberIsAtLeastCategoryHelper");
const ticketMustBeClosed = require("../utils/checks/ticketMustBeClosed");

// Class for the button that deletes a ticket
module.exports = class DeleteTicketButton extends BlueButton {
    // Constructor
    constructor(client, locale) {
        // Build the button data
        super(client, "delete-ticket", locale);
    }

    // Button function
    async run(action, interaction) {
        // Check if it's the right event
        if(action != this.action) return;

        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Get the ticket channel
        const ticket_channel = interaction.channel;

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const bot_ticket = await getTicketData(ticket_channel.id, bot_guild.locale, this.client, interaction);

        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastCategoryHelper(interaction.member, bot_ticket.category_id, locale, this.client, interaction);

        // Check if the ticket is closed
        await ticketMustBeClosed(bot_ticket, "ticket-not-closed", locale, this.client, interaction);

        // Fetch the transcripts channel, if specified
        const transcript_channel_id = bot_guild.ticket_transcripts_channel;
        const transcripts_channel = transcript_channel_id && await interaction.guild.channels?.fetch(transcript_channel_id); // INSERTED FETCH

        // Call the appropriate function to delete the ticket
        // NOTE: Inserting bot_ticket into an array to maintain compatibility with the old deleteTicket function
        await deleteTicket(this.client, ticket_channel, [bot_ticket], transcripts_channel, interaction, locale);

        // Return
        return;
    }
}