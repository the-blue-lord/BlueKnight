const { ModalSubmitInteraction, ActionRowBuilder } = require("discord.js");
const BlueModal = require("../structures/BlueModal");
const BlueEmbed = require("../structures/BlueEmbed");
const AcceptReopeningButton = require("../buttons/accept-reopening");
const DenyReopeningButton = require("../buttons/deny-reopening");
const BlockReopeningButton = require("../buttons/block-reopening");

module.exports = class TicketReopeningReasonModal extends BlueModal {
    constructor(client, locale = "en", ticket_id) {
        super(client, "ticket-reopening-reason", locale, ticket_id);

        this.channel_id = ticket_id;
    }

    async run(action, interaction) {
        if(action != this.action) return;

        const reason = interaction.fields.fields.get("reopen_reason").value || {
            en: "No reason provided",
            it: "Nessun motivo fornito",
            es: "No se proporcionó motivo"
        }[this.lan];

        const user_id = interaction.user.id;

        const embed = new BlueEmbed(this.client, "ticket-reopening-asked", this.lan, {
            user_id: user_id,
            reopening_reason: reason
        });

        const accept_button = new AcceptReopeningButton(this.client, this.lan, interaction.message.id);
        const deny_button = new DenyReopeningButton(this.client, this.lan);
        const block_button = new BlockReopeningButton(this.client, this.lan, interaction.message.id);

        const row = new ActionRowBuilder().addComponents(accept_button.button, deny_button.button, block_button.button);

        await interaction.reply({
            embeds: [embed.embed],
            components: [...embed.components, row]
        });
    }
};