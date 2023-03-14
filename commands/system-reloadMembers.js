//newstate.guild.members.fetch().then((members) => members.forEach(member => console.log(member.user.username)));

const { SlashCommandBuilder } = require('discord.js');
const dbConnector = require('../database-connector.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('system-reload_members')
		.setDescription('Refreshes the list of members in the database (run this when server members change)'),
	async execute(interaction) {
		// Audit
		dbConnector.PostAudit({ command: this.data.name, arguments: null, userId: interaction.member.user.id });
		// Code
		try {
			interaction.member.guild.members.fetch().then(async function (members) {
				await ReloadMembers(members)
					.then(async function () {
						await dbConnector.GetMembers()
							.then(async function (res) {
								console.log(res);
								let names = [];
								res.forEach(member => {
									names.push("\n" + member.name);
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

async function ReloadMembers(members) {
	let queryData = [];
	members.forEach(member => {
		queryData.push(`('${member.user.id}', '${member.user.username}')`);
	});
	return await dbConnector.PostReloadMembers(queryData);
}