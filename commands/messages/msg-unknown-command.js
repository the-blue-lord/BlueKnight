const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");

module.exports = class UnknownCommand extends BlueCommand {
    constructor(client) {
        super(client, "msg-unknown-command");
    }

    async run(interaction) {
        await interaction.deferReply();

        const loc = interaction.options.get("localisation")?.value;
        
        const message = new BlueMessage(this.client, "unknown-command", loc);
        await interaction.editReply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components
        });
    }
};