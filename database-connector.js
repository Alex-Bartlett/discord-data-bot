const mariadb = require('mariadb');
const pool = mariadb.createPool({
	host: '127.0.0.1',
	user: 'primary',
	password: 'admin',
	connectionLimit: 5
});
const dbName = "discordData_db"

async function RunQuery(query) {
	let conn;
	let rows;
	try {
		conn = await pool.getConnection();
		rows = await conn.query(query);
	} catch (err) {
		console.log(err);
	} finally {
		if (conn) conn.end();
		if (rows) return rows;
	}
}

function TestConnection() {
	const query = "SELECT 1 AS Val";
	RunQuery(query)
		.then(result => console.log(result));
}

async function GetData() {
	const query = `SELECT * FROM ${dbName}.connections;`;
	try {
		res = await RunQuery(query);
		return res;
	} catch (err) {
		console.log(err);
	}
}

async function GetMembers() {
	const query = `SELECT * FROM ${dbName}.members;`
	try {
		return await RunQuery(query);
	}
	catch (err) {
		console.log(err);
	}
}

async function GetChannels() {
	const query = `SELECT * FROM ${dbName}.channels;`
	try {
		return await RunQuery(query);
	}
	catch (err) {
		console.log(err);
	}
}

// Returns obj {type, user, channel, date, time}
async function GetRecentLogs(userId = null, ignoreUnknowns = true) {
	const userCheck = `connections.clientId = ${userId}`;
	const ignoreUnknownsCheck = `connections.connectionType != 'unknown'`;

	let whereClause = '';
	if (userId) {
		whereClause = `WHERE ${userCheck}`;
		if (ignoreUnknowns) {
			whereClause += ` AND ${ignoreUnknownsCheck}`;
		}
	} else if (ignoreUnknowns) {
		whereClause = `WHERE ${ignoreUnknownsCheck}`;
	}

	const query = `SELECT connections.connectionType as 'type', members.name as 'user', channels.name as 'channel', DATE_FORMAT(connections.date, '%a %D %b %y') as 'date', DATE_FORMAT(connections.date, '%T') as 'time' FROM ${dbName}.connections INNER JOIN ${dbName}.members ON connections.clientId = members.id LEFT JOIN ${dbName}.channels ON connections.channelId = channels.id ${whereClause} ORDER BY connections.date DESC LIMIT 10;`;
	try {
		return await RunQuery(query);
	}
	catch (err) {
		console.log(err);
	}
}

async function GetJoinTimes() {
	// It's important this query is ordered by date in some manner as it's required for a median average.
	const query = `SELECT members.name as user, DATE_FORMAT(connections.date, '%T') AS 'date' FROM ${dbName}.connections INNER JOIN ${dbName}.members ON connections.clientId = members.id WHERE connectionType = 'connect' ORDER BY members.name DESC, connections.date ASC;`;
	try {
		return await RunQuery(query);
	}
	catch (err) {
		console.log(err);
	}
}

async function GetLeaveTimes() {
	// It's important this query is ordered by date in some manner as it's required for a median average.
	const query = `SELECT members.name as user, DATE_FORMAT(connections.date, '%T') AS 'date' FROM ${dbName}.connections INNER JOIN ${dbName}.members ON connections.clientId = members.id WHERE connectionType = 'disconnect' ORDER BY members.name DESC, connections.date ASC;`;
	try {
		return await RunQuery(query);
	}
	catch (err) {
		console.log(err);
	}
}

async function GetJoinDays() {
	// It's important this query is ordered by date in some manner as it's required for streaks. 
	const query = `SELECT members.name as user, DATE(connections.date) AS 'date' FROM ${dbName}.connections INNER JOIN ${dbName}.members ON connections.clientId = members.id WHERE connectionType = 'connect' GROUP BY members.name, DATE(connections.date) ORDER BY members.name ASC, connections.date DESC;`;
	try {
		return await RunQuery(query);
	}
	catch (err) {
		console.log(err);
	}
}

async function PostConnectionData(connectionType, clientId, channelId) {
	const query = `INSERT INTO ${dbName}.connections (connectionType, clientId, channelId, date) VALUES ('${connectionType}', '${clientId}', '${channelId}', NOW());`;
	try {
		return await RunQuery(query);
	} catch (err) {
		throw err;
	}
}

async function PostReloadMembers(queryData) {
	// Truncate, then get a list of clientId : clientName and use this to generate a VALUES (a, b), (a, b), (a, b) etc. and run query
	const query1 = `TRUNCATE ${dbName}.members;`;
	const query2 = `INSERT INTO ${dbName}.members (id, name) VALUES ${queryData}`;
	try {
		return await RunQuery(query1)
			.then(async function () {
				return await RunQuery(query2);
			});
	}
	catch (err) {
		console.log(err);
	}
}

async function PostReloadChannels(queryData) {
	const query1 = `TRUNCATE ${dbName}.channels;`;
	const query2 = `INSERT INTO ${dbName}.channels (id, name) VALUES ${queryData}`;
	try {
		return await RunQuery(query1)
			.then(async function () {
				return await RunQuery(query2);
			});
	}
	catch (err) {
		console.log(err);
	}
}

/**
 * 
 * @param {object} queryData The data to post
 * @param {string} queryData.command The name of the command 
 * @param {string} queryData.arguments Any arguments (if none, send null)
 * @param {string} queryData.userId The id of the user that sent the command
 */
async function PostAudit(queryData) {
	const query = `INSERT INTO ${dbName}.auditLog (command, arguments, userId, date) VALUES ('${queryData.command}', '${queryData.arguments ?? ''}', '${queryData.userId}', NOW());`;
	try {
		return await RunQuery(query);
	}
	catch (err) {
		console.log("AUDIT ERROR: ");
		console.log(err);
	}
}

async function PrintAudit() {
	const query = `SELECT DATE_FORMAT(auditLog.date, '%Y-%m-%d %H:%i:%s') as 'date', members.name as 'name', auditLog.command as 'command', auditLog.arguments as 'args' FROM ${dbName}.auditLog LEFT JOIN ${dbName}.members ON auditLog.userId = members.id ORDER BY auditLog.date DESC;`;
	try {
		return await RunQuery(query);
	}
	catch (err) {
		console.log(err);
	}
}

module.exports = {
	GetData,
	GetMembers,
	GetChannels,
	GetRecentLogs,
	GetJoinTimes,
	GetJoinDays,
	GetLeaveTimes,
	PostConnectionData,
	PostReloadMembers,
	PostReloadChannels,
	PostAudit,
	PrintAudit,
	TestConnection
}