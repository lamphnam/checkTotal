// Function to calculate total secrets from a single user data object
function calculateTotalSecrets(userData) {
    let totalSecrets = 0;
    if (Array.isArray(userData.challenges)) {
        userData.challenges.forEach(challenge => {
            totalSecrets += challenge.total;
        });
    }
    return totalSecrets;
}

// Function to fetch data from the provided URLs
async function fetchUserData(urls) {
    let totalSecretsSum = 0;
    let resultText = '';

    for (const url of urls) {
        try {
            // Fetch data from the URL
            const response = await fetch(url);
            const userData = await response.json();

            // Calculate total secrets for this user
            const totalSecrets = calculateTotalSecrets(userData);
            totalSecretsSum += totalSecrets;

            // Append the result for this user
            resultText += `User ID: ${userData.user_id}\nTotal Secrets: ${totalSecrets}\n\n`;
        } catch (error) {
            resultText += `Error fetching data from ${url}: ${error.message}\n\n`;
        }
    }

    // Display the total secrets for all users
    resultText += `Total Secrets for All Users: ${totalSecretsSum}`;
    const outputElement = document.getElementById('output');
    outputElement.innerText = resultText;

    // Apply fade-in effect when data is fetched
    outputElement.style.opacity = '1';

    // Store the current check with time
    const currentCheck = {
        time: new Date().toLocaleString(),
        totalSecrets: totalSecretsSum
    };

    savePreviousCheck(currentCheck);
    displayPreviousChecks();
}

// Function to save previous checks in local storage (limit to 5)
function savePreviousCheck(check) {
    let previousChecks = JSON.parse(localStorage.getItem('previousChecks')) || [];

    // Add the new check at the end (chronological order)
    previousChecks.push(check);

    // If more than 5 checks, remove the first one (oldest entry)
    if (previousChecks.length > 3) {
        previousChecks.shift(); // Removes the first (oldest) element in the array
    }

    // Save the updated checks back to local storage
    localStorage.setItem('previousChecks', JSON.stringify(previousChecks));
}

// Function to display previous checks
function displayPreviousChecks() {
    const previousChecksContainer = document.getElementById('previousChecks');
    let previousChecks = JSON.parse(localStorage.getItem('previousChecks')) || [];

    // Display the checks in reverse order (newest first)
    previousChecksContainer.innerHTML = previousChecks
        .map(check => `<p><strong>Time:</strong> ${check.time}<br><strong>Total Secrets:</strong> ${check.totalSecrets}</p>`)
        .reverse() // Reverses the order to show newest at the top
        .join('');
}

// Function to delete previous checks
function deletePreviousChecks() {
    localStorage.removeItem('previousChecks');
    displayPreviousChecks(); // Clear the display
}

// URLs to fetch from
const urls = [
    'https://retailtoken-web.testnet.blockchain-cluster.nilogy.xyz/verifier/nillion1yw7c3swwaygx27jwrzslv2vra66xv9ja69ry6l/summary',
    'https://retailtoken-web.testnet.blockchain-cluster.nilogy.xyz/verifier/nillion14axpkaunqpre5slcmmawr5pg5vnx8yegfr6v3m/summary',
    'https://retailtoken-web.testnet.blockchain-cluster.nilogy.xyz/verifier/nillion1dzz5u3826xn0wkdyv73j56pz3et3f8uep7dpqq/summary'
];

// Trigger the data fetching process on button click
document.getElementById('fetchDataBtn').addEventListener('click', function () {
    document.getElementById('loader').style.display = 'block';
    fetchUserData(urls).then(() => {
        document.getElementById('loader').style.display = 'none';
    });
});

// Trigger the delete process on delete button click
document.getElementById('deleteChecksBtn').addEventListener('click', function () {
    deletePreviousChecks();
});

// Function for auto-fetching every 3 minutes
function autoFetch() {
    fetchUserData(urls);
}

// Display previous checks on page load
window.onload = function () {
    displayPreviousChecks();
    setInterval(autoFetch, 180000); // 180000 ms = 3 minutes
};
