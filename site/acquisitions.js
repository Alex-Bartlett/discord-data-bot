const dataBuilder = require('./site-data-builder.js');


async function make() {

	await dataBuilder.Data_TotalConnections.then(data => {
		new Chart(
			"myChart",
			{
				type: 'bar',
				data: {
					labels: data.map(row => row.user),
					datasets: [
						{
							label: 'Total connections per user',
							data: data.map(row => row.total)
						}
					]
				}
			}
		);
	})
};

make();
