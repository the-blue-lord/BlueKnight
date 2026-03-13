const { MessageFlags, ButtonStyle } = require("discord.js");
const BlueMessage = require("../structures/BlueMessage");
const queryDatabase = require("../utils/queryDatabase");
const BlueButton = require("../structures/BlueButton");

module.exports = class ReopenTicketButton extends BlueButton {
    constructor(client, locale) {
        super(client, "reopen-ticket", locale);
    }

    async run(action, interaction) {
        if(action != this.action) return;

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const ticketChannel = interaction.channel;

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale;

        const ticketData = await queryDatabase("SELECT * FROM `Tickets` WHERE `ticket_id` = ?", [ticketChannel.id]);

        if(!(await this.isBotAdmin(interaction.member)) && !(await this.isCategoryHelper(interaction.member, ticketData[0].category_id))) {
            const msg = new BlueMessage(this.client, "not-category-helper", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        if(!ticketData) {
            const msg = new BlueMessage(this.client, "ticket-not-found", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        if(ticketData[0].closed == "0") {
            const msg = new BlueMessage(this.client, "ticket-already-open", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        const reopenTicket = require("../routes/tickets/reopenTicket");
        await reopenTicket(this.client, interaction.guild, ticketChannel, locale, interaction.member.id);

        const message = new BlueMessage(this.client, "ticket-reopened", locale);
        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });
    }
}