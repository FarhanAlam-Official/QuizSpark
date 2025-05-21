# QuizSpark - Interactive Classroom Quiz Application

QuizSpark is a modern, interactive classroom quiz application built with Next.js 14, designed to enhance student engagement and streamline classroom management.

## 🌟 Features

- **Interactive Quiz Sessions**
  - Create and manage quizzes with different difficulty levels
  - Real-time quiz sessions with timer support
  - Topic-based question filtering
  - Instant feedback and scoring

- **Student Management**
  - Add and manage student profiles
  - Random student picker for class participation
  - Track individual student performance
  - Interactive leaderboard

- **Task Management**
  - Create and assign tasks to students
  - Track task completion status
  - Organize tasks by priority and due dates

- **Dashboard Analytics**
  - Overview of class statistics
  - Student performance metrics
  - Task completion tracking
  - Quick access to common actions

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- JSON Server (for backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/quizspark.git
   cd quizspark
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the JSON Server:
   ```bash
   npm install -g json-server
   ```

4. Start the development server:
   ```bash
   # Terminal 1: Start the Next.js app
   npm run dev

   # Terminal 2: Start the JSON Server
   npm run server
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Frontend:**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui Components
  - Lucide Icons

- **Backend:**
  - JSON Server
  - REST API

- **State Management:**
  - React Context API
  - Custom Hooks

## 📁 Project Structure

```
quizspark/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── quiz/             # Quiz functionality
│   ├── questions/        # Question management
│   ├── students/         # Student management
│   └── tasks/           # Task management
├── components/           # Reusable components
├── lib/                 # Utilities and helpers
│   ├── api/            # API functions
│   ├── context/        # Context providers
│   └── utils/          # Helper functions
└── public/             # Static assets
```

## 🎨 Customization

### Theme Configuration

The app uses a custom theme configuration that can be modified in:
- `app/globals.css` - Global styles
- `tailwind.config.ts` - Tailwind configuration
- `components.json` - Shadcn/ui configuration

### Adding New Features

1. Create new components in the `components` directory
2. Add new pages in the `app` directory
3. Update API functions in `lib/api`
4. Modify context providers as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/quizspark](https://github.com/yourusername/quizspark) 