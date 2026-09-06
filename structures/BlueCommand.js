const fs = require("fs");

const { memberIsBotAdmin, memberIsCategoryHelper } = require("#utils").checks;

module.exports = class BlueCommand {
    // --- Default command constructor
    constructor(client, commandId) {
        this.client = client
        // --- Get command info from name
        this.commandConfig = client.commands[commandId];

        this.name = this.commandConfig?.name || commandId || "undefined";
        this.test = this.commandConfig?.test === false ? false : true;
        this.guild_specific = this.commandConfig?.guild_specific ? true : false;
        this.description = (this.test?"[TEST] ":"") + (this.commandConfig?.description || "undefined");
        this.options = this.commandConfig?.options || [];
    }

    getData() {
        return {
            type: 1,
            name: this.name,
            description: this.description,
            options: this.options
        };
    }

    async isBotAdmin(member) {
        return memberIsBotAdmin(member);
    }

    async isCategoryHelper(member, category_id) {
        return memberIsCategoryHelper(member, category_id);
    }
};