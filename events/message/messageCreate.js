const BlueEvent = require("../../structures/BlueEvent");

const command_router = require("../../routes/command-router");

module.exports = class InteractionCreate extends BlueEvent {
    constructor(client) {
        super(client, "messageCreate");
    }

    async run(message) {}
};