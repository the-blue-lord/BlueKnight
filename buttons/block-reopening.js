// Imports
const BlueMessage = require("../structures/BlueMessage");
const BlueButton = require("../structures/BlueButton");
const queryDatabase = require("../utils/queryDatabase");
const BlueEmbed = require("../structures/BlueEmbed");
const { MessageFlags } = require("discord.js");
const rebuildComponents = require("../utils/rebuildComponents");
const getGuildData = require("../utils/data-fetchers/getGuildData");
const getTicketData = require("../utils/data-fetchers/getTicketData");

// Class for the button used to block the reopening of a closed ticket
module.exports = class BlockReopeningButton extends BlueButton {
    // Constructor
    constructor(client, locale, close_message_id) {
        // Build the button data
        super(client, "block-reopening", locale, close_message_id);
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
        const ticketChannel = interaction.channel;

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const bot_ticket = await getTicketData(ticketChannel.id, bot_guild.locale, this.client, interaction);

        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastCategoryHelper(interaction.member, bot_ticket.category_id, locale, this.client, interaction);

        // Disable the old button to ask the ticket reopening
        const closing_message = await interaction.channel.messages.fetch(this.close_message_id);
        const new_components = rebuildComponents(closing_message.components, component =>  component.setDisabled(component.data?.custom_id?.startsWith("ask-reopening")));
        await closing_message.edit({
            components: new_components
        });

        // Notify the successful blockage of reopening requests
        const message = new BlueMessage(this.client, "blocked-reopening", locale);
        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });

        // Send a message in the ticket to notify the blockage of reopening requests
        const embed = new BlueEmbed(this.client, "blocked-reopening", locale, {
            blocker_id: interaction.member.id,
            user_id: bot_ticket.user_id
        });
        await interaction.channel.send({
            embeds: [embed.embed],
            files: embed.attachments,
            components: embed.components
        });

        // Return
        return;
    }
};