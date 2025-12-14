# E-Commerce Frontend

Modern React.js e-commerce application built with Material-UI.

## Features

- User authentication (register, login, refresh token)
- Product browsing and search
- Shopping cart management
- Order management
- User profile and addresses
- Favorites/wishlist
- Newsletter subscription

## Tech Stack

- React 18
- Material-UI (MUI)
- React Router v6
- Axios for API calls
- Context API for state management

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure your API URL:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API services
├── utils/          # Utility functions
├── theme/          # MUI theme configuration
└── App.js          # Root component
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## API Configuration

The API base URL can be configured in the `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:8001
REACT_APP_API_VERSION=v1
```
