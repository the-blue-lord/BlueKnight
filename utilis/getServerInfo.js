const queryDatabase = require("./queryDatabase");
const BlueMessage = require("../structures/BlueMessage");

module.exports = async (client, guildId, localisation) => {
    const info = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [guildId]);
    const cats = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ?", [guildId]);

    let catinfo = [];

    for(const cat of cats) {
        catinfo.push(new BlueMessage(client, "category-info", localisation, {
            "category_name": cat.category_name,
            "category_description": cat.category_description,
            "category_emoji": cat.category_emoji,
            "category_id": cat.channel_id,
            "vip_category_id": cat.vip_channel_id,
            "helper_role": cat.helper_role
        }).embed.data.description);
    }

    catinfo = catinfo.join("\n");

    if(info.length == 0) {
        return null;
    }

    const msg = new BlueMessage(client, "server-info", localisation, {
        "vip_role": info[0]?.vip_role || "0",
        "admin_role": info[0]?.admin_role || "0",
        "ticket_category": String(info[0]?.ticket_category) || "0",
        "vip_ticket_category": info[0]?.vip_ticket_category || "0",
        "ticket_categories/category_info": catinfo
    });

    return msg;
}