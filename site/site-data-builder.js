const utils = require('../discordDataUtilities');
const dbConnector = require('../database-connector');

/**
 * @returns {Array<object>}
 * @param {String} returns.user
 * @param {String} returns.total
 */
async function Data_TotalConnections() {
	await dbConnector.GetJoinDays().then(sqlResult => {
		const data = utils.GetTotalDaysPerUser(sqlResult);
		return data;
	})
}


module.exports = {
	Data_TotalConnections
}