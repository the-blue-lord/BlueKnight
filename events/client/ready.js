const { ActivityType } = require("discord.js");
const BlueEvent = require("#sng/structures/BlueEvent");

module.exports = class Ready extends BlueEvent {
    constructor(client) {
        super(client, "clientReady");
    }

    async run(client) {
        console.event("Client", client?.user?.username, "is online");

        client.user.setActivity("/help", { type: ActivityType.Listening });
    }
};