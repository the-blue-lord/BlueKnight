const { ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, MessageFlags, LabelBuilder  } = require("discord.js");

const BlueButton = require("../structures/BlueButton");
const BlueMessage = require("../structures/BlueMessage");

const queryDatabase = require("../utils/queryDatabase");
const ticket_router = require("../routes/ticket-router");
const Discord = require("discord.js");
const TicketQuestionsModal = require("../modals/ticket-questions");

module.exports = class OpenTicketButton extends BlueButton {
    constructor(client, locale, category_id) {
        super(client, "open-ticket", locale, category_id || "");

        this.category_id = category_id;
    }

    async run (action, interaction) {
        if(this.action != action) return;

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const ticketingData = await queryDatabase("SELECT * FROM `Ticketing` WHERE `guild_id` = ?", [interaction.guild.id]);

        if(!guildData?.length || !ticketingData?.length) {
            const msg = new BlueMessage(interaction.client, "not-setup", interaction.guild.preferredLocale.split("-")[0]);
            
            interaction.reply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        this.category_id = ticketingData[0].default_ticket_category;

        const vip_role_id = guildData[0].vip_role;
        const isVip = interaction.member.roles.cache.find(r => r.id == vip_role_id) ? true : false;

        const categoryData = await queryDatabase("SELECT * FROM `Categories` WHERE `category_id` = ?", [this.category_id]);

        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `category_id` = ?", [this.category_id]);

        if(!categoryData?.length) {
            const msg = new BlueMessage(interaction.client, "unknown-category", guildData[0].locale);
            
            interaction.reply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments,
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        if(!questions?.length) {
            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });

            const ticketChannel = await ticket_router.openTicket(interaction.client, interaction, interaction.guild.id, this.category_id, interaction.user.id, isVip);

            const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];
            const msg = new BlueMessage(interaction.client, "ticket-opened", locale,  {
                "channel_id": ticketChannel.id,
                "user_id": interaction.user.id,
                "category_name": categoryData[0].category_name
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
                files: msg.attachments
            });

            return;
        }

        const modal = new TicketQuestionsModal(this.client, this.locale, this.category_id);
        await modal.build();

        await interaction.showModal(modal.modal);

        return;
    }
};