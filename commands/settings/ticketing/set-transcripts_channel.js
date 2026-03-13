const { MessageFlags } = require("discord.js");
const queryDatabase = require("../../../utils/queryDatabase");
const BlueMessage = require("../../../structures/BlueMessage");
const BlueCommand = require("../../../structures/BlueCommand");

module.exports = class SetTransciptsChannelCommand extends BlueCommand {
    constructor(client) {
        super(client, "set-transcripts_channel");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0].locale;

        const channel_id = interaction.options?.get("channel")?.value;

        if(!channel_id) {
            await queryDatabase("UPDATE `Ticketing` SET `ticket_transcripts_channel` = NULL WHERE `guild_id` = ?", [interaction.guild.id]);
            
            const msg = new BlueMessage(this.client, "transcipts-channel-unset", locale);

            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });

            return;
        }

        await queryDatabase("UPDATE `Ticketing` SET `ticket_transcripts_channel` = ? WHERE `guild_id` = ?", [channel_id, interaction.guild.id]);

        const msg = new BlueMessage(this.client, "transcipts-channel-set", locale, {
            channel_id: channel_id
        });

        await interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });

        return;
    }

    
};