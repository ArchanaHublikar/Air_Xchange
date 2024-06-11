document.addEventListener("DOMContentLoaded", () => {
    fetchCryptoData();
});

async function fetchCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true');
        const data = await response.json();
        populateCryptoSelect(data);
        populateMarketTable(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function populateCryptoSelect(data) {
    const cryptoSelect = document.getElementById('crypto-select');
    data.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto.id;
        option.text = crypto.name;
        cryptoSelect.appendChild(option);
    });
}

async function convert() {
    const amount = document.getElementById('amount').value;
    const cryptoId = document.getElementById('crypto-select').value;

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
        const data = await response.json();
        const conversionRate = data[cryptoId].usd;
        const convertedAmount = amount / conversionRate;
        document.getElementById('conversion-result').innerText = `${amount} USD = ${convertedAmount.toFixed(6)} ${cryptoId.toUpperCase()}`;
    } catch (error) {
        console.error('Error converting currency:', error);
    }
}

function populateMarketTable(data) {
    const tableBody = document.querySelector('#market-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    data.forEach(crypto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${crypto.name}</td>
            <td>${crypto.current_price} USD</td>
            <td>${crypto.market_cap}</td>
            <td>${crypto.price_change_percentage_24h}%</td>
            <td><canvas class="price-graph" id="chart-${crypto.id}"></canvas></td>
        `;
        tableBody.appendChild(row);
        createPriceChart(crypto);
    });
}

function createPriceChart(crypto) {
    const ctx = document.getElementById(`chart-${crypto.id}`).getContext('2d');
    const labels = crypto.sparkline_in_7d.price.map((_, index) => index);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Price in USD',
            data: crypto.sparkline_in_7d.price,
            borderColor: getRandomColor(),
            borderWidth: 1,
            fill: false,
        }]
    };
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            elements: {
                point: {
                    radius: 0 // Hide data points
                }
            }
        }
    };
    new Chart(ctx, config);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
