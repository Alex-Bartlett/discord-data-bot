const { SlashCommandBuilder } = require('discord.js');
const dbConnector = require('../database-connector.js');
const utils = require('../discordDataUtilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('system-audit_log')
		.setDescription('Prints bot audit log to console'),
	async execute(interaction) {
		// Arguments
		const ephemeral = true;
		// Audit
		dbConnector.PostAudit({ command: this.data.name, arguments: `ephemeral = ${ephemeral}`, userId: interaction.member.user.id });
		// Code
		let header = ['Date', 'User', 'Command', 'Args'];
		let rows = [];
		await dbConnector.PrintAudit().then(results => {
			results = results.reverse();
			results.forEach(row => rows.push([row.date, row.name, row.command, row.args]));
			let output = utils.SqlDataToTable(header, rows);
			output.forEach(row => console.log(row));
		});

		let content;
		content = "Success - check console.";
		await interaction.reply({ content: content, ephemeral: ephemeral });
	},
};