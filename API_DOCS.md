# API Documentation

## POST `/api/analyze-pr`

# query parameter

`codeSnippet` if passed, will get the code snippet in response as well

Analyze a GitHub pull request for backend-specific issues using LLM.

### Request Body

```json
{
  "owner": "string", // GitHub repo owner
  "repo": "string", // GitHub repo name
  "prNumber": 123 // PR number
}
```

### Response

```json
{
  "analysisId": "uuid",
  "prNumber": 123,
  "repository": "owner/repo",
  "summary": {
    "totalIssues": 3,
    "criticalIssues": 1,
    "issueTypes": ["security", "performance"]
  },
  "issues": [
    {
      "severity": "critical",
      "category": "security",
      "file": "src/auth/auth.service.ts",
      "line": 25,
      "title": "Hardcoded API Key",
      "description": "API key is hardcoded in the source code",
      "recommendation": "Move API key to environment variables",
      "codeSnippet": "const apiKey = 'sk-1234567890abcdef';"
    }
  ]
}
```

### Error Responses

#### 400 - Validation Error

```json
{
  "error": "\"repo\" is required, \"prNumber\" is required"
}
```

#### 500 - Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "error message"
}
```

#### 401 - Unauthorized

```json
{
  "error": "Authorization token is required"
}
```

## GET `/api/analyze-pr`

Fetch all the PR's issues from database

### Response

```json
{
  "_id": "objectid",
  "analysisId": "uuid",
  "prNumber": 123,
  "repository": "owner/repo",
  "summary": {
    "totalIssues": 3,
    "criticalIssues": 1,
    "issueTypes": ["security", "performance"]
  },
  "issues": [
    {
      "_id": "objectid"
      "severity": "critical",
      "category": "security",
      "file": "src/auth/auth.service.ts",
      "line": 25,
      "title": "Hardcoded API Key",
      "description": "API key is hardcoded in the source code",
      "recommendation": "Move API key to environment variables",
      "codeSnippet": "const apiKey = 'sk-1234567890abcdef';"
    }
  ]
}
```

### Error Responses

#### 500 - Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "error message"
}
```
