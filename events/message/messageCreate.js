const BlueEvent = require("../../structures/BlueEvent");

const command_router = require("../../utilis/commands-router");

module.exports = class InteractionCreate extends BlueEvent {
    constructor(client) {
        super(client, "messageCreate");
    }

    run(message) {
        //console.event("Message: https://discord.com/channels/" + message.guild.id + "/" + message.channel.id +"/" + message.content);
    }
};