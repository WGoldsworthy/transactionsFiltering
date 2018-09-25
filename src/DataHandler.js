
// Class to make computations on the data and handle returning the correct information
class DataHandler {
	
	/**
	 * Attach the response file (data) to the handler
	 * @constructor
	 */
	constructor() {
		this.data = require('./response.json');
	}

	/**
	 * Search for users in response by ID. Returns the first ten results 
	 * for use in autosuggest.
	 * @param {string} id - The current query from user input
	 * @returns {[string]} - The first ten possible user ids
	 */
	searchUsers(id) {
		var length = id.length;
		
		var response = this.data.filter(users =>
			users.user.toString().substring(0, length) == id
		);

		var searchAutoResponse = this.getUniqueUserIds(response);
		return searchAutoResponse;
	}

	/**
	 * Finds unique user ids in the response.
	 * @param {Array} response - The data filtered with by possible users with input query
	 * @returns {[string]} - The first ten possible user ids.
	 */
	getUniqueUserIds(response) {
		var userIds = [];
		var x = 0;
		
		response.some(function(entry) {
			if (!userIds.includes(entry.user)) {
				userIds.push(entry.user);
				x++;
				if (x >= 10) {
					return userIds; // Use return to break a some loop
				}
			} 
		});

		return userIds;
	}

	/**
	 * Calculation function for finding transactions and points in the period
	 * as well as total transactions and points. Additional functionality of
	 * passing each transaction.
	 * @param {string} user - User id from search
	 * @param {date} startDate - Start date for the period
	 * @param {date} endDate - End date for the period
	 * @returns {Object} - data object with transactions for the period,
	 * points for the period, total transactions, total points, array of each transaction. 
	 */
	getTransactionsAmount(user, startDate, endDate) {
		var response = this.data.filter(entry => 
			entry.user.toString() == user
		);

		var transactionsAmount = 0;
		var pointsAmount = 0;
		var transactions = [];
		var totalTransactions = 0;
		var totalPoints = 0;

		response.forEach(function(entry) {
			var date = new Date(entry.timestamp.substring(0, 10));

			totalTransactions += entry.amount;
			
			if (entry.points) {
				totalPoints += entry.points;
			}
			
			if (date > startDate && date < endDate) {
				transactionsAmount = transactionsAmount + entry.amount;
				if (entry.points) {
					pointsAmount = pointsAmount + entry.points;
				}
				transactions.push(entry);
			}
		});

		var data = {
			"transactionsAmount": transactionsAmount,
			"pointsAmount": pointsAmount,
			"transactions": transactions,
			"totalTransactions": totalTransactions,
			"totalPoints": totalPoints,
		};

		return data;
	}

}

module.exports = DataHandler