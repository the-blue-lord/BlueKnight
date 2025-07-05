const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");
const BlueMenu = require("../structures/BlueMenu");
const fs = require("fs");
const yaml = require("yaml");

const getVariables = require("../utilis/getVariables")

module.exports = class TranslateMessageMenu extends BlueMenu {
    constructor(client, message_id, from_language = "en") {
        super(client, "translate-message", `${message_id}_${from_language}`);

        this.menu = new StringSelectMenuBuilder();

        this.message_id = message_id;
        this.language = from_language;
    }

    build() {
        this.menu.setCustomId(this.id);

        this.menu.setPlaceholder("Translate");

        this.component = new ActionRowBuilder();
        
        const languages = yaml.parse(fs.readFileSync("./configs/config.yml", "utf-8"))?.languages || [];
            
        for(const lan of languages) {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(lan.id.toUpperCase())
                .setValue(lan.id)
                .setEmoji(lan.flag || "🏳️");


            this.menu.addOptions(option);
        }

        this.component.addComponents(this.menu);

        return this.component;
    }

    async run(action, interaction) {
        if(action != this.action) return;

        const translating_language = interaction.values[0];

        const og_msg = interaction.message.embeds[0].description;
        const def_msg = yaml.parse(fs.readFileSync("./configs/messages.yml", "utf-8"))[this.message_id].content[this.language];

        const variables = getVariables(og_msg, def_msg);

        const message = new BlueMessage(interaction.client, this.message_id, translating_language, variables);

        await interaction.reply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components,
            flags: Discord.MessageFlags.Ephemeral
        });
    }
};