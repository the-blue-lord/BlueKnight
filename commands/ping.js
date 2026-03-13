const BlueCommand = require("../structures/BlueCommand");

module.exports = class Ping extends BlueCommand {
    constructor(client) {
        super(client, "ping");
    }

    async run(interaction) {
        const start = Date.now();
        await interaction.deferReply();
        await interaction.editReply("WebSocket ping: " + interaction.client.ws.ping + "ms | Interaction latency: " + (Date.now()-start) + "ms");
        return;
    }
};