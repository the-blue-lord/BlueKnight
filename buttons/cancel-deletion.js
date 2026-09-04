// Imports
const { MessageFlags, ButtonInteraction } = require("discord.js");
const BlueButton = require("../structures/BlueButton");
const queryDatabase = require("../utils/queryDatabase");
const rebuildComponents = require("../utils/rebuildComponents");
const BlueMessage = require("../structures/BlueMessage");
const getGuildData = require("../utils/data-fetchers/getGuildData");
const getTicketData = require("../utils/data-fetchers/getTicketData");
const memberIsAtLeastCategoryHelper = require("../utils/checks/memberIsAtLeastCategoryHelper");

// Class for the button that cancels the deletion of a ticket
module.exports = class CancelDeletionButton extends BlueButton {
    // Constructor
	constructor(client, locale, deletion_message_id) {
        // Build the button data
        super(client, "cancel-deletion", locale, deletion_message_id);
        this.deletion_message_id = deletion_message_id;
    }

    // Button function
    async run(action, interaction) {
        // Check if it's the right event
        if(action != this.action) return;

        // Not deferring the interaction reply to let the bot be able to disable confirm/cancel deletion buttons

        // Get the ticket channel
        const ticket_channel = interaction.channel;

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const bot_ticket = await getTicketData(ticket_channel.id, bot_guild.locale, this.client, interaction);

        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastCategoryHelper(interaction.member, bot_ticket.category_id, locale, this.client, interaction);

        // Disable confirm and cancel deletion buttons
        const new_components = rebuildComponents(interaction.message.components, component => component.setDisabled(true));
        await interaction.update({
            components: new_components
        });

        // Return
        return;
    }
}