const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");

module.exports = class UnknownMessage extends BlueCommand {
    constructor(client) {
        super(client, "msg-unknown-message");
    }

    async run(interaction) {
        await interaction.deferReply();

        const loc = interaction.options.get("localisation")?.value;
        
        const message = new BlueMessage(this.client, "unknown-message", loc);
        await interaction.editReply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components
        });
    }
};