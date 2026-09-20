//Imports
const { BlueButton } = require("#structures");
const { ticketReopeningReason: TicketReopeningReasonModal } = require("#app/modals");
const { getGuildData } = require("#fetches");

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