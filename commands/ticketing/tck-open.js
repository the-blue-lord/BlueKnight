const Discord = require("discord.js");

const BlueCommand = require("../../structures/BlueCommand");
const BlueMessage = require("../../structures/BlueMessage");

const { openTicket } = require("../../routes/ticket-router");
const { Routes, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = class TckOpen extends BlueCommand {
    constructor(client) {
        super(client, "tck-open");
    }

    async run(interaction) {
        await interaction.deferReply({
                    flags: Discord.MessageFlags.Ephemeral
        });

        const category = interaction.options.get("category")?.value;
        const user_id = interaction.options.get("user")?.value;

        const channel = await openTicket(this.client, interaction, interaction.guild.id, category, user_id);

        const guildData = await queryDatabase("SELECT * FROM `Guilds` WHERE `guild_id` = ?", [interaction.guild.id]);
        const locale = guildData[0]?.locale || interaction.guild.preferredLocale.split("-")[0];

        if(!channel) {
            const msg = new BlueMessage(this.client, "unknown-category", locale, {
                "category_name": category,
                "user_id": user_id
            });

            await interaction.editReply({
                embeds: [msg.embed],
                components: msg.components,
                files: msg.attachments
            })

            return;
        }

        const message = new BlueMessage(interaction.client, "ticket-opened", locale, {
            "channel_id": channel.id,
            "user_id": interaction.user.id
        });

        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/channels/" + channel.guildId + "/" + channel.id)
            .setLabel("Ticket");

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.editReply({
            embeds: [message.embed],
            files: message.attachments,
            components: message.components.concat(row)
        });
    }
};