import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from 'next';
import { Sparkles, Rocket, Star, Zap, Award, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Register | QuizSpark',
  description: 'Create your QuizSpark account and start your learning journey',
};

export default async function RegisterPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">QuizSpark</h1>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h2>
            <p className="text-sm text-muted-foreground">
              Join thousands of educators and learners
            </p>
          </div>

          <RegisterForm />

          <p className="px-8 text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{' '}
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

      {/* Right Section - Content */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-gradient-to-bl from-primary/5 via-background to-background dark:from-primary/5 dark:via-primary/10 dark:to-primary/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/[0.07] to-transparent dark:from-primary/[0.15] backdrop-blur-3xl" />
        
        {/* Content Container */}
        <div className="relative h-full flex items-center justify-center p-8">
          <div className="max-w-2xl space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <h3 className="text-4xl font-bold bg-gradient-to-br from-foreground/90 to-foreground/60 dark:from-primary dark:to-primary-foreground bg-clip-text text-transparent">
                Begin Your Teaching Journey
              </h3>
              <p className="text-lg text-muted-foreground">
                Join our community of educators and make learning interactive and fun
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Feature Card 1 */}
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-background/40 p-6 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-background/60 transition-colors border border-border/40 shadow-sm">
                <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 blur-2xl" />
                <div className="relative space-y-2">
                  <Rocket className="h-8 w-8 text-primary" />
                  <h4 className="text-lg font-semibold">Quick Start</h4>
                  <p className="text-sm text-muted-foreground">
                    Create your first quiz in minutes with our intuitive tools
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-background/40 p-6 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-background/60 transition-colors border border-border/40 shadow-sm">
                <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 blur-2xl" />
                <div className="relative space-y-2">
                  <Star className="h-8 w-8 text-primary" />
                  <h4 className="text-lg font-semibold">Premium Features</h4>
                  <p className="text-sm text-muted-foreground">
                    Access advanced quiz types and customization options
                  </p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-background/40 p-6 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-background/60 transition-colors border border-border/40 shadow-sm">
                <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 blur-2xl" />
                <div className="relative space-y-2">
                  <Zap className="h-8 w-8 text-primary" />
                  <h4 className="text-lg font-semibold">Instant Feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    Get real-time insights on student performance
                  </p>
                </div>
              </div>

              {/* Feature Card 4 */}
              <div className="group relative overflow-hidden rounded-xl bg-white/40 dark:bg-background/40 p-6 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-background/60 transition-colors border border-border/40 shadow-sm">
                <div className="absolute -inset-4 bg-primary/5 dark:bg-primary/10 blur-2xl" />
                <div className="relative space-y-2">
                  <Award className="h-8 w-8 text-primary" />
                  <h4 className="text-lg font-semibold">Certifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Issue certificates upon quiz completion
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="space-y-4 bg-white/40 dark:bg-background/40 p-6 rounded-xl backdrop-blur-sm border border-border/40 shadow-sm">
              <h4 className="text-lg font-semibold">Why Choose QuizSpark?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span>Unlimited quiz creation with the free plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span>Advanced analytics and reporting tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span>Seamless integration with popular LMS platforms</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <span>24/7 customer support for all users</span>
                </li>
              </ul>
            </div>

            {/* CTA Section */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground/80">
                <span>Create your first quiz in minutes</span>
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
    </div>
  );
} 