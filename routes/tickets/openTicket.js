const { OverwriteType, ChannelType, PermissionFlagsBits, PermissionsBitField, ActionRowBuilder } = require("discord.js");
const queryDatabase = require("../../utils/queryDatabase");
const BlueEmbed = require("../../structures/BlueEmbed");
const CloseTicketButton = require("../../buttons/close-ticket");

module.exports = async (client, interaction, guild_id, category_id, user_id, vip_ticket = false) => {
    const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [guild_id]);
    const ticketingData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [guild_id]);;
    const categoryData = await queryDatabase("SELECT * FROM `Categories` WHERE `category_id` = ?", [category_id]);
    if(!guildData.length || !ticketingData.length || !categoryData?.length) return;

    const channel_id = categoryData[0].channel_id;
    const vip_channel_id = categoryData[0].vip_channel_id;

    const category_role = categoryData[0].helper_role || client.user.id;

    const category_name = categoryData[0].category_name || "";
    const vip_emoji = ticketingData[0].vip_emoji || "";
    const emoji = categoryData[0].category_emoji || "🎫";
    const username = interaction.guild.members.cache.get(user_id)?.user?.username || "undefined";

    const ticketChannelName = (vip_ticket ? vip_emoji : "") + emoji + "┃" + username + (category_name ? ("・" + category_name) : "");

    if(!channel_id || !vip_channel_id) return;

    const channel = await interaction.guild.channels.create({
        name: ticketChannelName,
        type: ChannelType.GuildText,
        parent: vip_ticket ? vip_channel_id : channel_id,
        permissionOverwrites: [
            {
                type: OverwriteType.Role,
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: user_id,
                allow: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: client.user.id,
                allow: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: category_role,
                allow: [PermissionFlagsBits.ViewChannel]
            }
        ]
    });
    await queryDatabase("INSERT INTO `Tickets` (`ticket_id`, `category_id`, `guild_id`, `user_id`) VALUES (?, ?, ?, ?)", [channel.id, category_id, guild_id, user_id]);

    const locale = guildData[0]?.locale;
    const embed = new BlueEmbed(client, "ticket-opened", locale, {
        user_id: user_id,
        category_name: category_name
    });
    
    const close_button = new CloseTicketButton(client, locale);

    const row = new ActionRowBuilder().addComponents(close_button.button);

    await channel.send({
        embeds: [embed.embed],
        components: [...embed.components, row]
    });

    return channel;
};