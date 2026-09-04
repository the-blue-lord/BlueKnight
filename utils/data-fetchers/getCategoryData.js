const BlueMessage = require("../../structures/BlueMessage");
const queryDatabase = require("../queryDatabase");

module.exports = async (category_id, locale = "en", client = null, interaction = null) => {
    const category_data = await queryDatabase("SELECT * FROM `Categories` WHERE `category_id` = ?", [category_id]);

    if(!category_data || !category_data[0]) {
        if(client && interaction) {
            const msg = new BlueMessage(client, "category-not-found", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
        }
        throw new Error("Category not found in database");
        return;
    }

    return category_data[0];
};