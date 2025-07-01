const Discord = require("discord.js");

const BlueMenu = require("../structures/BlueMenu");
const BlueMessage = require("../structures/BlueMessage");

const ticket_router = require("../routes/ticket-router");
const queryDatabase = require("../utilis/queryDatabase");

module.exports = class OpenTicketMenu extends BlueMenu {
    constructor(client) {
        super(client, "open-ticket");
    }

    async run (action, interaction) {
        if(action != this.action) return;
        if(!interaction.isStringSelectMenu()) return;

        const categoryName = interaction.values[0];

        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `guild_id` = ? AND `category_name` = ?", [interaction.guild.id, categoryName]);

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const vip_role_id = guildData[0].vip_role;
        const isVip = interaction.member.roles.cache.find(r => r.id == vip_role_id) ? true : false;

        if(!questions?.length) {
            await interaction.deferReply({
                flags: Discord.MessageFlags.Ephemeral
            });
            const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

            const ticketChannel = await ticket_router.openTicket(interaction.client, interaction, interaction.guild.id, categoryName, interaction.user.id, isVip);

            if(!ticketChannel) {
                interaction.editReply("Error");
                return;
            }

            const msg = new BlueMessage(interaction.client, "ticket-opened", locale, {
                "channel_id": ticketChannel.id,
                "user_id": interaction.user.id,
                "category_name": categoryName
            });

            const channel_button_row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Ticket")
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${ticketChannel.id}`)
            );

            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components.concat(channel_button_row),
                files: msg.attachments,
                flags: Discord.MessageFlags.Ephemeral
            });

            return;
        }
        
        const modal = new Discord.ModalBuilder()
            .setTitle("Open Ticket - " + categoryName)
            .setCustomId("open-ticket_" + categoryName);

        var cnt = 0;

        for(const question of questions) {
            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setLabel(question.question)
                        .setRequired(true)
                        .setCustomId("answer_" + cnt++)
                )
            );
        }

        await interaction.showModal(modal);

        return;
    }
};