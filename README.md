
# Ticket Estimation Tool

## Overview

This tool provides a platform for **anonymous ticket estimation**, allowing teams to submit their estimates without being influenced by each other. The tool is designed to enable faster estimations, avoiding groupthink, and allowing team members to provide unbiased estimates. Once all estimates are submitted, the **median estimate** is automatically calculated and can be discussed collectively in a meeting, promoting productive discussions around the most reasonable effort estimate for each Jira ticket.

The tool also provides functionality to calculate the median effort estimate from all submissions, allowing teams to make informed decisions about ticket prioritization and timelines. Additionally, users can select a specific time span to filter and retrieve estimation data from the database.

The project is designed to help teams estimate the effort and uncertainty for each Jira ticket, automatically calculating the estimated time based on the inputs provided.

## Features

- **Anonymous Estimations**: Users can submit their estimated effort and uncertainty for each ticket anonymously.
- **Effort Calculation**: The system automatically calculates the estimated time required for each ticket based on the submitted effort and uncertainty.
- **Median Calculation**: The system takes all submitted estimations for a ticket and calculates the median estimate.
- **Time Span Selection**: Users can filter the data by selecting a specific time period for retrieving estimation data.
- **Jira Integration**: The tool integrates with Jira, loading tickets from a specific column to read their title, ticket ID, and description.
- **PostgreSQL Backend**: The application uses a Docker-based PostgreSQL database to store the estimation data.
- **Prisma ORM**: Prisma is used to interact with the PostgreSQL database, allowing efficient data retrieval and manipulation.

## Database Schema

The estimation data is stored in the `EffortEstimations` table, with the following schema:

```prisma
model EffortEstimations {
  id                    Int      @id @default(autoincrement())
  issue_id              String
  estimated_effort      Float
  estimation_uncertainty Float
  total_effort          Float
  created_at            DateTime @default(now())
}
```

- `id`: A unique identifier for each estimation entry.
- `issue_id`: The ID of the Jira ticket being estimated.
- `estimated_effort`: The estimated effort required to complete the ticket (in hours, days, etc.).
- `estimation_uncertainty`: The uncertainty around the estimate, providing a range for better planning.
- `total_effort`: The total calculated effort for the ticket (considering effort and uncertainty).
- `created_at`: The timestamp when the estimation was submitted.

## Workflow

1. **Ticket Loading**: The project loads Jira tickets from a specific column, reading the ticket title, ticket ID, and description. This information is displayed to the users for estimation.
2. **Estimation Submission**: Users anonymously submit their estimated effort and uncertainty for a ticket using a form. These inputs are stored in a PostgreSQL database using Prisma.
3. **Effort Calculation**: Once both fields (effort and uncertainty) are entered, the system calculates the total effort required for the ticket.
4. **Median Calculation**: On a separate page, the tool retrieves all estimations for a given ticket from the database and calculates the median estimate based on all submissions.

## Technical Setup

### Requirements

- **Docker**: The project uses Docker to run a PostgreSQL database.
- **PostgreSQL**: The tool stores all estimations in a PostgreSQL database.
- **Prisma**: Prisma ORM is used for database interactions.
- **Node.js**: The project is built with Node.js and includes API endpoints for fetching and submitting data.

### Running the Project

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd TicketEstimation
   ```

2. **Set up the Environment**:
   Ensure you have a `.env` file in the root directory with the following environment variables:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@postgres-db:5432/<database-name>?schema=public
   PRISMA_LOG_LEVEL=query
   ```

3. **Run Docker Containers**:
   Start the PostgreSQL database using Docker:
   ```bash
   docker-compose -f .docker/docker-compose.yml up -d
   ```
   Rebuilding the docker-compose
   ```bash
   docker-compose -f .docker/docker-compose.yml build --no-cache
   ```
   Removing the docker-compose
   ```bash
   docker-compose -f .docker/docker-compose.yml down
   ```
   
5. **Install Dependencies**:
   Install the required dependencies:
   ```bash
   npm install
   ```

6. **Migrate the Database**:
   Apply Prisma migrations to set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

7. **Start the Application**:
   Run the application:
   ```bash
   npm run start
   ```
   Currently really dirty setup, running docker-compose creates container for backend and database and the frontend is running locally with live server :D
   So currently you don't need to run the npm command

### API Endpoints

- **Submit Estimation**: Allows users to submit their estimations for a ticket.
- **Get Median Estimate**: Retrieves the median estimation for a ticket from all submitted estimations.

### Calculating the Median

On the second page of the tool, users can view the median estimated time for a ticket. The system aggregates all estimates from the database, computes the median, and displays it.

## Conclusion

This tool provides an efficient and anonymous way to estimate the effort and uncertainty around Jira tickets, making it easier for teams to make more accurate project timelines. With built-in calculation for median estimates, it ensures that outliers do not skew the final projected effort.
