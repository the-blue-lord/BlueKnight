const fs = require("fs");
const yaml = require("yaml");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = class BlueMessage {
    constructor(client, message_id, language = "en", variables = {}) {
        this.messages = yaml.parse(fs.readFileSync("./configs/messages.yml", "utf-8"));
        this.messageData = this.messages[message_id] || this.messages["unknown-message"];

        const real_message_id = this.messages[message_id] ? message_id : "unknown-message";

        this.title = this.messageData.title[language] || this.messageData.title["en"];
        this.content = this.messageData.content[language] || this.messageData.content["en"];
        this.type = this.messageData.type || "undefined";
        this.type = this.type[0].toUpperCase() + this.type.slice(1);

        variables["unknown_message_id"] = variables["unknown_message_id"] || message_id;
        Object.entries(variables).forEach(([key, value]) => {
            this.title = this.title.replaceAll("<!--" + key + "--!>", value);
            this.content = this.content.replaceAll("<!--" + key + "--!>", value);
        });

        this.attachments = [];

        let authorIconUrl = null;

        if(this.type == "Success") {
            this.attachments.push(new AttachmentBuilder("./images/success-icon.png"));
            authorIconUrl = "attachment://success-icon.png";
            this.color = "#00ff00";
        }
        else if(this.type == "Error") {
            this.attachments.push(new AttachmentBuilder("./images/error-icon.png"));
            authorIconUrl = "attachment://error-icon.png";
            this.color = "#ff0000";
        }
        else if(this.type == "Info") {
            authorIconUrl = client.user.avatarURL();
            this.color = "#03bafc";
        }
        else {
            this.color = this.messages["default-color"];
        }

        this.embed = new EmbedBuilder()
            .setTitle(this.title)
            .setDescription(this.content)
            .setColor(this.color)
            .setFooter({
                iconURL: client.user.avatarURL(),
                text: "BlueKnight"
            })
            .setTimestamp();

        if(authorIconUrl) {
            this.embed.setAuthor({
                name: this.type,
                iconURL: authorIconUrl
            });
        }

        this.components = [];

        const TranslateMessageMenu = require("../menus/translate-message");

        this.components.push(new TranslateMessageMenu(client, message_id, language).build());

        return this;
    }
};