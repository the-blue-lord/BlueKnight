const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");

module.exports = class AlreadySetup extends BlueCommand {
    constructor(client) {
        super(client, "msg-already-setup");
    }

    async run(interaction) {
        await interaction.deferReply();

        const loc = interaction.options.get("localisation")?.value;
        
        const message = new BlueMessage(this.client, "already-setup", loc);
        await interaction.editReply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components
        });
    }
};