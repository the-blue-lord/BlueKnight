const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");

module.exports = class AlreadySetup extends BlueCommand {
    constructor(client) {
        super(client, "msg-category-used");
    }

    async run(interaction) {
        await interaction.deferReply();

        const loc = interaction.options.get("localisation")?.value;
        
        const message = new BlueMessage(this.client, "category-used", loc);
        await interaction.editReply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components
        });
    }
};