const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { DateTime } = require('luxon');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const app = express();
const port = 4000;

const prisma = new PrismaClient();

// Enable CORS for all routes and methods
app.use(cors({
    origin: '*',  // Allow all origins temporarily for testing
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Enable bodyParser middleware to parse JSON bodies
app.use(bodyParser.json());

// Jira credentials
const jiraUsername = 'zina.ghannadan@verkstedt.com'; // Replace with your Jira username/email
const jiraApiToken = 'ATATT3xFfGF0GNO_t6MD5vxIfqIeAPGHkmpsWopFV3Cm-ye0sswbvyAoDu2jh8Auo0a4sc9bq60XIFFfef_7kgCFVtO-3Y_P0OmkLy6PEq9j58lfeoNX5LSU6EHd2zJ0SkJxuYMl_9-AJoWEzaTMAgHTlOIZ38smAFLEr46Bk-zU97PPZkKCBpg=10B2F7BF'; // Replace with your Jira API token

// Route to fetch Jira issues
app.get('/api/jira/issues', async (req, res) => {
    try {
        const response = await axios.get('https://verkstedt.atlassian.net/rest/agile/1.0/board/9/issue', {
            auth: {
                username: jiraUsername,
                password: jiraApiToken,
            },
            params: {
                jql: 'status = "Selected for Development"',
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Jira data:', error);
        res.status(500).json({ error: 'Error fetching Jira data' });
    }
});

// POST route to submit effort estimations
app.post('/api/submit-effort', async (req, res) => {
    const { formData } = req.body;  // formData is an array

    try {
        // Loop through the form data and insert each entry into the PostgreSQL table
        for (const item of formData) {
            const { issueId, estimatedEffort, estimationUncertainty } = item;

            // Calculate total effort (in hours)
            const totalEffort = calculateEffort(estimatedEffort, estimationUncertainty);
            
            const currentTimeInBerlin = DateTime.now().setZone('Europe/Berlin').toISO();

            // Insert data into PostgreSQL
            await prisma.effortEstimations.create({
                data: {
                    issue_id: issueId,
                    estimated_effort: estimatedEffort,
                    estimation_uncertainty: estimationUncertainty,
                    total_effort: totalEffort,  // Store the numeric value (hours)
                    created_at: currentTimeInBerlin
                },
            });
        }

        res.json({ message: 'Effort data submitted successfully and saved to database!' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).json({ error: 'Error saving form data to database.' });
    }
});

app.get('/api/unique-issue-ids', async (req, res) => {
    try {
        const uniqueIssueIds = await prisma.effortEstimations.findMany({
            select: {
                issue_id: true,
            },
            distinct: ['issue_id']
        });
        res.json(uniqueIssueIds);
    } catch (error) {
        console.error('Error fetching unique issue IDs:', error);
        res.status(500).json({ error: 'Error fetching unique issue IDs' });
    }
});

app.get('/api/issue-median', async (req, res) => {
    const { issueId, startDate, endDate } = req.query;

    try {
        // Fetch all matching rows for the issue within the date range
        const efforts = await prisma.effortEstimations.findMany({
            where: {
                issue_id: issueId,
                created_at: {
                    gte: new Date(`${startDate}T00:00:00`),
                    lte: new Date(`${endDate}T23:59:59`)
                }
            }
        });

        if (efforts.length === 0) {
            return res.status(404).json({ error: 'No data found for the given issue and date range.' });
        }

        // Extract estimated efforts and uncertainties
        const estimatedEfforts = efforts.map(effort => effort.estimated_effort);
        const uncertainties = efforts.map(effort => effort.estimation_uncertainty);

        // Calculate the median
        const medianEffort = calculateMedian(estimatedEfforts);
        const medianUncertainty = calculateMedian(uncertainties);
        const totalEffort = medianEffort * medianUncertainty;

        res.json({
            issueId,
            medianEffort,
            medianUncertainty,
            totalEffort
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to calculate the median
function calculateMedian(values) {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

// Start the server
app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});

// Calculate total effort based on estimation and uncertainty (in hours)
function calculateEffort(estimatedEffort, uncertainty) {
    const totalHours = estimatedEffort * uncertainty;  // Calculate total hours
    return totalHours;  // Return the total number of hours as a float
}
