const { ActionRowBuilder } = require("discord.js");
const ReopenTicketButton = require("#app/sng/buttons/reopen-ticket");
const BlueEmbed = require("#sng/structures/BlueEmbed");
const queryDatabase = require("#sng/utils/queryDatabase");
const AskTicketReopeningButton = require("#app/sng/buttons/ask-reopening");
const DeleteTicketButton = require("#app/sng/buttons/delete-ticket");

module.exports = async (client, guild, ticket_channel, locale, excutor_id) => {
    await ticket_channel.permissionOverwrites.edit(guild.roles.everyone, {SendMessages: false});

    await queryDatabase("UPDATE `Tickets` SET `closed` = '1' WHERE `ticket_id` = ?", [ticket_channel.id]);

    const embed = new BlueEmbed(client, "ticket-closed", locale, {
        closer_id: excutor_id,
    });

    const reopen_button = new ReopenTicketButton(client, locale);
    const ask_reopening_button = new AskTicketReopeningButton(client, locale);
    const delete_button = new DeleteTicketButton(client, locale);

    const row = new ActionRowBuilder().addComponents(reopen_button.button, ask_reopening_button.button, delete_button.button);

    ticket_channel.send({
        embeds: [embed.embed],
        components: [...embed.components, row]
    });
}