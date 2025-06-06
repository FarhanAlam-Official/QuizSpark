import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';
import { Sparkles, Brain, Target, Users, Trophy, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login | QuizSpark',
  description: 'Login to your QuizSpark account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Content */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background dark:from-primary/5 dark:via-primary/10 dark:to-primary/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] to-transparent dark:from-primary/[0.15] backdrop-blur-3xl" />
        
        {/* Content Container */}
        <div className="relative h-full flex items-center justify-center p-8">
          <div className="max-w-2xl space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <h3 className="text-4xl font-bold bg-gradient-to-br from-foreground/90 to-foreground/60 dark:from-primary dark:to-primary-foreground bg-clip-text text-transparent">
                Elevate Your Learning Experience
              </h3>
              <p className="text-lg text-muted-foreground">
                Create engaging quizzes, track progress, and inspire learning with QuizSpark
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Feature Card 1 */}
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-background/40 p-6 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-background/60 transition-colors border border-border/40 shadow-sm">
                <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 blur-2xl" />
                <div className="relative space-y-2">
                  <Brain className="h-8 w-8 text-primary" />
                  <h4 className="text-lg font-semibold">Smart Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Get detailed insights into quiz performance and learning patterns
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-background/40 p-6 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-background/60 transition-colors border border-border/40 shadow-sm">
                <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 blur-2xl" />
                <div className="relative space-y-2">
                  <Target className="h-8 w-8 text-primary" />
                  <h4 className="text-lg font-semibold">Adaptive Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Personalized quiz difficulty based on user performance
                  </p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-background/40 p-6 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-background/60 transition-colors border border-border/40 shadow-sm">
                <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 blur-2xl" />
                <div className="relative space-y-2">
                  <Users className="h-8 w-8 text-primary" />
                  <h4 className="text-lg font-semibold">Collaborative Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Share quizzes and compete with friends in real-time
                  </p>
                </div>
              </div>

              {/* Feature Card 4 */}
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-background/40 p-6 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-background/60 transition-colors border border-border/40 shadow-sm">
                <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 blur-2xl" />
                <div className="relative space-y-2">
                  <Trophy className="h-8 w-8 text-primary" />
                  <h4 className="text-lg font-semibold">Achievements</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn badges and track your learning milestones
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100K+</div>
                <div className="text-sm text-muted-foreground">Quizzes Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1M+</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground/80">
                <span>Start your learning journey today</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-10 dark:opacity-20">
          <div className="aspect-square h-96 rounded-full bg-primary" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-10 dark:opacity-20">
          <div className="aspect-square h-96 rounded-full bg-primary" />
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">QuizSpark</h1>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <LoginForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
} 