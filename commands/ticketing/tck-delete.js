// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand } = require("#structures");
const { getGuildData, getTicketData } = require("#utils").fetches;
const { memberIsAtLeastCategoryHelper, ticketMustBeClosed } = require("#utils").checks;
const { deleteTicket } = require("#routes").ticketRouter;

// Class for the tck-delete command
module.exports = class TckDeleteCommand extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-delete");
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
        // Ensure the ticket is currently closed
        await ticketMustBeClosed(bot_ticket, locale, this.client, interaction);

        // Fetch the configured transcript channel
        const transcriptsChannel = await interaction.guild.channels?.fetch(bot_guild.ticket_transcripts_channel);

        // Delete the ticket through the ticket route
        await deleteTicket(this.client, ticketChannel, [bot_ticket], transcriptsChannel, interaction, locale);

        // Return
        return;
    }
};