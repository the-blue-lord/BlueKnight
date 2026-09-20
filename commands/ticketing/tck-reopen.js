// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { getGuildData, getTicketData } = require("#fetches");
const { memberIsAtLeastCategoryHelper } = require("#checks");

// Class for the tck-reopen command
module.exports = class TckReopen extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-reopen");
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

        // If the ticket was not found, send an error message
        if(!bot_ticket) {
            const msg = new BlueMessage(this.client, "ticket-not-found", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        // If the ticket is already open, notify the user
        if(bot_ticket.closed == "0") {
            const msg = new BlueMessage(this.client, "ticket-already-open", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        // If the ticket is closed, reopen it through the ticket route
        const { reopenTicket } = require("#routes").ticketRouter;
        await reopenTicket(this.client, interaction.guild, ticketChannel, locale, interaction.member.id);
        
        // Build the response message
        const message = new BlueMessage(this.client, "ticket-reopened", locale);
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