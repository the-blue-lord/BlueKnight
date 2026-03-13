const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const yaml = require("yaml");
const fs = require("fs");

const zeroWidth = require("../utils/zeroWidthSteganography");

module.exports = class BlueEmbed {
    constructor(client, embed_id, language = "en", variables = {}, additional_fields = []) {
        const embeds = yaml.parse(fs.readFileSync("./configs/embeds.yml", "utf-8"));
        const embedData = embeds[embed_id];

        if(!embedData) return null;

        const title = Object.entries(variables).reduce((str, [key, value]) => str.replaceAll(`<!--${key}--!>`, value), (embedData.title[language] || embedData.title["en"]));
        const description = Object.entries(variables).reduce((str, [key, value]) => str.replaceAll(`<!--${key}--!>`, value), (embedData.description[language] || embedData.description["en"]));

        this.embed = new EmbedBuilder()        
            .setTitle(title)
            .setDescription(description)
            .setColor(embedData.color || "#03bafc")
            .setTimestamp()
            .setFooter({
                iconURL: client.user.avatarURL(),
                text: "BlueKnight"
            });

        const data = {};

        const fields = embedData.fields || [];

        for(const field of fields) {
            const template_type = field.template_type;
            if(template_type) {
                data[template_type] = 0;
                for(const additional_field of additional_fields.filter(f => f.type == template_type)) {
                    data[template_type]++;
                    const template = embedData.templates[additional_field.type];
                    if(!template) continue;

                    var field_name = Object.entries(variables).reduce((str, [key, value]) => str.replaceAll(`<!--${key}--!>`, value), (template.name[language] || template.name["en"]));
                    for(const key in additional_field.vars) {
                        field_name = field_name.replaceAll(`<!--${key}--!>`, additional_field.vars[key]);
                    }

                    var field_value = Object.entries(variables).reduce((str, [key, value]) => str.replaceAll(`<!--${key}--!>`, value), (template.value[language] || template.value["en"]));
                    for(const key in additional_field.vars) {
                        field_value = field_value.replaceAll(`<!--${key}--!>`, additional_field.vars[key]);
                    }

                    this.embed.addFields({
                        name: field_name,
                        value: field_value,
                        inline: additional_field.inline || template.inline || false
                    });
                }

                continue;
            }

            this.embed.addFields({
                name: Object.entries(variables).reduce((str, [key, value]) => str.replaceAll(`<!--${key}--!>`, value), (field.name[language] || field.name["en"])),
                value: Object.entries(variables).reduce((str, [key, value]) => str.replaceAll(`<!--${key}--!>`, value), (field.value[language] || field.value["en"])),
                inline: field.inline || false
            });
        }

        const encoded_data = zeroWidth.encode(JSON.stringify(data));

        this.embed.setDescription(description + "\u2063" + encoded_data);

        const TranslateEmbedMenu = require("../menus/translate-embed");

        this.components = [];
        this.components.push(new TranslateEmbedMenu(client, embed_id, language).build());

        return;
    }
};