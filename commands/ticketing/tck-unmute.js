// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { getGuildData, getTicketData } = require("#fetches");
const { memberIsAtLeastCategoryHelper } = require("#checks");

// Class for the tck-unmute command
module.exports = class TckUnmuteCommand extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-unmute");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        // Read the target ticket channel and user
        const ticketChannel = interaction.options?.getChannel("ticket-channel") || interaction.channel;
        const user = interaction.options?.getUser("user");

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

        // If the ticket was found, allow the user to send messages in the ticket
        ticketChannel.permissionOverwrites.edit(user.id, {
            SendMessages: true
        });

        // Build the response message
        const msg = new BlueMessage(this.client, "user-unmuted", locale, {
            user_id: user.id,
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