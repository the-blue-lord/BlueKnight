const { ActionRowBuilder } = require("discord.js");
const BlueEmbed = require("../../structures/BlueEmbed");
const CloseTicketButton = require("../../buttons/close-ticket");
const queryDatabase = require("../../utils/queryDatabase");

module.exports = async (client, guild, ticket_channel, locale, excutor_id, reopening_requested = false) => {
    ticket_channel.permissionOverwrites.edit(guild.roles.everyone, {SendMessages: true});

    await queryDatabase("UPDATE `Tickets` SET `closed` = '0' WHERE `ticket_id` = ?", [ticket_channel.id]);

    const ticketData = await queryDatabase("SELECT * FROM `Tickets` WHERE `ticket_id` = ?", [ticket_channel.id]);

    const embed_id = reopening_requested ? "accepted-reopening" : "ticket-reopened";

    const embed = new BlueEmbed(client, embed_id, locale, {
        reopener_id: excutor_id,
        user_id: ticketData[0].user_id
    });

    const close_button = new CloseTicketButton(client, locale);

    const row = new ActionRowBuilder().addComponents(close_button.button);

    ticket_channel.send({
        embeds: [embed.embed],
        components: [...embed.components, row]
    });
}