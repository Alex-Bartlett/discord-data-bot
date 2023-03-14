const { SlashCommandBuilder } = require('discord.js');
const dbConnector = require('../database-connector.js');
const utils = require('../discordDataUtilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recentlogs')
		.setDescription('Get the recent activity logs')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user to target. Default: all'))
		.addBooleanOption(option =>
			option.setName('ignore_unknowns')
				.setDescription('Ignore unknown connection types. Default: false'))
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether the reply shows only for you, or for the whole server. Default: true')),
	async execute(interaction) {
		// Arguments
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
		const ignoreUnknowns = interaction.options.getBoolean('ignore_unknowns') ?? true;
		const user = interaction.options.getUser('user');
		const userId = user == null ? user : user.id;
		// Audit		
		dbConnector.PostAudit({ command: this.data.name, arguments: `ephemeral = ${ephemeral}, ignoreUnknowns = ${ignoreUnknowns}, user = ${user ? user.username : '*'}`, userId: interaction.member.user.id });
		// Code

		await dbConnector.GetRecentLogs(userId, ignoreUnknowns)
			.then(async function (res) {
				let logs = [];
				res.forEach(log => {
					logs.push([`${log.type}`, `${utils.ContractString(log.user)}`, `${log.channel}`, `${log.date} ${log.time}`]);
				});

				let header = ["Type", "User", "Channel", "Date"];

				await interaction.reply({ content: utils.SqlDataToCodeBlock(header, logs) ?? 'An error occured - see logs', ephemeral: ephemeral });
			})
	},
};