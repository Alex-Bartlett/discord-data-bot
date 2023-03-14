const { SlashCommandBuilder } = require('discord.js');
const dbConnector = require('../database-connector.js');
const utils = require('../discordDataUtilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('???')
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether the reply shows only for you, or for the whole server. Default: true')),
	async execute(interaction) {
		// Arguments
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
		// Audit
		dbConnector.PostAudit({ command: this.data.name, arguments: `ephemeral = ${ephemeral}`, userId: interaction.member.user.id });
		// Code
		let content;
		content = "I collect channel activity data, and have different tools to represent it to you as information.";
		await interaction.reply({ content: content, ephemeral: ephemeral });
	},
};