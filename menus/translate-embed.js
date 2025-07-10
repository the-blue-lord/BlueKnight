const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags, Emoji } = require("discord.js");
const BlueMenu = require("../structures/BlueMenu");
const fs = require("fs");
const yaml = require("yaml");

const zeroWidth = require("../utilis/zeroWidthSteganography");

const BlueMessage = require("../structures/BlueMessage");

const getVariables = require("../utilis/getVariables");
const BlueEmbed = require("../structures/BlueEmbed");

module.exports = class TranslateEmbedMenu extends BlueMenu {
    constructor(client, embed_id, from_language = "en") {
        super(client, "translate-embed", `${embed_id}_${from_language}`);

        this.menu = new StringSelectMenuBuilder();

        this.embed_id = embed_id;
        this.language = from_language;
    }

    build() {
        this.menu.setCustomId(this.id);
        
        const languages = yaml.parse(fs.readFileSync("./configs/config.yml", "utf-8"))?.languages || [];

        const translating_languages = languages.filter(lan => lan.id != this.language);

        const placeholders = this.language.toUpperCase() + "  >>  " + translating_languages.map(ele => ele.id.toUpperCase()).join("/");

        this.menu.setPlaceholder(placeholders);

        this.component = new ActionRowBuilder();
            
        for(const lan of translating_languages) {
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

        const message_embed = interaction.message.embeds[0].data;

        const hidden_data = message_embed.description.split("\u2063")[1];
        const data = JSON.parse(zeroWidth.decode(hidden_data));

        const translating_language = interaction.values[0];

        const embedData = yaml.parse(fs.readFileSync("./configs/embeds.yml", "utf8"))[this.embed_id];

        const title_vars = getVariables(message_embed.title, embedData.title[this.language] || embedData.title["en"]);
        const description_vars = getVariables(message_embed.description, embedData.description[this.language] || embedData.description["en"]);

        const variables = {...title_vars, ...description_vars};
        const additional_fields = [];

        var field_cnt = 0;
        for(let i = 0; i < message_embed.fields.length; i++) {
            const field = message_embed.fields[i];
            const def_field = embedData.fields[field_cnt];
            const template_type = def_field.template_type;
            if(template_type) {
                const max = i + data[template_type];
                for(i = i; i < max; i++) {
                    const tmp_field = message_embed.fields[i];
                    const tmp_name_vars = getVariables(tmp_field.name, embedData.templates[template_type].name[this.language] || embedData.templates[template_type].name["en"]);
                    const tmp_value_vars = getVariables(tmp_field.value, embedData.templates[template_type].value[this.language] || embedData.templates[template_type].value["en"]);

                    const tmp_vars = {
                        type: template_type, 
                        vars: {...tmp_name_vars, ...tmp_value_vars}
                    };

                    additional_fields.push(tmp_vars);
                }

                i--;
                field_cnt++;
                continue;
            }

            const field_name_vars = getVariables(field.name, def_field.name[this.language] || def_field.name["en"]);
            const field_value_vars = getVariables(field.value, def_field.value[this.language] || def_field.value["en"]);

            Object.assign(variables, field_name_vars);
            Object.assign(variables, field_value_vars);

            field_cnt++;
        }

        const embed = new BlueEmbed(interaction.client, this.embed_id, translating_language, variables, additional_fields);

        await interaction.reply({
            embeds: [embed.embed],
            components: embed.components,
            flags: MessageFlags.Ephemeral
        });
    }
};