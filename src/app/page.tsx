"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import { useUser } from "@/lib/user-context";

export default function Home() {
  const router = useRouter();
  const { currentUser, loading } = useUser();

  useEffect(() => {
    // If user is already selected, redirect to dashboard
    if (currentUser && !loading) {
      router.push("/dashboard");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // If no user is selected, show a simple landing page
  if (!currentUser) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="mb-6 text-3xl font-bold">Welcome to Todo App</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Please select a user to get started with managing your tasks.
        </p>
        <Link href="/login">
          <Button size="lg">Select User</Button>
        </Link>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader
          title="Todo Dashboard"
          subtitle="Welcome to your Todo Dashboard"
        />
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  View and manage your tasks
                </div>
                <p className="text-xs text-muted-foreground">
                  All your tasks in one place
                </p>
                <div className="mt-4">
                  <Link href="/dashboard">
                    <Button>Go to Tasks</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Create New Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Add a new task</div>
                <p className="text-xs text-muted-foreground">
                  Create a new todo item with tags and priority
                </p>
                <div className="mt-4">
                  <Link href="/todos/new">
                    <Button>Create Task</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Switch User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Change account</div>
                <p className="text-xs text-muted-foreground">
                  Select a different user to view their tasks
                </p>
                <div className="mt-4">
                  <Link href="/login">
                    <Button variant="outline">Switch User</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
