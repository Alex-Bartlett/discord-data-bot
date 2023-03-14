const fs = require('node:fs')
const path = require('node:path')
// Require the necessary discord.js classes
const {
	Client,
	GatewayIntentBits,
	Events,
	Collection,
	ConnectionService,
	ActivityType,
} = require('discord.js')
const { token } = require('./config.json')
const { channel } = require('node:diagnostics_channel')
const dbConnector = require('./database-connector.js')

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers],
})

client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command)
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
		)
	}
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	client.user.setPresence({
		activities: [{ name: `you on your webcam`, type: ActivityType.Watching }],
		status: 'gay',
	});
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return

	const command = interaction.client.commands.get(interaction.commandName)

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`)
		return
	}

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		await interaction.reply({
			content: 'There was an error while executing this command.',
			ephemeral: true,
		})
	}
})

client.on('voiceStateUpdate', (oldstate, newstate) => {
	const oldChannelId = oldstate.channelId;
	const newChannelId = newstate.channelId;
	const member = newstate.member;
	const newChannel = newstate.channel;
	const oldChannel = oldstate.channel;
	const connectionTypes = {
		Connect: 'connect',
		Disconnect: 'disconnect',
		Change: 'change',
		Unknown: 'unknown',
	};
	let connectionType;

	if (oldChannelId === null && newChannelId != null) {
		connectionType = connectionTypes.Connect;
		console.log(member.user.username + ' joined ' + newChannel.name);
	} else if (oldChannelId != null && newChannelId === null) {
		connectionType = connectionTypes.Disconnect;
		console.log(member.user.username + ' left ' + oldChannel.name);
	} else if (oldChannelId != null && newChannelId != null && oldChannelId != newChannelId) {
		connectionType = connectionTypes.Change;
		console.log(member.user.username + ' moved from ' + oldChannel.name + ' to ' + newChannel.name);
	} else {
		return;
	}

	dbConnector.PostConnectionData(connectionType, member.id, (newChannel != null ? newChannel.id : '0')); //Use 0 as channel id if null (ie. disconnect)
})

// Login to Discord with your client's token
client.login(token)

// dbConnector.GetData()
//     .then(result => console.log(result));