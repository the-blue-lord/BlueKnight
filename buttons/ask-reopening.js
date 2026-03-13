const { ButtonStyle } = require("discord.js");
const BlueButton = require("../structures/BlueButton");
const TicketReopeningReasonModal = require("../modals/ticket-reopening-reason");
const queryDatabase = require("../utils/queryDatabase");

module.exports = class AskTicketReopeningButton extends BlueButton {
    constructor(client, locale) {
        super(client, "ask-reopening", locale);
    }

    async run(action, interaction) {
        if(action != this.action) return;

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale;

        const modal = new TicketReopeningReasonModal(this.client, locale, interaction.channel.id);
        await modal.build();

        interaction.showModal(modal.modal);
    }
};