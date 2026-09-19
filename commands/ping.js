// Imports
const { BlueCommand } = require("#structures");

// Class for the ping command
module.exports = class Ping extends BlueCommand {
    // Constructor
    constructor(client) {
        // Build the command data
        super(client, "ping");
    }

    // Command function
    async run(interaction) {
        // Record the time before handling the interaction
        const start = Date.now();

        // Defer the reply to the interaction
        await interaction.deferReply();

        // Send the latency measurements
        await interaction.editReply("WebSocket ping: " + interaction.client.ws.ping + "ms | Interaction latency: " + (Date.now()-start) + "ms");

        // Return
        return;
    }
};