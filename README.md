# QuizSpark - Interactive Classroom Quiz Application

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Overview

QuizSpark is a modern, interactive classroom quiz application built with Next.js 14, designed to enhance student engagement and streamline classroom management. Perfect for educators looking to create an interactive and engaging learning environment.

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

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
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
- **Styling:** Tailwind CSS
- **Components:** Shadcn/ui
- **Icons:** Lucide Icons

### Backend
- **API:** JSON Server
- **Database:** JSON File System
- **Authentication:** NextAuth.js

### Development Tools
- **State Management:** React Context API
- **Code Quality:** ESLint, Prettier
- **Version Control:** Git
- **Package Manager:** npm

## 📁 Project Structure

```
quizspark/
├── app/                    # Next.js app directory
│   ├── (auth)/           # Authentication routes
│   ├── dashboard/        # Dashboard pages
│   ├── quiz/            # Quiz management
│   ├── students/        # Student management
│   └── tasks/          # Task management
├── components/          # Reusable components
│   ├── ui/            # UI components
│   ├── forms/         # Form components
│   └── layouts/       # Layout components
├── lib/                # Utilities and helpers
│   ├── api/           # API functions
│   ├── hooks/         # Custom hooks
│   └── utils/         # Helper functions
├── public/            # Static assets
└── types/             # TypeScript definitions
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### Tailwind Configuration

Customize the theme in `tailwind.config.ts`:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      }
    }
  }
}
```

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

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

## 📧 Contact

Farhan Alam - [@thefarhanalam](https://github.com/thefarhanalam-official)

Project Link: [https://github.com/thefarhanalam-official/quizspark](https://github.com/thefarhanalam-official/quizspark)

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- All our contributors and supporters 