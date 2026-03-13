const { MessageFlags } = require("discord.js");
const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");
const queryDatabase = require("../../utils/queryDatabase");

module.exports = class TckUnmuteCommand extends BlueCommand {
    constructor(client) {
        super(client, "tck-unmute");
    }

    async run(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const ticketChannel = interaction.options?.getChannel("ticket-channel") || interaction.channel;
        const user = interaction.options?.getUser("user");

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

        ticketChannel.permissionOverwrites.edit(user.id, {
            SendMessages: true
        });

        const msg = new BlueMessage(this.client, "user-unmuted", locale, {
            user_id: user.id,
            ticket_id: ticketChannel.id
        });

        interaction.editReply({
            embeds: [msg.embed],
            components: msg.components,
            files: msg.attachments
        });
    }
};