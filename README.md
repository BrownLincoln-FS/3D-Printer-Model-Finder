# 3D Printer Model Finder

## Project Overview

3D Printer Model Finder is a full-stack web application built to demonstrate secure user authentication using OAuth.

**Core Features & Functionality:**

- Secure user login via OAuth.
- Protected routes that require authentication to view.
- PostgreSQL database integration to store user session/profile data.
- Full-stack implementation utilizing React/Next.js.

## Prerequisites

To run this project locally, you will need the following installed on your machine:

- **Node.js**: (e.g., v18.x or higher)
- **npm** or **yarn**: (e.g., npm v9.x)
- **PostgreSQL**: (Running locally on default port 5432)
- **Web Browser**: Chrome, Firefox, Safari, or Edge.

## Getting Started

Follow these instructions to get a local copy up and running.

1. **Clone the repository:**

    git clone https://github.com/BrownLincoln-FS/3D-Printer-Model-Finder.git

    cd model-finder

2. **Install NPM packages:**

    npm install

3. **Configure Environment Variables:**
   Create a file named `.env` in the root of the project.
   Add the required variables (see example below):

    DATABASE_URL="postgresql://user:password@localhost:5432/yourdbname"
    OAUTH_CLIENT_ID="your_client_id"
    OAUTH_CLIENT_SECRET="your_client_secret"

4. **Run the Development Server:**

    npm run dev

## Links

- **Local Build:** [http://localhost:3000](http://localhost:3000)
- **GitHub Repository:** [GitHub Repo](https://github.com/BrownLincoln-FS/3D-Printer-Model-Finder)
