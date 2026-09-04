// Imports
const { MessageFlags } = require("discord.js");
const BlueButton = require("../structures/BlueButton");
const BlueEmbed = require("../structures/BlueEmbed");
const BlueMessage = require("../structures/BlueMessage");
const queryDatabase = require("../utils/queryDatabase");

// Class for the button that denies the reopening request for a ticket
module.exports = class DenyReopeningButton extends BlueButton {
    // Constructor
    // NOTE: The close_message_id parameter is not used in this class
    constructor(client, locale, close_message_id) {
        // Build the button data
        super(client, "deny-reopening", locale);
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


        // Silently notify the successful denial only to the admin/helper
        const message = new BlueMessage(this.client, "denied-reopening", locale);
        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });

        // Build the embed to notify the denied reopening request
        const emebed = new BlueEmbed(this.client, "denied-reopening", locale, {
            denier_id: interaction.member.id,
            user_id: bot_ticket.user_id
        });

        // Publicly notify the denied reopening request in the ticket channel
        // NOTE: Can be added a ping to the user who reqeusted the reopening, maybe pingin always the ticket opener ao maybe not pinging anyone
        await interaction.channel.send({
            embeds: [emebed.embed],
            components: emebed.components,
            files: emebed.attachments
        });

        // Return
        return;
    }
};