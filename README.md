# QuizSpark - Interactive Classroom Quiz Application

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/thefarhanalam-official/quizspark/graphs/commit-activity)

<p align="center">
  <img src="public/demo.gif" alt="QuizSpark Demo" width="600">
</p>

## 📋 Overview

QuizSpark is a modern, interactive classroom quiz application built with Next.js 14, designed to enhance student engagement and streamline classroom management. Perfect for educators looking to create an interactive and engaging learning environment.

[View Demo](https://quizspark.vercel.app) | [Report Bug](https://github.com/thefarhanalam-official/quizspark/issues) | [Request Feature](https://github.com/thefarhanalam-official/quizspark/issues)

## 🌟 Features

### Quiz Management
- **Interactive Quiz Creation**
  - Intuitive interface for creating quizzes
  - Support for multiple question types (MCQ, True/False, Short Answer)
  - Custom timer settings for each quiz
  - Question bank with categorization
  - Import/Export quiz functionality

### Student Experience
- **Real-time Interaction**
  - Live quiz participation
  - Instant feedback on answers
  - Progress tracking
  - Personal performance analytics
  - Mobile-responsive interface

### Classroom Management
- **Comprehensive Tools**
  - Student profile management
  - Random student selector
  - Advanced analytics dashboard
  - Task assignment and tracking
  - Custom class creation

### Analytics & Reporting
- **Detailed Insights**
  - Individual student performance metrics
  - Class-wide statistics
  - Progress tracking over time
  - Exportable reports
  - Performance trend analysis

## 💻 System Requirements

- **Node.js:** 18.x or later
- **Memory:** 4 GB RAM minimum, 8 GB RAM recommended
- **Storage:** 1 GB of available space
- **OS:** Windows 10+, macOS 10.15+, or Linux

## 🌐 Browser Compatibility

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or later
- npm 8.x or later
- Git

```bash
# Check Node.js version
node --version  # Should be 18.x or later

# Check npm version
npm --version   # Should be 8.x or later
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/thefarhanalam-official/quizspark.git
   cd quizspark
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create and set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Required environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=your-database-url
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

4. Start the development environment:
   ```bash
   # Start the Next.js development server
   npm run dev

   # In a new terminal, start the JSON Server
   npm run server
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** 
  - Tailwind CSS
  - CSS Modules
  - Shadcn/ui Components
- **Components:** 
  - Custom React Components
  - Lucide Icons
  - Sound Effects Integration

### Backend & Data
- **API:** JSON Server (lightweight REST API)
- **Database:** JSON File System (`db.json`)
- **Data Management:** 
  - Bulk Import/Export
  - Real-time Updates
  - Custom Routes

### Development Tools
- **Package Manager:** npm/pnpm
- **Build Tools:**
  - PostCSS
  - TypeScript Configuration
- **Code Quality:** 
  - ESLint
  - Prettier
  - TypeScript strict mode
- **Version Control:** Git

## 📁 Project Structure

```
quizspark/
├── app/                      # Next.js app directory
│   ├── dashboard/           # Dashboard pages
│   ├── quiz/               # Quiz management
│   ├── questions/         # Question management
│   ├── students/         # Student management
│   ├── tasks/           # Task management
│   ├── leaderboard/    # Leaderboard features
│   ├── test/          # Testing components
│   ├── globals.css   # Global styles
│   ├── layout.tsx   # Root layout
│   └── page.tsx    # Home page
├── components/    # Reusable components
│   ├── ui/      # Shadcn UI components
│   ├── header.tsx        # Navigation header
│   ├── footer.tsx        # Footer component
│   ├── question-card.tsx # Question component
│   ├── sound-effects.tsx # Audio features
│   ├── visual-student-picker.tsx # Student selector
│   ├── bulk-import-questions.tsx # Import feature
│   ├── bulk-import-students.tsx  # Import feature
│   ├── theme-provider.tsx   # Theme context
│   ├── theme-toggle.tsx     # Theme switcher
│   ├── mode-toggle.tsx      # Mode switcher
│   └── providers.tsx        # Context providers
├── lib/                    # Utilities
├── hooks/                 # Custom React hooks
├── styles/               # Additional styles
├── public/              # Static assets
├── db.json             # Database file
└── config files       # Configuration files
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── tsconfig.json
    └── components.json
```

## ⚙️ Features & Components

### Core Features
1. **Interactive Quiz System**
   - Question Card Component
   - Real-time Scoring
   - Multiple Question Types
   - Sound Effects

2. **Student Management**
   - Visual Student Picker
   - Bulk Import/Export
   - Performance Tracking
   - Leaderboard System

3. **Theme & UI**
   - Dark/Light Mode Toggle
   - Responsive Design
   - Customizable UI Components
   - Animated Transitions

### Database Structure

The `db.json` file contains the following collections:
```json
{
  "students": [
    {
      "id": "string",
      "name": "string",
      "score": "number",
      "participation": "number"
    }
  ],
  "questions": [
    {
      "id": "string",
      "type": "string",
      "question": "string",
      "options": "array",
      "correct": "string|array"
    }
  ],
  "quizzes": [
    {
      "id": "string",
      "title": "string",
      "questions": "array",
      "status": "string"
    }
  ]
}
```

### API Routes

```typescript
// Student Routes
GET    /api/students          // List all students
POST   /api/students/import   // Bulk import students
GET    /api/students/:id      // Get student details

// Question Routes
GET    /api/questions         // List all questions
POST   /api/questions/import  // Bulk import questions
PUT    /api/questions/:id     // Update question

// Quiz Routes
GET    /api/quizzes          // List all quizzes
POST   /api/quizzes          // Create new quiz
PUT    /api/quizzes/:id      // Update quiz status
```

## ⚙️ Configuration

### Database Setup

1. Create a `data` directory in your project root:
   ```bash
   mkdir data
   ```

2. Create a `db.json` file in the `data` directory with the initial schema:
   ```json
   {
     "users": [],
     "quizzes": [],
     "questions": [],
     "submissions": [],
     "students": []
   }
   ```

3. (Optional) Create a `routes.json` for custom API routes:
   ```json
   {
     "/api/*": "/$1",
     "/quizzes/:id": "/quizzes/:id?_embed=questions",
     "/students/:id": "/students/:id?_embed=submissions"
   }
   ```

4. Update your package.json scripts to include the JSON server:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "server": "json-server --watch data/db.json --port 3001 --routes data/routes.json",
       "dev:all": "concurrently \"npm run dev\" \"npm run server\""
     }
   }
   ```

### Environment Variables

Create a `.env.local` file with the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your-database-url
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### API Endpoints

The JSON Server provides the following REST endpoints:

```
GET    /users              # List all users
GET    /users/:id          # Get a single user
POST   /users              # Create a user
PUT    /users/:id          # Update a user
DELETE /users/:id          # Delete a user

GET    /quizzes           # List all quizzes
GET    /quizzes/:id       # Get a quiz with its questions
POST   /quizzes           # Create a quiz
PUT    /quizzes/:id       # Update a quiz
DELETE /quizzes/:id       # Delete a quiz

# Similar endpoints for questions, submissions, and students
```

### Database Relationships

JSON Server supports relationships through the following conventions:
- To include related resources: `GET /quizzes/1?_embed=questions`
- To include parent resource: `GET /questions/1?_expand=quiz`
- To filter resources: `GET /questions?quizId=1`

## 🔧 Development

### Code Style

We use ESLint and Prettier for code formatting. Run:
```bash
# Lint check
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

Don't forget to give the project a star! Thanks again!

## 📧 Contact

Farhan Alam
- GitHub: [@thefarhanalam](https://github.com/thefarhanalam-official)
- LinkedIn: [Farhan Alam](https://linkedin.com/in/thefarhanalam)
- Email: contact@farhanalam.dev

Project Link: [https://github.com/thefarhanalam-official/quizspark](https://github.com/thefarhanalam-official/quizspark)

## 📸 Screenshots

<p align="center">
  <img src="public/screenshot1.png" alt="Dashboard" width="400">
  <img src="public/screenshot2.png" alt="Quiz Interface" width="400">
</p>

## 🗺️ Roadmap

- [x] Basic quiz functionality
- [x] Student management
- [x] Real-time quiz sessions
- [ ] Multiple language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app version
- [ ] AI-powered question generation

See the [open issues](https://github.com/thefarhanalam-official/quizspark/issues) for a full list of proposed features and known issues.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Vercel](https://vercel.com) for hosting
- All our contributors and supporters 