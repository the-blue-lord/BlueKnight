const { MessageFlags, ButtonStyle } = require("discord.js");
const BlueMessage = require("../structures/BlueMessage");
const queryDatabase = require("../utils/queryDatabase");
const BlueButton = require("../structures/BlueButton");
const BlueEmbed = require("../structures/BlueEmbed");
const { createTranscript } = require("discord-html-transcripts");
const deleteTicket = require("../routes/tickets/deleteTicket");

module.exports = class DeleteTicketButton extends BlueButton {
    constructor(client, locale) {
        super(client, "delete-ticket", locale);
    }

    async run(action, interaction) {
        if(action != this.action) return;

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const ticketChannel = interaction.channel;

        const ticketData = await queryDatabase("SELECT * FROM `Tickets` AS t JOIN `Categories` AS c ON t.category_id = c.category_id WHERE `ticket_id` = ?", [ticketChannel.id]);
        const guildData = await queryDatabase("SELECT * FROM `Ticketing` AS t JOIN `Guilds` AS g ON t.guild_id = g.guild_id WHERE g.`guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale;

        if(!(await this.isBotAdmin(interaction.member)) && !(await this.isCategoryHelper(interaction.member, ticketData[0].category_id))) {
            const msg = new BlueMessage(this.client, "not-category-helper", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        if(!guildData.length) {
            const msg = new BlueMessage(this.client, "not-setup", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        if(!ticketData.length) {
            const msg = new BlueMessage(this.client, "ticket-not-found", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        if(ticketData[0].closed == "0") {
            const msg = new BlueMessage(this.client, "ticket-not-closed", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        const transcript_channel_id = guildData[0].ticket_transcripts_channel;

        const transcriptsChannel = transcript_channel_id && await interaction.guild.channels?.fetch(transcript_channel_id); // INSERTED FETCH

        deleteTicket(this.client, ticketChannel, ticketData, transcriptsChannel, interaction, locale);
    }
}