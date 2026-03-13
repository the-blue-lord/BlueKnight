const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags, Emoji, ComponentType } = require("discord.js");
const BlueMenu = require("../structures/BlueMenu");
const fs = require("fs");
const yaml = require("yaml");

const zeroWidth = require("../utils/zeroWidthSteganography");

const getVariables = require("../utils/getVariables");
const BlueEmbed = require("../structures/BlueEmbed");
const BlueButton = require("../structures/BlueButton");
const rebuildComponents = require("../utils/rebuildComponents");

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

        const translating_language = interaction.values[0];

        const new_components = rebuildComponents(interaction.message.components);

        new_components.forEach(row => 
            row.components = row.components.map(component => {
                const custom_id = component.data?.custom_id || component.customId;

                const action = custom_id.split("_")[0];
                const data = custom_id.split("_").slice(1);

                if(component.data.type == ComponentType.Button) {
                    const blue_button = new BlueButton(this.client, action, translating_language, data.join("_"));
                    return blue_button.button;
                }

                if(action == "translate-embed") {
                    const menu = new TranslateEmbedMenu(this.client, data[0], translating_language);
                    return menu.build()?.components[0];
                }
                
                const menus_files = fs.readdirSync("./menus");
                for(const menu_file of menus_files) {
                    const menuClass = require(`../menus/${menu_file}`);
                    const menuObject = new menuClass(this.client, ...data);

                    if(menuObject.action != action) continue;

                    return menuObject.build()?.components[0];
                }

                return component;
            })
        );

        const actual_description = message_embed.description.split("\u2063")[0];
        const hidden_data = message_embed.description.split("\u2063")[1];
        const data = JSON.parse(zeroWidth.decode(hidden_data));

        const embedData = yaml.parse(fs.readFileSync("./configs/embeds.yml", "utf8"))[this.embed_id];

        const title_vars = getVariables(message_embed.title, embedData.title[this.language] || embedData.title["en"]);
        const description_vars = getVariables(actual_description, embedData.description[this.language] || embedData.description["en"]);

        const variables = {...title_vars, ...description_vars};
        const additional_fields = [];

        var field_cnt = 0;
        const fields_length = message_embed.fields?.length || 0;
        for(let i = 0; i < fields_length; i++) {
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
            components: new_components,
            flags: MessageFlags.Ephemeral
        });
    }
};