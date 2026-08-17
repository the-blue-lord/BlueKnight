const { createTranscript } = require("discord-html-transcripts");
const BlueButton = require("../structures/BlueButton");
const BlueMessage = require("../structures/BlueMessage");
const BlueEmbed = require("../structures/BlueEmbed");
const queryDatabase = require("../utils/queryDatabase");

module.exports = class ConfirmDeletionButton extends BlueButton {
    constructor(client, locale, ticket_channel) {
        super(client, "confirm-deletion", locale, ticket_channel);

        this.channel_id = ticket_channel;
    }

    async run(action, interaction) {
        if(this.action != action) return;

        await interaction.reply("Deleting ticket...");

        const ticketChannel = await interaction.guild.channels.fetch(this.channel_id) || this.channel_id; // INSERTED FETCH


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

        const transcript = await createTranscript(ticketChannel);
        const transcriptChannel = await interaction.guild.channels.fetch(guildData[0].ticket_transcripts_channel); // INSERTED FETCH

        await queryDatabase("DELETE FROM `Tickets` WHERE ticket_id = ?", [this.channel_id]);
        await ticketChannel.delete();

        if(transcriptChannel) {
            const transcript_embed = new BlueEmbed(this.client, "transcript-info", locale, {
                user_id: ticketData[0].user_id,
                category_name: ticketData[0].category_name,
                deleter_id: interaction.user.id
            });

            // FIXME: Not sending s=message bc transcriptChannel not recongized as a chennel, prolly probelms with newly insrted fetch
            transcriptChannel.send({
                embeds: [transcript_embed.embed],
                components: transcript_embed.components,
                files: [transcript]
            });
        }
    }
};