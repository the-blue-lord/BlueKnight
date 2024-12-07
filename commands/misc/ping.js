const BlueCommand = require("../../structures/BlueCommand");

module.exports = class Ping extends BlueCommand {
    constructor(client) {
        super(client, "ping");
    }

    run(interaction) {
        console.command("Ping n." + interaction.id);
    }
};