// Imports
const { MessageFlags, ButtonStyle } = require("discord.js");
const BlueMessage = require("../structures/BlueMessage");
const BlueButton = require("../structures/BlueButton");
const getGuildData = require("../utils/data-fetchers/getGuildData");
const getTicketData = require("../utils/data-fetchers/getTicketData");
const memberIsAtLeastCategoryHelper = require("../utils/checks/memberIsAtLeastCategoryHelper");
const ticketMustBeOpen = require("../utils/checks/ticketMustBeOpen");


// Class for the button that closes a ticket
module.exports = class CloseTicketButton extends BlueButton {
    // Constructor
    constructor(client, locale) {
        // Build the button data
        super(client, "close-ticket", locale);
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

        // Check if the ticket can be closed
        await ticketMustBeOpen(bot_ticket, "ticket-already-closed", locale, this.client, interaction);
        
        // Close the ticket
        const closeTicket = require("../routes/tickets/closeTicket");
        await closeTicket(this.client, interaction.guild, ticket_channel, locale, interaction.member.id);

        // Notify the successful closure
        const message = new BlueMessage(this.client, "ticket-closed", locale);
        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });

        // Return
        return;
    }
};