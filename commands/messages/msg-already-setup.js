// Imports
const { BlueCommand, BlueMessage } = require("#structures");

// Class for the msg-already-setup command
module.exports = class AlreadySetup extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "msg-already-setup");
    }

    // Command function
    async run(interaction) {
        // Defer the reply to the interaction
        await interaction.deferReply();

        // Fetch the requested localisation
        const locale = interaction.options.get("localisation")?.value;
        
        // Build the response message
        const message = new BlueMessage(this.client, "already-setup", locale);

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