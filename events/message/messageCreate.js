const BlueEvent = require("#structures").BlueEvent;

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