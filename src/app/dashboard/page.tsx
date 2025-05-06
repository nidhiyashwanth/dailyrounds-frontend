"use client";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createTodo,
  deleteTodo,
  getTodos,
  getUsers,
  updateTodo,
} from "@/lib/api";
import { TodoForm } from "@/components/todo-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TodoDetails } from "@/components/todo-details";
import { useUser } from "@/lib/user-context";
import { Todo, User } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define a TodoWithId type that extends Todo
export interface TodoWithId extends Todo {}

export default function Page() {
  const { currentUser } = useUser();
  const [todos, setTodos] = useState<TodoWithId[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);
  const [viewingTodo, setViewingTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  // Fetch todos and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [todosResponse, usersResponse] = await Promise.all([
          getTodos(),
          getUsers(),
        ]);
        setTodos(todosResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle create/edit todo form submission
  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    // Refresh the todos list
    try {
      const response = await getTodos();
      setTodos(response.data);
      toast.success(
        currentTodo ? "Todo updated successfully" : "Todo created successfully"
      );
    } catch (error) {
      toast.error("Failed to refresh todos");
    }
  };

  // Handle opening the edit form
  const handleEdit = (todo: Todo) => {
    setCurrentTodo(todo);
    setIsFormOpen(true);
    // If we're viewing the todo, close the details dialog
    setViewingTodo(null);
  };

  // Handle viewing todo details
  const handleView = (todo: Todo) => {
    setViewingTodo(todo);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!todoToDelete) return;

    try {
      await deleteTodo(todoToDelete);
      // Remove from local state
      setTodos(todos.filter((todo) => todo._id !== todoToDelete));
      toast.success("Todo deleted successfully");
    } catch (error) {
      toast.error("Failed to delete todo");
      console.error(error);
    } finally {
      setTodoToDelete(null);
    }
  };

  // Start the delete process by showing confirmation
  const handleDelete = (todoId: string) => {
    setTodoToDelete(todoId);
    // If we're viewing the todo, close the details dialog
    setViewingTodo(null);
  };

  // Open the form for creating a new todo
  const handleCreateNew = () => {
    setCurrentTodo(null);
    setIsFormOpen(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8 border-b">
            <div>
              <h1 className="text-xl font-semibold">Tasks</h1>
              <p className="text-sm text-muted-foreground">
                Manage your tasks and track their progress
              </p>
            </div>
            <Button onClick={handleCreateNew} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>New Task</span>
            </Button>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            ) : (
              <DataTable
                data={todos}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Create/Edit Todo Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentTodo ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          <TodoForm
            todo={currentTodo || undefined}
            onSuccess={handleFormSuccess}
            users={users}
          />
        </DialogContent>
      </Dialog>

      {/* Todo Details Dialog */}
      <TodoDetails
        todo={viewingTodo}
        isOpen={!!viewingTodo}
        onClose={() => setViewingTodo(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!todoToDelete}
        onOpenChange={(open: boolean) => !open && setTodoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              todo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
