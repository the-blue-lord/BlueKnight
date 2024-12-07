const BlueEvent = require("../../structures/BlueEvent");

const command_router = require("../../utilis/commands-router");

module.exports = class InteractionCreate extends BlueEvent {
    constructor(client) {
        super(client, "interactionCreate");
    }

    run(interaction) {
        if(interaction.isChatInputCommand) command_router(interaction);
    }
};