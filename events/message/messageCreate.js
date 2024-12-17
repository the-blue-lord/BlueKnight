const BlueEvent = require("../../structures/BlueEvent");

const command_router = require("../../routes/commands-router");

module.exports = class InteractionCreate extends BlueEvent {
    constructor(client) {
        super(client, "messageCreate");
    }

    run(message) {}
};