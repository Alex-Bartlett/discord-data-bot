const { SlashCommandBuilder } = require('discord.js');
const dbConnector = require('../database-connector.js');
const utils = require('../discordDataUtilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('totalconnections')
		.setDescription('The total days everyone has connected')
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether the reply shows only for you, or for the whole server. Default: true')),
	async execute(interaction) {
		// Arguments
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
		// Audit
		dbConnector.PostAudit({ command: this.data.name, arguments: `ephemeral = ephemeral`, userId: interaction.member.user.id });
		// Code

		await dbConnector.GetJoinDays().then(async function (data) {
			const totals = utils.GetTotalDaysPerUser(data);
			const header = ['User', 'Total Days Joined'];
			const rows = [];
			totals.forEach(row => rows.push([utils.ForceAlphanumericString(row.user), row.total]));
			let content = utils.SqlDataToCodeBlock(header, rows);
			await interaction.reply({ content: content, ephemeral: ephemeral });
		})
	},
};