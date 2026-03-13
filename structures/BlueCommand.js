const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const queryDatabase = require("../utils/queryDatabase");

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
        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [member.guild.id]);

        const botAdminRole = guildData[0]?.admin_role;

        return member.permissions.has(PermissionFlagsBits.Administrator) || member.roles.cache.has(botAdminRole);
    }

    async isCategoryHelper(member, category_id) {
        const categoryData = await queryDatabase("SELECT * FROM `Categories` WHERE `category_id` = ?", [category_id]);

        const botHelperRole = categoryData[0]?.helper_role;

        return member.roles.cache.has(botHelperRole);
    }
};