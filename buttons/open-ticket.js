const { ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, MessageFlags  } = require("discord.js");

const BlueButton = require("../structures/BlueButton");
const BlueMessage = require("../structures/BlueMessage");

const queryDatabase = require("../utilis/queryDatabase");
const ticket_router = require("../routes/ticket-router");
const Discord = require("discord.js");

module.exports = class OpenTicketButton extends BlueButton {
    constructor(client, categoryName) {
        super(client, "open-ticket", categoryName || "");
        
        this.button
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("📩")
            .setLabel("Open Ticket");

        this.category_name = categoryName;
    }

    async run (action, interaction) {
        if(this.action != action) return;

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);

        const vip_role_id = guildData[0].vip_role;
        const isVip = interaction.member.roles.cache.find(r => r.id == vip_role_id) ? true : false;

        const categoryData = await queryDatabase("SELECT * FROM `Categories` WHERE `guild_id` = ? AND `category_name` = ?", [interaction.guild.id, this.category_name]);

        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `guild_id` = ? AND `category_name` = ?", [interaction.guild.id, this.category_name]);

        if(!questions?.length || !categoryData) {
            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });

            const ticketChannel = await ticket_router.openTicket(interaction.client, interaction, interaction.guild.id, categoryData ? this.category_name : undefined, interaction.user.id, !isVip);

            const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];
            const msg = new BlueMessage(interaction.client, "ticket-opened", locale,  {
                "channel_id": ticketChannel.id,
                "user_id": interaction.user.id,
                "category_name": this.category_name
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

        const modal = new ModalBuilder()
            .setCustomId("open-ticket");

        for(const [index, question] of questions) {
            modal.addComponents(
                new TextInputBuilder()
                    .setStyle(TextInputStyle.Paragraph)
                    .setLabel(question.title)
                    .setPlaceholder(question.description)
                    .setRequired(true)
                    .setCustomId("question_" + index)
            );
        }

        await interaction.showModal(modal);

        return;
    }
};