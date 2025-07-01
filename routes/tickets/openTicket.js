const { OverwriteType, ChannelType, PermissionFlagsBits, PermissionsBitField } = require("discord.js");
const queryDatabase = require("../../utilis/queryDatabase");
const { type } = require("os");

module.exports = async (client, interaction, guild_id, category, user_id, vipTicket = false) => {
    await fetchGuildCategories(guild_id);
    const categoryId = category ? await getCategoryId(guild_id, category, vipTicket) : await getDefaultGuildCategory(guild_id, vipTicket);
    const categoryRole = await getHelperRole(guild_id, category) || client.user.id;
    const defaultTicketEmoji = await getDefaultEmoji(guild_id);

    const vip_emoji = await getVipEmoji(guild_id) || "";
    const emoji = await getCategoryEmoji(guild_id, category) || defaultTicketEmoji || "🎫";
    const username = interaction.guild.members.cache.get(user_id)?.user?.username || "undefined";

    const ticketChannelName = (vipTicket?vip_emoji:"") + emoji + "┃" + username + (category ? ("・" + category) : "");

    if(!categoryId) return;

    const channel = await interaction.guild.channels.create({
        name: ticketChannelName,
        type: ChannelType.GuildText,
        parent: categoryId,
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
                id: categoryRole,
                allow: [PermissionFlagsBits.ViewChannel]
            }
        ]
    });

    await queryDatabase("INSERT INTO `Tickets` (`ticket_id`, `guild_id`, `user_id`) VALUES (?, ?, ?)", [channel.id, guild_id, user_id]);

    return channel;
};

async function getDefaultGuildCategory(guild_id, vip = false) {
    const ticketing_guilds = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [guild_id]);

    if(vip) return ticketing_guilds[0]?.vip_ticket_category;

    return ticketing_guilds[0]?.ticket_category;
}

async function fetchGuildCategories(guild_id) {
    const result = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ?", [guild_id]);

    return result;
}

async function getCategoryId(guild_id, category, vip = false) {
    const categories = await fetchGuildCategories(guild_id);

    const categoryData = categories.find(cat => cat.category_name == category);

    if(!categoryData) return null;

    if(vip) return categoryData?.vip_channel_id;

    return categoryData?.channel_id;
}

async function getHelperRole(guild_id, category) {
    const categories = await fetchGuildCategories(guild_id);

    const categoryData = categories.find(cat => cat.name == category);

    if(!categoryData) return null;

    return categoryData?.helper_role;
}

async function getCategoryEmoji(guild_id, category) {
    const categories = await fetchGuildCategories(guild_id);

    const categoryData = categories.find(cat => cat.category_name == category);

    if(!categoryData) return null;

    return categoryData?.category_emoji;
}

async function getVipEmoji(guild_id) {
    const guildData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [guild_id]);

    if(!guildData.length) return null;

    return guildData[0]?.vip_emoji;
}

async function getDefaultEmoji(guild_id) {
    const guildData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [guild_id]);

    if(!guildData.length) return null;

    return guildData[0]?.default_emoji;
}