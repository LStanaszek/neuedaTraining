function createPortfolioChart(canvasId, apiEndpoint, userId, title, selectorId, legend, fontSize = 20) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    let finalAPI;
    if (apiEndpoint === "portfolio"){
        finalAPI = `./Dashboard/GetPerformanceGraphData?userId=${userId}&timeframe=3`;
    }
    else {
        finalAPI = `/Browse/HistoricalDatesPrices?ticker=${legend}&timeframe=3`;
    }
    
    fetch(finalAPI)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            initializeChart(ctx, data, title, selectorId, legend, apiEndpoint, fontSize);
        })
        .catch(error => console.error('Error fetching graph data:', error));
}

function initializeChart(ctx, data, title, selectorId, legend, apiEndpoint, fontSize) {
    const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
    const portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: legend,
                data: data.valuations,
                borderWidth: 2,
                borderColor: 'rgb(75, 192, 192)',
                segment: {borderColor: ctx => down(ctx, 'rgb(192,75,75)')}
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            fill: true,
            // backgroundColor: 'rgba(75, 192, 192, 0.2)',
            radius: 1,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: fontSize
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end'
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // Function to update the chart with new data
    function updateChart(newData) {
        portfolioChart.data.labels = newData.dates;
        portfolioChart.data.datasets[0].data = newData.valuations;
        portfolioChart.update();
    }

    // Handle timeframe changes

    document.getElementById(selectorId).addEventListener('change', function() {
        const selectedTimeframe = this.value;
        let timeframe;
        switch (selectedTimeframe) {
            case '1w':
                timeframe = 0;
                break;
            case '1m':
                timeframe = 1;
                break;
            case '6m':
                timeframe = 2;
                break;
            case '1y':
                timeframe = 3;
                break;
        }

        let finalAPI;
        if (apiEndpoint === "portfolio"){
            finalAPI = `./Dashboard/GetPerformanceGraphData?userId=${userId}&timeframe=${timeframe}`;
        }
        else {
            finalAPI = `/Browse/HistoricalDatesPrices?ticker=${legend}&timeframe=${timeframe}`;
        }

        fetch(finalAPI)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(newData => {
                updateChart(newData);
            })
            .catch(error => console.error('Error fetching updated graph data:', error));
    });
}
