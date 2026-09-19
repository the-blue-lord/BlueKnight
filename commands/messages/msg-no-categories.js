// Imports
const { BlueCommand, BlueMessage } = require("#structures");

// Class for the msg-no-categories command
module.exports = class NoCategories extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "msg-no-categories");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply();

        // Fetch the requested localisation
        const locale = interaction.options.get("localisation")?.value;
        
        // Build the response message
        const message = new BlueMessage(this.client, "no-categories", locale);

        // Send the response message
        await interaction.editReply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components
        });

        // Return
        return;
    }
};