const { MessageFlags } = require("discord.js");
const BlueButton = require("../structures/BlueButton");
const BlueEmbed = require("../structures/BlueEmbed");
const BlueMessage = require("../structures/BlueMessage");
const queryDatabase = require("../utils/queryDatabase");

module.exports = class DenyReopeningButton extends BlueButton {
    constructor(client, locale, close_message_id) {
        super(client, "deny-reopening", locale);
    }

    async run(action, interaction) {
        if(action != this.action) return;

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const ticketChannel = interaction.channel;

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale;

        const ticketData = await queryDatabase("SELECT * FROM `Tickets` WHERE `ticket_id` = ?", [ticketChannel.id]);

        if(!(await this.isBotAdmin(interaction.member)) && !(await this.isCategoryHelper(interaction.member, ticketData[0].category_id))) {
            const msg = new BlueMessage(this.client, "not-category-helper", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        if(!ticketData) {
            const msg = new BlueMessage(this.client, "ticket-not-found", locale);
            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            });
            return;
        }

        const message = new BlueMessage(this.client, "denied-reopening", locale);
        await interaction.editReply({
            embeds: [message.embed],
            components: message.components,
            files: message.attachments
        });

        const emebed = new BlueEmbed(this.client, "denied-reopening", locale, {
            denier_id: interaction.member.id,
            user_id: ticketData[0].user_id
        });

        await interaction.channel.send({
            embeds: [emebed.embed],
            components: emebed.components,
            files: emebed.attachments
        });
    }
};