# Node.js PR Analyzer

An Express + TypeScript backend that analyzes GitHub pull requests for Node.js/React.js projects using OpenAI to detect security, performance, and code quality issues.

## Features

- Analyze PR diffs from GitHub
- Use OpenAI LLMs to identify issues
- Store results in MongoDB
- Optional: Post results as comments on the PR
- OpenAPI documentation
- Dockerized setup

## Technologies Used

- Node.js + Express + TypeScript
- MongoDB
- groq API
- GitHub API (Octokit)
- JOI, Swagger, Docker

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- GitHub Personal Access Token

### Environment Setup

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017
OPENAI_API_KEY=your_openai_key
```

### Run Locally

```bash
npm install # to install the libraries
npm run build # to create the dist folder that contains js files of .ts files
npm start # run the application (execute app.ts)
npm run format # used to format the code using prettier
npm run lint # used to format the code and check for the limt issues
npm run start:prod # used to execute the converted js files code
npm run test # used to execute the unit test cases
```

### Run with Docker

```bash
docker-compose up --build
```

## Example Request

```json
{
  "owner": "your-github-username",
  "repo": "your-repository",
  "prNumber": 1
}
```
