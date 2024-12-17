const BlueEvent = require("../../structures/BlueEvent");

const button_router = require("../../routes/button-router");
const command_router = require("../../routes/commands-router");

module.exports = class InteractionCreate extends BlueEvent {
    constructor(client) {
        super(client, "interactionCreate");
    }

    run(interaction) {
        if(interaction.isChatInputCommand()) command_router(interaction);
        if(interaction.isButton()) button_router(interaction);
    }
};