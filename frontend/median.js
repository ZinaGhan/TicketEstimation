// Function to dynamically calculate and display medians based on the date range
async function fetchMedian() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        const issuesContainer = document.getElementById('issues-container');
        issuesContainer.innerHTML = ''; // Clear previous content

        // Fetch unique issue IDs dynamically from the backend
        const issueIdsResponse = await fetch('http://localhost:4000/api/unique-issue-ids');
        if (!issueIdsResponse.ok) {
            throw new Error('Failed to fetch unique issue IDs');
        }
        const issueIdsData = await issueIdsResponse.json();
        const issueIds = issueIdsData.map(item => item.issue_id); // Extract unique issue IDs

        // Loop through all fetched issue IDs
        for (let issueId of issueIds) {
            const response = await fetch(`http://localhost:4000/api/issue-median?issueId=${issueId}&startDate=${startDate}&endDate=${endDate}`);

            if (response.ok) {
                const data = await response.json();
                const { medianEffort, medianUncertainty, totalEffort } = data;

                const issueElement = document.createElement('div');
                issueElement.className = 'issue';
                issueElement.innerHTML = `
                    <h3>Issue ID: ${issueId}</h3>
                    <p><strong>Estimated Effort Median:</strong> ${medianEffort.toFixed(2)} hours</p>
                    <p><strong>Estimation Uncertainty Median:</strong> ${medianUncertainty.toFixed(2)}</p>
                    <p><strong>Recalculated Total Effort:</strong> ${totalEffort.toFixed(2)} hours</p>
                `;
                issuesContainer.appendChild(issueElement);
            } else {
                console.error(`Failed to fetch data for issue ${issueId}`);
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Initialize default dates to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('startDate').value = today;
document.getElementById('endDate').value = today;

// Fetch medians initially on page load
fetchMedian();