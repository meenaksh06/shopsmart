# ShopSmart

A production-grade, full-stack e-commerce application equipped with a React frontend, Node.js + Express backend, SQLite database (managed by Prisma ORM), and comprehensive automated testing.

## Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React, React Router, Context API, Vite, Axios |
| **Backend** | Node.js, Express, Prisma ORM, JSON Web Tokens (JWT), bcryptjs |
| **Database** | SQLite |
| **Testing** | Vitest, Testing Library (Frontend), Jest, Supertest (Backend), Playwright (E2E) |
| **DevOps** | GitHub Actions, PM2, Dependabot |

## Architecture

```mermaid
graph TD
    Client[Browser / React App] -->|REST API / JSON| Server[Node.js + Express]
    Server -->|Prisma Client| DB[(SQLite Database)]
    
    subgraph Frontend [React Frontend]
      Router[React Router]
      AuthContext[Auth Context]
      CartContext[Cart Context]
      Pages[Pages & Components]
      API[Axios Interceptors]
      
      Router --> Pages
      Pages --> AuthContext
      Pages --> CartContext
      AuthContext --> API
      CartContext --> API
    end
    
    subgraph Backend [Node.js Backend]
      Routes[Express Routes]
      Middleware[Auth & Validation]
      Controllers[Controllers / Logic]
      
      Routes --> Middleware
      Middleware --> Controllers
    end

    API -->|HTTP| Routes
    Controllers -->|SQL via ORM| DB
```

## Features
- **User Authentication**: Secure JWT-based login and registration with bcrypt password hashing
- **Product Catalog**: Browse products with search, category filtering, and sorting
- **Shopping Cart**: Add, update, and remove items with real-time stock validations
- **Order Management**: Checkout process and comprehensive order history viewing
- **Responsive UI**: Modern, accessible, mobile-first design system with dark mode support

## Getting Started Locally

### Prerequisites
- Node.js (v18+)

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### 2. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` to view the application.

## CI/CD Pipeline

The project utilizes **GitHub Actions** for robust continuous integration and automated deployments.

- **CI (`ci.yml`)**: Triggered on `push` and `pull_request` to the main branch. It checks out the code, installs dependencies for both client and server, runs ESLint formatters, spins up the database, and executes all unit and integration tests (Jest & Vitest). The pipeline fails if any lint rules or tests are violated, ensuring codebase health.
- **CD (`deploy.yml`)**: Triggered on `push` to the main branch. Uses SSH to securely connect to an AWS EC2 instance, pulls the latest code, installs production dependencies, applies database migrations, builds the React frontend, and seamlessly restarts the application using PM2 without downtime.

## Deployment Steps (AWS EC2)

1. **Provision EC2**: Launch an Ubuntu instance on AWS, opening ports `80`, `443`, and `5001`.
2. **Install Environments**: SSH in and install Node 20+, PM2, and git.
3. **Setup Repository**: Clone this repository into `/app/shopsmart`.
4. **Environment Variables**: Create the `.env` file inside `/app/shopsmart/server`.
5. **Start PM2**: Run `pm2 start ecosystem.config.js` to begin serving the Node API and serving the React static build via the `serve` module.
6. **Configure GitHub Secrets**: Add `EC2_HOST`, `EC2_USERNAME`, and `EC2_SSH_KEY` to the repository secrets for automated actions.

## Challenges & Solutions

**Challenge**: Keeping the cart state instantly synchronized for the user while preventing race conditions when checking out (e.g. buying an item that just went out of stock).
**Solution**: Leveraged React Context for optimistic UI updates coupled with Prisma `$transaction` operations on the backend. The backend validates real-time stock levels right before a transaction commits, safely rolling back and returning a descriptive 400 error message if stock is insufficient.

**Challenge**: Implementing secure auth across distinct frontend and backend servers.
**Solution**: Designed a robust Axios API client using interceptors to automatically attach the stored JWT to the headers of outbound requests. Added a global 401 response interceptor to instantly securely clear local storage and redirect to the login page whenever a token expires or is deemed invalid.
