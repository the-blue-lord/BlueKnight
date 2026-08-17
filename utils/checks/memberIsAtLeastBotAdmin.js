const BlueMessage = require("../../structures/BlueMessage");
const memberIsBotAdmin = require("./memberIsBotAdmin");

module.exports = async (member, locale = "en", client = null, interaction = null) => {
    const isBotAdmin = await memberIsBotAdmin(member, client, interaction);

    if(!isBotAdmin) {
        if(client && interaction) {
            const msg = new BlueMessage(client, "not-admin", locale);

            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
        }

        throw null;
        return;
    }

    return;
};