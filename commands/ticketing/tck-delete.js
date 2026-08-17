const { MessageFlags } = require("discord.js");
const BlueCommand = require("../../structures/BlueCommand");
const queryDatabase = require("../../utils/queryDatabase");
const BlueMessage = require("../../structures/BlueMessage");
const deleteTicket = require("../../routes/tickets/deleteTicket");

module.exports = class TckDeleteCommand extends BlueCommand {
    constructor(client) {
        super(client, "tck-delete");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const ticketChannel = interaction.options?.getChannel("ticket-channel") || interaction.channel;


        const ticketData = await queryDatabase("SELECT * FROM `Tickets` AS t JOIN `Categories` AS c ON t.category_id = c.category_id WHERE `ticket_id` = ?", [ticketChannel.id]);
        
        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const ticketingData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale;

        if(!(await (await this.isBotAdmin(interaction.member))) && !(await this.isCategoryHelper(interaction.member, ticketData[0].category_id))) {
            const msg = new BlueMessage(this.client, "not-category-helper", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        if(!guildData.length || !ticketingData.length) {
            const msg = new BlueMessage(this.client, "not-setup", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
        }

        if(ticketData.length == 0) {
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

        const transcriptsChannel = await interaction.guild.channels?.fetch(ticketingData[0].ticket_transcripts_channel); // INSERTED FETCH

        deleteTicket(this.client, ticketChannel, ticketData, transcriptsChannel, interaction, locale);
    }
};