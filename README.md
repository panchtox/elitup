# Article Management System

This is a web application for managing and reporting on medical articles using Flask and SQLite.

## API Documentation

The following API endpoints are available for external integrations:

### Get Articles

- **URL**: `/api/articles`
- **Method**: `GET`
- **Query Parameters**:
  - `search`: Search query for articles
  - `owner`: Filter by owner
  - `pais`: Filter by country
  - `producto`: Filter by product
  - `status`: Filter by status
  - `start_date`: Filter by start date (YYYY-MM-DD)
  - `end_date`: Filter by end date (YYYY-MM-DD)
- **Response**: JSON array of articles

### Get Single Article

- **URL**: `/api/articles/<article_id>`
- **Method**: `GET`
- **Response**: JSON object with article details

### Classify Article

- **URL**: `/api/articles/<article_id>/classify`
- **Method**: `POST`
- **Request Body**: JSON object with `status` field (possible values: "No relevante", "Relevante", "Reportable")
- **Response**: JSON object with success status and updated article status

### Generate Report

- **URL**: `/api/report`
- **Method**: `POST`
- **Request Body**: JSON object with the following fields:
  - `start_date`: Start date for the report (YYYY-MM-DD)
  - `end_date`: End date for the report (YYYY-MM-DD)
  - `owner`: Owner filter
  - `pais`: Country filter
  - `productos`: Array of products or "All"
- **Response**: JSON object with report generation status and file name

### Batch Add Articles

- **URL**: `/api/batch/articles`
- **Method**: `POST`
- **Request Body**: JSON object with an `articles` array containing article objects
- **Response**: JSON object with success message or error details

### Batch Add Evidence

- **URL**: `/api/batch/evidence`
- **Method**: `POST`
- **Request Body**: JSON object with an `evidence` array containing evidence objects
- **Response**: JSON object with success message or error details

## Running the Application

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the Flask application:
   ```
   python main.py
   ```

3. Access the web interface at `http://localhost:5000`

4. Use the API endpoints for external integrations

