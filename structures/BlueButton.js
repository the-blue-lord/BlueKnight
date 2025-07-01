const Discord = require("discord.js");

module.exports = class BlueButton {
    constructor(client, button_action, button_data = "") {
        const button_id = button_action + (button_data ? "_" + button_data : "");

        this.client = client;
        this.action = button_action;
        this.button = new Discord.ButtonBuilder().setCustomId(button_id);
    }
};