const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, MessageFlags, ComponentType } = require("discord.js");
const BlueMenu = require("../structures/BlueMenu");
const fs = require("fs");
const yaml = require("yaml");

const BlueMessage = require("../structures/BlueMessage");

const getVariables = require("../utils/getVariables");
const rebuildComponents = require("../utils/rebuildComponents");
const BlueButton = require("../structures/BlueButton");

module.exports = class TranslateMessageMenu extends BlueMenu {
    constructor(client, message_id, from_language = "en") {
        super(client, "translate-message", `${message_id}_${from_language}`);

        this.menu = new StringSelectMenuBuilder();

        this.message_id = message_id;
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

        const translating_language = interaction.values[0];

        const og_msg = interaction.message.embeds[0].description;
        const def_msg = yaml.parse(fs.readFileSync("./configs/messages.yml", "utf-8"))[this.message_id].content[this.language];

        const variables = getVariables(og_msg, def_msg);

        const message = new BlueMessage(interaction.client, this.message_id, translating_language, variables);

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
                
                if(action == "translate-message") {
                    const menu = new TranslateMessageMenu(this.client, data[0], translating_language);
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

        await interaction.reply({
            embeds: [message.embed],
            files: message.attachments,
            components: new_components,
            flags: MessageFlags.Ephemeral
        });
    }
};