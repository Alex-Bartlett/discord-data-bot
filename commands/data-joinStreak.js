const { SlashCommandBuilder } = require('discord.js');
const dbConnector = require('../database-connector.js');
const utils = require('../discordDataUtilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('streaks')
		.setDescription('Get the join streak for every member in the server.')
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether the reply shows only for you, or for the whole server. Default: true')),
	async execute(interaction) {
		// Arguments
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
		// Audit
		dbConnector.PostAudit({ command: this.data.name, arguments: `ephemeral = ephemeral`, userId: interaction.member.user.id });
		// Code

		await dbConnector.GetJoinDays().then(async function (result) {
			const streaks = utils.GetStreaksFromLogs(result);
			const header = ['User', 'Current Streak', 'Longest Streak'];
			let rows = [];
			streaks.forEach(row => rows.push([utils.ForceAlphanumericString(row.user), row.currentStreak, row.longestStreak]));
			let content = utils.SqlDataToCodeBlock(header, rows);
			await interaction.reply({ content: content, ephemeral: ephemeral });
		});
	},
};