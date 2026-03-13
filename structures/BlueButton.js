const yaml = require("yaml");
const fs = require("fs");

const { ButtonBuilder, PermissionFlagsBits} = require("discord.js");
const queryDatabase = require("../utils/queryDatabase");

module.exports = class BlueButton {
    constructor(client, button_action, locale = "en", button_data = "") {
        const button_id = button_action + "_" + locale + (button_data ? "_" + button_data : "");
        const buttonData = yaml.parse(fs.readFileSync("./configs/buttons.yml", "utf8"))[button_action];

        this.client = client;
        this.action = button_action;
        this.locale = locale;
        this.button = new ButtonBuilder()
            .setCustomId(button_id)
            .setLabel(buttonData?.label[locale] || "deafult")
            .setStyle(buttonData?.style || 1)
            .setEmoji(buttonData?.emoji || "🕳");
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