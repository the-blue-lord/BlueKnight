const queryDatabase = require("../queryDatabase");
const BlueMessage = require("../../structures/BlueMessage");

module.exports = async (guild_id, client = null, interaction = null) => {
    const guild_data = await queryDatabase("SELECT * FROM `Ticketing` AS t JOIN `Guilds` AS g ON t.guild_id = g.guild_id WHERE g.`guild_id` = ?", [guild_id]);

    if(!guild_data || !guild_data[0]) {

        if(client && interaction) {
            const msg = new BlueMessage(client, "not-setup");
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
        }

        throw new Error("Guild not found in database.");
        return;
    }
    return guild_data[0];
};