const getGuildData = require("../data-fetchers/getGuildData");

module.exports = async (member, client = null, interaction = null) => {
    const guild_data = await getGuildData(member.guild.id, client, interaction);
    const role = guild_data.admin_role;

    if(!role) return false;

    return member.roles.cache.has(role);
};