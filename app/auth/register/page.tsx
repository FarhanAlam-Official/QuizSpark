import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
} 