const queryDatabase = require("#utils").queryDatabase;
const BlueMessage = require("#structures").BlueMessage;

module.exports = async (guild_id, client = null, interaction = null, fetch_categories = false) => {
    const guild_data = await queryDatabase("SELECT * FROM `Ticketing` AS t JOIN `Guilds` AS g ON t.guild_id = g.guild_id WHERE g.`guild_id` = ?", [guild_id]);

    if(!guild_data || !guild_data[0]) {

        if(client && interaction) {
            const msg = new BlueMessage(client, "not-setup", interaction.guild.preferredLocale.split("-")[0]);
            
            const interaction_is_replied = interaction.replied || interaction.deferred;
            const blueReply = interaction_is_replied ? (...a) => interaction.editReply(...a) : (...a) => interaction.reply(...a);

            await blueReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: 64 // MessageFlags.Ephemeral = 64
            });
        }

        throw new Error("Guild not found in database.");
        return;
    }

    const result = guild_data[0];

    if(fetch_categories) {
        const categories_data = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ?", [guild_id]);
        if(categories_data) result.categories = categories_data;
    }

    return result;
};