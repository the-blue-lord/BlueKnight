// Imports
const { ButtonStyle } = require("discord.js");
const BlueButton = require("../structures/BlueButton");
const TicketReopeningReasonModal = require("../modals/ticket-reopening-reason");
const queryDatabase = require("../utils/queryDatabase");
const getGuildData = require("../utils/data-fetchers/getGuildData");

// Class for the button used to request the reopening of a closed ticket
module.exports = class AskTicketReopeningButton extends BlueButton {
    // Constructor
    constructor(client, locale) {
        // Build the button data
        super(client, "ask-reopening", locale);
    }

    // Button function
    async run(action, interaction) {
        // Check if it's the right event
        if(action != this.action) return;

        // Fetch database data
        const bot_guild = await getGuildData(interaction.guild.id);
        const locale = bot_guild.locale;

        // Build the modal used as questionnaire for the ticket reopening
        const modal = new TicketReopeningReasonModal(this.client, locale, interaction.channel.id);
        await modal.build();

        // Reply with the questionnaire
        interaction.showModal(modal.modal);

        // Return
        return;
    }
};