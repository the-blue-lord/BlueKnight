const BlueEvent = require("../../structures/BlueEvent");

module.exports = class Ready extends BlueEvent {
    constructor(client) {
        super(client, "ready");
    }

    run(client) {
        console.event("Client", client?.user?.username, "is online");
    }
};