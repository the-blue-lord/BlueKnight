const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const yaml = require("yaml");
const fs = require("fs");

module.exports = class BlueEmbed {
    constructor(client, embed_id, language = "en", additional_fields = []) {
        const embeds = yaml.parse(fs.readFileSync("./configs/embeds.yml", "utf-8"));
        const embedData = embeds[embed_id];

        if(!embedData) return null;

        this.embed = new EmbedBuilder()        
            .setTitle(embedData.title[language] || embedData.title["en"])
            .setDescription(embedData.description[language] || embedData.description["en"])
            .setColor(embedData.color || "#03bafc")
            .setTimestamp()
            .setFooter({
                iconURL: client.user.avatarURL(),
                text: "BlueKnight"
            });

        const fields = embedData.fields || [];
        for(const field of fields) {
            this.embed.addFields({
                name: field.name[language] || field.name["en"],
                value: field.value[language] || field.value["en"],
                inline: field.inline || false
            });
        }

        for(const field of additional_fields) {
            const template = embedData.templates[field.type];
            if(!template) continue;

            var field_name = template.name[language] || template.name["en"];
            for(const key in field.vars) {
                field_name = field_name.replaceAll("<!--" + key + "--!>", field.vars[key]);
            }

            var field_value = template.value[language] || template.value["en"];
            for(const key in field.vars) {
                field_value = field_value.replaceAll("<!--" + key + "--!>", field.vars[key]);
            }

            this.embed.addFields({
                name: field_name,
                value: field_value,
                inline: field.inline || template.inline || false
            });
        }

        this.components = [];
        for(const sub_languages of embeds.supported_languages) {
            const row = new ActionRowBuilder();
            for(const lan of sub_languages) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId("embed-translation_"+embed_id+"_"+language+"_"+lan.id)
                        .setStyle(ButtonStyle.Primary)
                        .setLabel(lan.id.toUpperCase())
                        .setEmoji(lan.flag)
                );
            }
            this.components.push(row);
        }

        return;
    }
};