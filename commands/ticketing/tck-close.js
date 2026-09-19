// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { getGuildData, getTicketData } = require("#utils").fetches;
const { memberIsAtLeastCategoryHelper, ticketMustBeOpen } = require("#utils").checks;

// Class for the tck-close command
module.exports = class TckClose extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-close");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Resolve the target ticket channel
        const ticketChannel = interaction.options?.getChannel("ticket-channel") || interaction.channel;

        // Fetch guild and ticket data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        const bot_ticket = await getTicketData(ticketChannel.id, locale, this.client, interaction);

        // Check if the user is authorized to manage the ticket
        await memberIsAtLeastCategoryHelper(interaction.member, bot_ticket.category_id, locale, this.client, interaction);

        // Ensure the ticket is currently open
        await ticketMustBeOpen(bot_ticket, locale, this.client, interaction);

        // Close the ticket through the ticket route
        const { closeTicket } = require("#routes").ticketRouter;
        await closeTicket(this.client, interaction.guild, ticketChannel, locale, interaction.member.id);

        // Build the response message
        const message = new BlueMessage(this.client, "ticket-closed", locale);
        // Send the response message
        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });

        // Return
        return;
    }
}