const { ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const yaml = require("yaml");
const fs = require("fs");

module.exports = class BlueModal {
    constructor(client, modal_action, localisation = "en", modal_data) {
        this.client = client;
        this.action = modal_action;
        this.lan = localisation;
        this.id = modal_action + (modal_data ? "_" + modal_data : "");
    }

    async build() {
        const modalData = yaml.parse(fs.readFileSync("./configs/modals.yml", "utf-8"))[this.action];

        this.modal = new ModalBuilder().setCustomId(this.id);

        if(!modalData) {
            this.modal.setTitle("Default modal").addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("tmp-input")
                        .setLabel("Default question")
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
            const label = modalInput.label[this.lan]?.slice(0, 100) || modalInput.label.en.slice(0, 100);
            const placeholder = modalInput.placeholder[this.lan]?.slice(0, 100) || modalInput.placeholder.en.slice(0, 100);

            this.modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(customId)
                        .setLabel(label)
                        .setPlaceholder(placeholder)
                        .setStyle(modalInput.style || TextInputStyle.Short)
                        .setRequired(modalInput.required || false)
                )
            );
        }

        return this;
    }
};