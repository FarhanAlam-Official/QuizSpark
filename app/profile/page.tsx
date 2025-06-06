"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail, Shield, Calendar, Hash, Activity } from "lucide-react";
import { format } from "date-fns";

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
          <CardDescription>Your account information and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name || user.email} 
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="rounded-full bg-secondary p-6">
                <User className="h-8 w-8" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium">{user.name || user.email}</h3>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
              {user.bio && (
                <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4" />
                <h4 className="font-medium">Email</h4>
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.is_email_verified && (
                <span className="text-xs text-green-500">Verified</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Shield className="mr-2 h-4 w-4" />
                <h4 className="font-medium">Role</h4>
              </div>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4" />
                <h4 className="font-medium">Member Since</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(user.created_at), 'PPP')}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Activity className="mr-2 h-4 w-4" />
                <h4 className="font-medium">Last Active</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {user.last_login_at ? format(new Date(user.last_login_at), 'PPP') : 'Never'}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Logins: {user.login_count}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Hash className="mr-2 h-4 w-4" />
                <h4 className="font-medium">Account ID</h4>
              </div>
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