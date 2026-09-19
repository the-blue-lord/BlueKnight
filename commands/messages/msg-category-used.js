// Imports
const { BlueCommand, BlueMessage } = require("#structures");

// Class for the msg-category-used command
module.exports = class CategoryUsed extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "msg-category-used");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply();

        // Fetch the requested localisation
        const locale = interaction.options.get("localisation")?.value;
        
        // Build the response message
        const message = new BlueMessage(this.client, "category-used", locale);

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