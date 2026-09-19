// Imports
const { MessageFlags } = require("discord.js");

const { BlueCommand, BlueMessage } = require("#structures");
const { getGuildData, getTicketData } = require("#utils").fetches;
const { memberIsAtLeastCategoryHelper } = require("#utils").checks;

const { queryDatabase } = require("#utils");

// Class for the tck-unclaim command
module.exports = class TckClaim extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "tck-unclaim");
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

        // If the ticket was found, ensure the invoking user is the current assignee
        if(bot_ticket.assignee_id != interaction.member.id) {
            const msg = new BlueMessage(this.client, "not-assignee", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        // If the user is the assignee, remove the ticket assignee
        await queryDatabase("UPDATE `Tickets` SET `assignee_id` = NULL WHERE `ticket_id` = ?", [ticketChannel.id]);

        // Build the response message
        const msg = new BlueMessage(this.client, "ticket-unassigned", locale, {
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