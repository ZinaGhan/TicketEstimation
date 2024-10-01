// Fetch Jira issues and display them on the page
async function fetchJiraData() {
  try {
      // Fetch data from the backend API on port 4000
      const response = await axios.get('http://localhost:4000/api/jira/issues');
      
      if (response.status !== 200) {
          throw new Error('Failed to fetch Jira issues');
      }
  
      const issues = response.data.issues;
      displayIssues(issues);
  } catch (error) {
      console.error('Error fetching Jira data:', error);
      document.getElementById('issues-container').innerHTML = `<p>Error loading Jira issues. Please check the console for details.</p>`;
  }
}

// Function to display Jira issues on the page
function displayIssues(issues) {
  const issuesContainer = document.getElementById('issues-container');
  issuesContainer.innerHTML = ''; // Clear any existing content

  // Display each issue in the container
  issues.forEach((issue) => {
      const issueElement = document.createElement('div');
      issueElement.className = 'issue';

      const issueId = issue.key;

      issueElement.innerHTML = `
          <h3>${issue.fields.summary}</h3>
          <p><strong>Ticket ID:</strong> ${issueId}</p>
          <p><strong>Description:</strong></p>
          <div>${issue.fields.description || 'No description available'}</div>

          <!-- Estimated Effort (in hours) -->
          <label for="estimated-effort-${issueId}"><strong>Estimated Effort (hours):</strong></label>
          <input type="number" id="estimated-effort-${issueId}" name="estimated-effort-${issueId}" min="0" step="0.5" placeholder="Enter hours" oninput="calculateTotalEffort('${issueId}')">

          <!-- Estimation Uncertainty -->
          <label for="estimation-uncertainty-${issueId}"><strong>Estimation Uncertainty:</strong></label>
          <input type="number" id="estimation-uncertainty-${issueId}" name="estimation-uncertainty-${issueId}" min="0" step="0.1" placeholder="Enter uncertainty" oninput="calculateTotalEffort('${issueId}')">

          <!-- Total Effort -->
          <p><strong>Total Effort:</strong> <span id="total-effort-${issueId}">N/A</span></p>
      `;

      issuesContainer.appendChild(issueElement);
  });

  // Add a single submit button at the end
  const submitButton = document.createElement('button');
  submitButton.className = 'submit-btn';
  submitButton.innerText = 'Submit All';
  submitButton.onclick = submitAllEfforts;

  issuesContainer.appendChild(submitButton);
}

// Function to dynamically calculate and display total effort
// Function to dynamically calculate and display total effort
function calculateTotalEffort(issueId) {
  const estimatedEffort = parseFloat(document.getElementById(`estimated-effort-${issueId}`).value) || 0;
  const estimationUncertainty = parseFloat(document.getElementById(`estimation-uncertainty-${issueId}`).value) || 0;

  if (estimatedEffort && estimationUncertainty) {
      const totalEffort = estimatedEffort * estimationUncertainty;
      document.getElementById(`total-effort-${issueId}`).innerText = formatEffort(totalEffort);
  } else {
      document.getElementById(`total-effort-${issueId}`).innerText = 'N/A';
  }
}

// Helper function to format total effort in months, weeks, days, and hours
function formatEffort(totalHours) {
  let result = '';

  const months = Math.floor(totalHours / (8 * 5 * 4)); // 1 month = 160 hours
  const weeks = Math.floor((totalHours % (8 * 5 * 4)) / (8 * 5));
  const days = Math.floor((totalHours % (8 * 5)) / 8);
  const hours = totalHours % 8;

  if (months > 0) result += `${months} month(s) `;
  if (weeks > 0) result += `${weeks} week(s) `;
  if (days > 0) result += `${days} day(s) `;
  if (hours > 0) result += `${hours.toFixed(2)} hour(s)`;

  return result || 'N/A';
}

// Function to gather all form inputs and submit them in one request
async function submitAllEfforts() {
  const formData = [];

  // Loop through all issues and gather the estimated effort and uncertainty
  const issuesContainer = document.getElementById('issues-container');
  const issueElements = issuesContainer.getElementsByClassName('issue');

  Array.from(issueElements).forEach((issueElement) => {
     // Adjusted code to get the correct ticket ID
      const issueId = issueElement.querySelector('p').childNodes[1].nodeValue.trim(); // Use the text after the strong tag as issueId
      const estimatedEffort = issueElement.querySelector('input[name^="estimated-effort"]').value;
      const estimationUncertainty = issueElement.querySelector('input[name^="estimation-uncertainty"]').value;

      if (!estimatedEffort || !estimationUncertainty) {
          alert(`Please fill in both the estimated effort and uncertainty for the issue: ${issueId}`);
          return;
      }

      console.log(issueElement.querySelector('p strong').innerText);
      // Gather the data for each issue
      formData.push({
          issueId,  // Issue key or ID from Jira
          estimatedEffort: parseFloat(estimatedEffort),
          estimationUncertainty: parseFloat(estimationUncertainty)
      });
  });

  try {
      // POST all form data to the backend API
      const response = await axios.post('http://localhost:4000/api/submit-effort', { formData });

      if (response.status !== 200) {
          throw new Error('Failed to submit effort data');
      }

      alert(response.data.message);
  } catch (error) {
      console.error('Error submitting effort data:', error);
      alert('Error submitting effort data.');
  }
}

// Call the function to fetch and display Jira issues when the page loads
fetchJiraData();