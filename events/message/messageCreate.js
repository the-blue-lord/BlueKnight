const BlueEvent = require("#sng/structures/BlueEvent");

const command_router = require("#sng/routes/command-router");

module.exports = class InteractionCreate extends BlueEvent {
    constructor(client) {
        super(client, "messageCreate");
    }

    async run(message) {
        if(message.guild.id == "1093573186307751987") {
            if(message.content.startsWith("!ad")) {
                message.delete();
            }
        }
    }
};