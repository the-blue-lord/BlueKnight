module.exports = class BlueEvent {
    constructor(client, eventName) {
        this.client = client;
        this.name = eventName;
    }

    init() {
        this.client.on(this.name, this.run);
    }

    run() {
        consolex.event("No run function for the following event: " + this.name)
    }
};