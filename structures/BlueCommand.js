const fs = require("fs");

module.exports = class BlueCommand {
    // --- Default command constructor
    constructor(client, commandName) {
        this.client = client
        // --- Get command info from name
        this.commandConfig = client.commands[commandName];

        this.name = this.commandConfig?commandName:"undefined";
        this.test = (() => {
            if(this.commandConfig?.test === false) return false;
            else return true;
        })();
        this.description = (this.test?"[TEST] ":"") + (this.commandConfig?.description || "undefined");
        this.options = this.commandConfig?.options || [];
    }

    getData() {
        return {
            name: this.name,
            description: this.description,
            options: this.options
        };
    }
};