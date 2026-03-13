const Discord = require("discord.js");

const BlueMenu = require("../structures/BlueMenu");
const BlueMessage = require("../structures/BlueMessage");

const ticket_router = require("../routes/ticket-router");
const queryDatabase = require("../utils/queryDatabase");
const TicketQuestionsModal = require("../modals/ticket-questions");

module.exports = class OpenTicketMenu extends BlueMenu {
    constructor(client) {
        super(client, "open-ticket");
    }

    build() {
        return null;
    }

    async run (action, interaction) {
        if(action != this.action) return;
        if(!interaction.isStringSelectMenu()) return;

        const category_id = interaction.values[0];

        const categories = await queryDatabase("SELECT * FROM `Categories` WHERE `category_id` = ?", [category_id]);
        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `category_id` = ?", [category_id]);

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);

        if(!guildData.length) {
            const msg = new BlueMessage(interaction.client, "not-setup", interaction.guild.preferredLocale.split("-")[0]);

            await interaction.reply({
               embeds: [msg.embed],
               components: msg.components,
               files: msg.attachments,
            });
        }

        const vip_role_id = guildData[0].vip_role;
        const isVip = interaction.member.roles.cache.find(r => r.id == vip_role_id) ? true : false;

        if(!questions?.length) {
            await interaction.deferReply({
                flags: Discord.MessageFlags.Ephemeral
            });
            const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

            const ticketChannel = await ticket_router.openTicket(interaction.client, interaction, interaction.guild.id, category_id, interaction.user.id, isVip);

            if(!ticketChannel || !categories.length) {
                interaction.editReply("Error");
                return;
            }

            const msg = new BlueMessage(interaction.client, "ticket-opened", locale, {
                "channel_id": ticketChannel.id,
                "user_id": interaction.user.id,
                "category_name": categories[0].category_name
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

        const questions_modal = new TicketQuestionsModal(this.client, this.locale, category_id);
        await questions_modal.build();

        await interaction.showModal(questions_modal.modal);

        return;
    }
};