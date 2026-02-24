# JLabs - IP Geolocation Web App

A full-stack web application with user authentication and IP geolocation lookup. Built with Node.js/Express backend and React frontend.

## Tech Stack

- **Backend:** Node.js, Express, SQLite (better-sqlite3), JWT (jsonwebtoken), bcryptjs
- **Frontend:** React (Vite), React Router, Axios, Leaflet (react-leaflet)
- **API:** ipinfo.io for IP geolocation data

## Features

- User authentication with JWT tokens
- IP geolocation lookup with detailed info display
- Interactive map with location pin (Leaflet)
- IP search with IPv4 validation
- Search history with click-to-view, multi-select delete
- Persistent search history (localStorage)
- Auth guard (redirect to login/home based on auth state)

## Prerequisites

- Node.js (v18 or higher)
- npm

## Setup Instructions

### API Setup

```bash
cd api
npm install
npm run seed    # Seeds test users into the database
npm start       # Starts API server on http://localhost:8000
```

### Web Setup (in a separate terminal)

```bash
cd web
npm install
npm run dev     # Starts dev server on http://localhost:5173
```

## Test Credentials

| Email               | Password    |
| ------------------- | ----------- |
| admin@example.com   | password123 |
| test@example.com    | password123 |

## API Endpoints

- `POST /api/login` - Authenticate user, returns JWT token

## Project Structure

```
jlabs/
├── api/                  # Backend API
│   ├── src/
│   │   ├── db.js         # SQLite database setup
│   │   ├── seed.js       # User seeder
│   │   └── server.js     # Express server & login endpoint
│   └── package.json
├── web/                  # Frontend React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx # Login screen
│   │   │   └── Home.jsx  # Home screen with geolocation & map
│   │   ├── App.jsx       # Routing & auth guard
│   │   └── main.jsx      # Entry point
│   └── package.json
└── README.md
```
