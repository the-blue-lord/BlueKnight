// Imports

const { BlueCommand } = require("#structures");
const { getGuildData } = require("#fetches");
const { memberIsAtLeastBotAdmin } = require("#checks");
const { customizePanel: CustomizePanelModal } = require("#app/modals");

// Class for the set-ticket_panel command
module.exports = class StnPanel extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "set-ticket_panel");
    }

    // Command function
    async run(interaction) {
        // Fetch guild configuration
        const bot_guild = await getGuildData(interaction.guild.id, this.client, interaction);
        const locale = bot_guild.locale;

        // Check if the user is authorized to run this command
        await memberIsAtLeastBotAdmin(interaction.member, locale, this.client, interaction);

        // Read the current ticket panel settings
        const panel_title = bot_guild.ticket_panel_title;
        const panel_description = bot_guild.ticket_panel_description;
        const panel_color = bot_guild.ticket_panel_color;

        // Build and display the panel customization modal
        const modal = new CustomizePanelModal(this.client, locale);
        modal.build({
            panel_title: panel_title || undefined,
            panel_description: panel_description || undefined,
            panel_color: panel_color || "#03bafc"
        });

        await interaction.showModal(modal.modal);

        // Return
        return;
    }
};