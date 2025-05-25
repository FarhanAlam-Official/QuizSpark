"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-secondary p-6">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{user.email}</h3>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Email</h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Role</h4>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Account ID</h4>
              <p className="text-sm font-mono text-muted-foreground">{user.id}</p>
            </div>
          </div>

          <Button 
            variant="destructive" 
            className="w-full sm:w-auto"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 