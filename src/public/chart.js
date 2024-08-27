function createPortfolioChart(canvasId, apiEndpoint, userId, title, selectorId, legend) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    fetch(`${apiEndpoint}?userId=${userId}&timeframe=3`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            initializeChart(ctx, data, title, selectorId, legend);
        })
        .catch(error => console.error('Error fetching graph data:', error));
}

function initializeChart(ctx, data, title, selectorId, legend) {
    const portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: legend,
                data: data.valuations,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            fill: true,
            backgroundColour: 'rgba(255, 99, 132, 0.2)',
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 20
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

        fetch(`${apiEndpoint}?userId=${userId}&timeframe=${timeframe}`)
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
