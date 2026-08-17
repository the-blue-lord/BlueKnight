const { ActionRowBuilder, AttachmentBuilder, BaseInteraction } = require("discord.js");
const BlueEmbed = require("../../structures/BlueEmbed");
const ConfirmDeletionButton = require("../../buttons/confirm-deletion");
const { createTranscript } = require("discord-html-transcripts");
const archiver = require("archiver");
const CancelDeletionButton = require("../../buttons/cancel-deletion");
const ZipFolder = require("jszip");

module.exports = async (client, ticketChannel, ticketData, transcriptsChannel, interaction, locale) => {
    if(!ticketData && ticketData[0].closed == "0") return null;

    let embed_id = "confirm-deletion";
    let info_embed = null;
    
    if(!transcriptsChannel) {
        embed_id = "no-transcript-channel";
        info_embed = new BlueEmbed(client, "transcript-info", locale, {
            user_id: ticketData[0].user_id,
            category_name: ticketData[0].category_name,
            deleter_id: interaction.member.id,
        });
    }

    const embed = new BlueEmbed(client, embed_id, locale, {
        transcripts_channel_id: transcriptsChannel?.id
    });

    const confirm_button = new ConfirmDeletionButton(client, locale, ticketChannel.id);
    const row = new ActionRowBuilder().addComponents(confirm_button.button);

    const transcript_file = await createTranscript(ticketChannel);

    const user = (await interaction.guild.members.fetch(ticketData[0].user_id)).user;

    const file_name = `transcript-ticket_${ticketChannel.id}-${user.username}-${ticketData[0].category_name}`;

    const zip_file = new ZipFolder();
    zip_file.file(`${file_name}.html`, transcript_file.attachment);

    const zip_buffer = await zip_file.generateAsync({ type: "nodebuffer" });

    const zip_attachment = new AttachmentBuilder(zip_buffer, { name: `${file_name}.zip` });

    await interaction.editReply({
        embeds: [embed.embed],
        files: [zip_attachment],
        components: [...embed.components, row]
    });

    if(info_embed && transcriptsChannel) {
        await transcriptsChannel.send({
            embeds: [info_embed.embed],
            components: info_embed.components,
            files: [zip_attachment]
        });
    }
}