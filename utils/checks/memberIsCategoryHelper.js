const getCategoryData = require("../data-fetchers/getCategoryData");

module.exports = async (member, category_id, locale = "en", client = null, interaction = null) => {
    const guild_data = await getCategoryData(category_id, locale, client, interaction);
    const role = guild_data.helper_role;

    if(!role) return false;

    return member.roles.cache.has(role);
};