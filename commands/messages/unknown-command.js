const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");

module.exports = class UnknownCommand extends BlueCommand {
    constructor(client) {
        super(client, "unknown-command");
    }

    async run(interaction) {
        await interaction.deferReply();

        const loc = interaction.options.get("localisation").value;
        
        const message = new BlueMessage(this.client, "unknown-command", loc);
        console.log(message.components[0].components[0].variables);
        await interaction.editReply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components
        });
    }
};