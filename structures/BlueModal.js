const { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder, LabelBuilder, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } = require("discord.js");
const yaml = require("yaml");
const fs = require("fs");

const { removeUnderscore } = require("../utils/customIdNomralization");

module.exports = class BlueModal {
    constructor(client, modal_action, localisation = "en", modal_data) {
        this.client = client;
        this.action = modal_action;
        this.lan = localisation;
        this.id = removeUnderscore(modal_action) + (removeUnderscore(modal_data) ? "_" + removeUnderscore(modal_data) : "");
    }

    async build(vars = {}) {
        const modalData = yaml.parse(fs.readFileSync("./configs/modals.yml", "utf-8"))[this.action];

        this.modal = new ModalBuilder().setCustomId(this.id);
        // BUG: When modalData = {}
        if(!modalData) {
            this.modal.setTitle("Default modal").addLabelComponents(
                new LabelBuilder()
                .setLabel("Default question")
                .addComponents(
                    new TextInputBuilder()
                        .setCustomId("tmp-input")
                        .setPlaceholder("Default value")
                        .setStyle(TextInputStyle.Short)
                )
            );
            
            return this.modal;
        }

        this.modal.setTitle(modalData.title[this.lan] || modalData.title.en);

        let cnt = 0;

        for(const modalInput of modalData.inputs) {
            
            const customId = modalInput.id.slice(0, 100) || "undefined_"+cnt++;
            const required = modalInput.required || false;
            const type = modalInput.type || 1;
            let label = modalInput.label[this.lan]?.slice(0, 100) || modalInput.label.en.slice(0, 100);
            let placeholder = modalInput.placeholder[this.lan]?.slice(0, 100) || modalInput.placeholder.en.slice(0, 100);
            let value = modalInput.value ? modalInput.value[this.lan] || modalInput.value.en : "";

            Object.keys(vars).forEach(key => {
                let replacer = vars[key];
                if(!replacer) replacer = "";

                label = label.replaceAll(`<!--${key}--!>`, replacer);
                placeholder = placeholder.replaceAll(`<!--${key}--!>`, replacer);
                value = value.replaceAll(`<!--${key}--!>`, replacer);
            });


            if(type == 1 || type == 2) {
                const text_input = new TextInputBuilder()
                    .setCustomId(customId)
                    .setPlaceholder(placeholder)
                    .setStyle(type)
                    .setRequired(required);

                if(value) text_input.setValue(value);

                this.modal.addLabelComponents(
                    new LabelBuilder().setLabel(label).setTextInputComponent(text_input)
                );
            }
            else if(type == "role_menu") {
                const roles_select = new RoleSelectMenuBuilder()
                    .setCustomId(customId)
                    .setRequired(required)
                    .setPlaceholder(placeholder);

                if(value) roles_select.setValue(value);

                this.modal.addLabelComponents(
                    new LabelBuilder().setLabel(label).setRoleSelectMenuComponent(roles_select)
                );
            }
            else if(type == "channel_menu") {
                const channel_select = new ChannelSelectMenuBuilder()
                    .setCustomId(customId)
                    .setRequired(required)
                    .setPlaceholder(placeholder);

                const channel_types = modalInput.channel_types;

                if(value) channel_select.setValue(value);
                if(channel_types) channel_select.setChannelTypes(channel_types);

                this.modal.addLabelComponents(
                    new LabelBuilder().setLabel(label).setChannelSelectMenuComponent(channel_select)
                );
            }
        }

        return this;
    }
};