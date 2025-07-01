const BlueEvent = require("../../structures/BlueEvent");

const router = require("../../routes/router");

module.exports = class InteractionCreate extends BlueEvent {
    constructor(client) {
        super(client, "interactionCreate");
    }

    async run(interaction) {
        if(interaction.isChatInputCommand()) await router.command(interaction);
        else if(interaction.isButton()) await router.button(interaction);
        else if(interaction.isStringSelectMenu()) await router.menu(interaction);
        else if(interaction.isModalSubmit()) await router.modal(interaction);

        return;
    }
};