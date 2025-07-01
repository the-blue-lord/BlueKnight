const { PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const queryDatabase = require("../utilis/queryDatabase");

module.exports = class BlueCommand {
    // --- Default command constructor
    constructor(client, commandName) {
        this.client = client
        // --- Get command info from name
        this.commandConfig = client.commands[commandName];

        this.name = this.commandConfig?commandName:"undefined";
        this.test = this.commandConfig?.test === false ? false : true;
        this.guild_specific = this.commandConfig?.guild_specific ? true : false;
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

    async isBotAdmin(member) {
        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [member.guild.id]);

        const botAdminRole = guildData[0]?.admin_role;

        return member.permissions.has(PermissionFlagsBits.Administrator) || member.roles.cache.has(botAdminRole);
    }
};