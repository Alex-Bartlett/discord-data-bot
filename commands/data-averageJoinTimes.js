const { SlashCommandBuilder } = require('discord.js');
const dbConnector = require('../database-connector.js');
const utils = require('../discordDataUtilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jointimes')
		.setDescription('Get the average join time for all users')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of average to use (median recommended)')
				.addChoices(
					{ name: 'Mode', value: 'mode' },
					{ name: 'Median', value: 'median' }
				))
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether the reply shows only for you, or for the whole server. Default: true')),
	async execute(interaction) {
		// Arguements
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? 'true';
		const average = interaction.options.getString('type') ?? 'median';
		// Audit
		dbConnector.PostAudit({ command: this.data.name, arguments: `ephemeral = ${ephemeral}, average = ${average}`, userId: interaction.member.user.id });
		// Code
		await dbConnector.GetJoinTimes()
			.then(async function (results) {
				const header = ['User', 'Average Join Time'];
				let averagedData;

				if (average == 'median') {
					averagedData = utils.AverageTimeMedian(results);
				}
				else { //mode (not working)
					averagedData = utils.AverageTimeMode(results);
				}

				let rows = [];
				averagedData.forEach(row => {
					rows.push([`${utils.ContractString(row.user)}`, `${row.time}`]);
				});

				let disclaimer = average === 'mode' ? '*Please note: I currently unable to distinguish between AM and PM when using **mode** average. Assume date in a 12hr format.*' : '';

				await interaction.reply({ content: ((utils.SqlDataToCodeBlock(header, rows) ?? 'An error occured - see logs') + disclaimer), ephemeral: ephemeral });
			})

	},
};