const { SlashCommandBuilder } = require('discord.js');
const dbConnector = require('../database-connector.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('system-reload_channels')
		.setDescription('Refreshes the list of channels in the database (run this when server channels change)'),
	async execute(interaction) {
		// Audit
		dbConnector.PostAudit({ command: this.data.name, arguments: null, userId: interaction.member.user.id });
		// Code
		try {
			interaction.member.guild.channels.fetch().then(async function (channels) {
				await ReloadChannels(channels)
					.then(async function () {
						await dbConnector.GetChannels()
							.then(async function (res) {
								console.log(res);
								let names = [];
								res.forEach(channel => {
									names.push("\n" + channel.name);
								});
								await interaction.reply(names.toString());
							});
					});
			});
		}
		catch (err) {
			console.log(err);
		}
	},
};

async function ReloadChannels(channels) {
	let queryData = [];
	channels.forEach(channel => {
		queryData.push(`('${channel.id}', '${channel.name}')`);
	});
	return await dbConnector.PostReloadChannels(queryData);
}