// Imports
const BlueMessage = require("../structures/BlueMessage");
const BlueButton = require("../structures/BlueButton");
const queryDatabase = require("../utils/queryDatabase");
const BlueEmbed = require("../structures/BlueEmbed");
const { MessageFlags } = require("discord.js");
const rebuildComponents = require("../utils/rebuildComponents");
const getGuildData = require("../utils/data-fetchers/getGuildData");
const getTicketData = require("../utils/data-fetchers/getTicketData");
const memberIsAtLeastCategoryHelper = require("../utils/checks/memberIsAtLeastCategoryHelper");
const ticketMustBeClosed = require("../utils/checks/ticketMustBeClosed");

// Class for the button that accepts a ticket reopening request
module.exports = class AcceptReopeningButton extends BlueButton {
    // Constructor
    constructor(client, locale, close_message_id) {
        // Build the button data
        super(client, "accept-reopening", locale, close_message_id);
        this.close_message_id = close_message_id;
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
        await ticketMustBeClosed(bot_ticket, locale, this.client, interaction);

        // Reopen the ticket
        const reopenTicket = require("../routes/tickets/reopenTicket");
        await reopenTicket(this.client, interaction.guild, ticket_channel, locale, interaction.member.id, true);

        // Disable the old button to ask reopenings to prevent the user to bypass a possible reopening blockage
        const closing_message = await interaction.channel.messages.fetch(this.close_message_id);
        const new_components = rebuildComponents(closing_message.components, component => component.setDisabled(component.data?.custom_id?.startsWith("ask-reopening")));
        await closing_message.edit({
            components: new_components
        });

        // Notify the successful reopening
        const message = new BlueMessage(this.client, "accepted-reopening", locale);
        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });

        // Disable the old buttons used to manage the reopening request
        const interaction_components = rebuildComponents(interaction.message.components, component => {
            if(
                component.data?.custom_id?.startsWith("accept-reopening") ||
                component.data?.custom_id?.startsWith("deny-reopening") ||
                component.data?.custom_id?.startsWith("block-reopening")
            ) component.setDisabled(true);
        });
        await interaction.message.edit({
            components: interaction_components
        });

        // Return
        return;
    }
};