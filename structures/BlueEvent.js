module.exports = class BlueEvent {
    constructor(client, eventName) {
        this.client = client;
        this.name = eventName;
    }

    init() {
        this.client.on(this.name, async (...args) => {
            try {
                await this.run(...args);
            }
            catch (err) {
                if(this.name == "error") return;
                this.client.emit("error", err, this.name);
            }
        });
    }

    async run() {
        console.event("No run function for the following event: " + this.name)
    }
};