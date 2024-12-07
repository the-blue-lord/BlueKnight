const Discord = require("discord.js");
const BlueCommand = require("../../structures/BlueCommand");

module.exports = class PingTest extends BlueCommand {
    constructor(client) {
        super(client, "ping-test");
    }

    run(interaction) {
        console.command("Pong u." + interaction.id);
    }
};