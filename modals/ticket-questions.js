const Discord = require('discord.js');

const BlueModal = require('../structures/BlueModal');
const BlueMessage = require('../structures/BlueMessage');
const queryDatabase = require('../utilis/queryDatabase');

const ticket_router = require('../routes/ticket-router');
const BlueEmbed = require('../structures/BlueEmbed');

module.exports = class TicketQuestionsModal extends BlueModal {
    constructor(client, localisation = "en", category_name, guild_id) {
        super(client, "open-ticket", localisation, category_name);

        this.category_name = category_name;
        this.guild_id = guild_id;
    }

    async build() {
        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `guild_id` = ? AND `category_name` = ?", [this.guild_id, this.category_name]);
        this.modal = new Discord.ModalBuilder()
            .setTitle("Open Ticket - " + this.category_name)
            .setCustomId(this.id);

        var cnt = 0;

        for(const question of questions) {
            this.modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setLabel(question.question)
                        .setRequired(true)
                        .setCustomId("answer_" + cnt++)
                )
            );
        }
    }

    async run(modalId, interaction) {
        if(modalId != this.action) return;

        await interaction.deferReply({
            flags: Discord.MessageFlags.Ephemeral
        });

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const vip_role_id = guildData[0].vip_role;
        const isVip = interaction.member.roles.cache.find(r => r.id == vip_role_id) ? true : false;
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        const questions = await queryDatabase("SELECT * FROM `CategoryQuestions` WHERE `guild_id` = ? AND `category_name` = ?", [interaction.guild.id, this.category_name]);

        const ticketChannel = await ticket_router.openTicket(interaction.client, interaction, interaction.guild.id, this.category_name, interaction.user.id, isVip);

        if(!ticketChannel) {
            interaction.editReply("Error");
            return;
        }

        const msg = new BlueMessage(interaction.client, "ticket-opened", locale, {
            "channel_id": ticketChannel.id,
            "user_id": interaction.user.id,
            "category_name": this.category_name,
            "channel_link": `https://discord.com/channels/${interaction.guild.id}/${ticketChannel.id}`,
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

        if(!questions?.length) return;

        var cnt = 0;
        const answer_fields = [];
        for(const question of questions) {
            const answer = interaction.fields.getTextInputValue("answer_" + cnt++);
            answer_fields.push({
                type: "question",
                vars: {
                    question: question.question,
                    answer: answer
                }
            });
        }

        const answer_embed = new BlueEmbed(interaction.client, "ticket-questions", locale, answer_fields);

        await ticketChannel.send({
            embeds: [answer_embed.embed],
            components: answer_embed.components,
        });

        return;
    }
};