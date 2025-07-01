const BlueEvent = require("../../structures/BlueEvent");

module.exports = class Error extends BlueEvent {
    constructor(client) {
        super(client, "error");
    }

    async run(error, eventName) {
        if(!eventName) console.error(error);
        else console.error("Error at event \"" + eventName + "\": " + error.message + "\n" + error.stack);
    }
};