// Imports
const { MessageFlags } = require("discord.js");

const { BlueButton, BlueMessage } = require("#structures");
const { getGuildData, getTicketData } = require("#utils").fetches;
const { memberIsAtLeastCategoryHelper, ticketMustBeClosed } = require("#utils").checks;

// Class for the button that reopens a closed ticket
module.exports = class ReopenTicketButton extends BlueButton {
    // Constructor
    constructor(client, locale) {
        // Build the button data
        super(client, "reopen-ticket", locale);
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

        // Check that the ticket is closed before reopening it
        await ticketMustBeClosed(bot_ticket, "ticket-already-open", locale, this.client, interaction);

        // Import and call the appropriate function to reopen the ticket, importing function now to avoid circular dependencies that make the bot crash on startup
        const { reopenTicket } = require("#routes").ticketRouter;
        await reopenTicket(this.client, interaction.guild, ticket_channel, locale, interaction.member.id);

        // Notify the successful reopening of the ticket
        const message = new BlueMessage(this.client, "ticket-reopened", locale);
        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });

        // Return
        return;
    }
}