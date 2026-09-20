// Imports
const { BlueCommand } = require("#structures");
const { getGuildData } = require("#fetches");
const { memberIsAtLeastBotAdmin } = require("#checks");

const { categoryData: CategoryDataModal } = require("#app/modals");

// Class for the set-add_ticket_category command
module.exports = class SetAddTicketCategory extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "set-add_ticket_category");
    }

    // Command function
    async run(interaction) {
        // Fetch guild configuration
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Read the category name from the command options
        const categoryName = interaction.options.getString("name");

        // Build and display the category data modal
        const categoryDataModal = new CategoryDataModal(this.client, locale, categoryName);
        await categoryDataModal.build();
            
        await interaction.showModal(categoryDataModal.modal);

        // Return
        return;
    }
};