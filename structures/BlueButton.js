const yaml = require("yaml");
const fs = require("fs");

const { ButtonBuilder } = require("discord.js");
const { memberIsBotAdmin, memberIsCategoryHelper } = require("#utils").checks;

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
        return memberIsBotAdmin(member);
    }

    async isCategoryHelper(member, category_id) {
        return memberIsCategoryHelper(member, category_id);
    }
};