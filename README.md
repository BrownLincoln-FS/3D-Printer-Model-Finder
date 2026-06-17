# AudioStream

A modern, full-stack music streaming application that delivers a seamless and immersive listening experience. Built with a **Global Audio Shell** architecture, AudioStream enables users to search all of YouTube and stream audio (or video) through a persistent player, and generate AI-powered lyrics in real time.

---

## ✨ Features

### Global Audio Engine

- Persistent playback across the application.
- Audio continues uninterrupted while navigating between pages.
- Unified listening experience across Search, Library, and Home.

### Aurora Glass UI

A custom theme that I call Aurora Glass

- Modern glassmorphism-inspired design.
- Animated ambient backgrounds.
- Optimized for smooth performance and responsiveness.

### YouTube Integration

- Search the YouTube music catalog directly from the app.
- Stream audio using the YouTube IFrame API.
- Fast and reliable playback experience.

### AI Lyric Generation

- Generate lyrics in real time for any track.
- Synchronized lyric display during playback.

### Personal Library

- Save and organize favorite tracks.
- Persistent storage powered by PostgreSQL and Prisma ORM.

### Secure Authentication

- Google OAuth authentication.
- User session management with NextAuth.js.

---

## Tech Stack

| Category       | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router + Turbopack) |
| Language       | TypeScript                          |
| Styling        | Tailwind CSS v4                     |
| Database       | PostgreSQL                          |
| ORM            | Prisma                              |
| Authentication | NextAuth.js                         |
| Media Playback | YouTube IFrame API                  |

---

## Getting Started

Follow these instructions to get a local copy up and running.

1. **Clone the repository:**

    git clone https://github.com/BrownLincoln-FS/3D-Printer-Model-Finder.git

    cd model-finder

2. **Install NPM packages:**

    npm install

3. **Configure Environment Variables:**
   Create a file named `.env.local` in the root of the project.
   Add the required variables (see example below):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/audiostream"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_secret"

YOUTUBE_API_KEY="your_youtube_api_key"
```

### 4. Initialize the Database

```bash
npx prisma db push
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 📁 Project Structure

```text
AudioStream/
├── prisma/
│   └── schema.prisma          # Database schema and models
│
├── public/                    # Static assets
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth API routes
│   │   │   ├── env-check/     # Environment validation endpoint
│   │   │   └── youtube/       # YouTube integration endpoints
│   │   │
│   │   ├── search/
│   │   │   ├── page.tsx
│   │   │   └── SearchClient.tsx
│   │   │
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx         # Root application layout
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   └── favicon.ico
│   │
│   ├── components/
│   │   ├── AuthProvider.tsx
│   │   ├── GlobalPlayer.tsx   # Persistent audio player
│   │   ├── SignOutButton.tsx
│   │   └── ThemeToggle.tsx
│   │
│   ├── contexts/
│   │   └── PlayerContext.tsx  # Global playback state
│   │
│   └── lib/
│       └── prisma.ts          # Prisma client instance
│
├── .env.example               # Environment variable template
├── next.config.ts
├── prisma.config.ts
├── package.json
└── README.md
```

> Note: The exact structure may vary depending on the current project version.

---

## 🔗 Links

### Local Development

- http://localhost:3000

### Repository

- https://github.com/BrownLincoln-FS/AudioStream

---

```
Built with ❤️ using Next.js, TypeScript, PostgreSQL, Prisma, and Tailwind CSS.
```
