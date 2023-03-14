const { summary } = require("date-streaks");

/**
 * Converts SQL select outputs into strings with spaced and formatted rows.
 *
 * @param {Array.<string>} tableHeaders - The headers for the table, column names
 * @param {Array.<Array.<string>>} tableData - The data for the table, each row being its own array.
 * @returns {Array<string>} The formatted and padded data in the following format: [0] Header [n] Data row.
 */
function SqlDataToTable(tableHeaders, tableData) {

	let columnWidths = [0, 0, 0, 0];
	for (let i = 0; i < tableData.length; i++) {
		for (let j = 0; j < tableData[i].length; j++) {
			columnWidths[j] = Math.max(columnWidths[j], tableData[i][j].length);
		}
	}

	// Calculate the maximum width of the header strings
	for (let i = 0; i < tableHeaders.length; i++) {
		columnWidths[i] = Math.max(columnWidths[i], tableHeaders[i].length);
	}

	let headerString = "";
	for (let i = 0; i < tableHeaders.length; i++) {
		headerString += tableHeaders[i].padEnd(columnWidths[i], " ") + "    ";
	}

	let formattedData = []
	formattedData.push(headerString + "\n\n");


	for (let i = 0; i < tableData.length; i++) {
		let dataString = "";
		for (let j = 0; j < tableData[i].length; j++) {
			dataString += tableData[i][j].padEnd(columnWidths[j], " ") + "    ";
		}
		formattedData.push(dataString + "\n");
	}

	//remove commas
	let noCommas = [];
	formattedData.forEach(row => { noCommas.push(row.replace(/,/g, '')) });
	formattedData = noCommas;

	return formattedData;
}

/**
 * Converts SQL select outputs into a formatted code block string.
 *
 * @param {Array.<string>} tableHeaders - The headers for the table, column names
 * @param {Array.<Array.<string>>} tableData - The data for the table, each row being its own array.
 * @returns {string} The formatted and padded data within a markdown code block.
 */
function SqlDataToCodeBlock(tableHeaders, tableData) {
	return '```' + SqlDataToTable(tableHeaders, tableData).join().replace(/,/g, '') + '```';
}

/**
 * Contracts strings greater than 10 characters (or override)
 *
 * @param {string} str - The string to contract
 * @param {int} len - The maximum length of a string
 * @returns {Array<string>} The formatted and padded data in the following format: [0] Header [n] Data row.
 */
function ContractString(str, len = 10) {
	len = len > 2 ? len - 2 : len; // Subtract two to account for ..
	return str.length > len ? str.substring(0, len) + '..' : str;
}

/**
 * Calculates the modal average time of an array of times in the format of "HH:MM:SS".
 * @param {string[]} times - An array of times in the format of "HH:MM:SS".
 * @returns {string} The average time in the format of "HH:MM:SS".
 */
function AverageTime(times) {
	let totalSeconds = 0;
	for (const time of times) {
		const parts = time.split(':');
		const hours = parseInt(parts[0]);
		const minutes = parseInt(parts[1]);
		const seconds = parseInt(parts[2]);
		totalSeconds += (hours * 60 * 60) + (minutes * 60) + seconds;
	}
	let avgSeconds = Math.round(totalSeconds / times.length);
	avgSeconds = (avgSeconds + 43200) % 86400;
	let avgHours = Math.floor(avgSeconds / 3600);
	let avgMinutes = Math.floor((avgSeconds % 3600) / 60);
	let avgSecondsRemainder = avgSeconds % 60;
	return `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}:${avgSecondsRemainder.toString().padStart(2, '0')}`;
}

/**
 * Calculates the median average time for each user given a set of objects in the format name, time.
 * @param {Array<object>} data - An array of objects with properties `user` and `date`.
 * @param {string} data.user - The name of the user.
 * @param {string} data.date - The time in the format of "HH:MM:SS".
 * @returns {Array} An array of objects with properties `user` and `time` representing the median average time for each user.
 * @param {string} returns.user - The name of the user.
 * @param {string} returns.time - The average time in the format of "HH:MM:SS".
 */
function AverageTimeMedian(data) {
	const users = SeparateUsersFromResults(data);
	let averagedData = [];
	users.forEach(user => {
		usersDates = [];
		data.forEach(res => {
			if (res.user == user) {
				usersDates.push(res.date);
			}
		});
		const midPoint = usersDates[Math.floor(usersDates.length / 2)]; //Use floor instead of ceil because arrays start at 0
		averagedData.push({ user: user, time: midPoint });
	});
	return averagedData;
}

/**
 * Calculates the modal average time for each user given a set of objects in the format name, time.
 * @param {Array<object>} data - An array of objects with properties `user` and `date`.
 * @param {string} data.user - The name of the user.
 * @param {string} data.date - The time in the format of "HH:MM:SS".
 * @returns {Array} An array of objects with properties `user` and `time` representing the median average time for each user.
 * @param {string} returns.user - The name of the user.
 * @param {string} returns.time - The average time in the format of "HH:MM:SS".
 */
function AverageTimeMode(data) {
	const users = SeparateUsersFromResults(data);
	let averagedData = [];
	users.forEach(user => {
		usersDates = [];
		data.forEach(res => {
			if (res.user == user) {
				usersDates.push(res.date);
			}
		})
		averagedData.push({ user: user, time: AverageTime(usersDates) });
	});
	return averagedData;
}

function SeparateUsersFromResults(results) {
	let users = [];
	results.forEach(result => {
		if (!users.find(elem => elem == result.user)) users.push(result.user);
	});
	return users;
}


/**
 * 
 * @param {Array<object>} data SQL rows in format: name, date.
 * @returns {Array<object>} Streak data in format: user, currentStreak, longestStreak.
 */
function GetStreaksFromLogs(data) {
	// expects data in format name, date. Use GetJoinTimes to get this format, as it also expects ordering.
	const users = SeparateUsersFromResults(data);
	let streaks = [];
	users.forEach(user => {
		usersDates = [];
		data.forEach(res => {
			if (res.user == user) {
				usersDates.push(new Date(res.date));
			}
		});
		const streakData = summary(usersDates);
		streaks.push({ user: user, currentStreak: streakData.currentStreak.toString(), longestStreak: streakData.longestStreak.toString() });
	});
	return streaks;
}

function GetTotalDaysPerUser(data) {
	const users = SeparateUsersFromResults(data);
	let results = [];
	users.forEach(user => {
		let total = 0;
		data.forEach(row => {
			if (row.user == user) {
				total++;
			}
		})
		results.push({ user: user, total: total.toString() });
	});
	return results;
}

function ForceAlphanumericString(str) {
	return str
		.replace(
			/([^a-zA-Z0-9 -])/g,
			''
		)
		.replace(/\s+/g, ' ')
		.trim();;
}

module.exports = {
	SqlDataToTable,
	SqlDataToCodeBlock,
	ContractString,
	AverageTime,
	AverageTimeMedian,
	AverageTimeMode,
	GetStreaksFromLogs,
	GetTotalDaysPerUser,
	ForceAlphanumericString
};


