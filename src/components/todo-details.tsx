"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Todo, Priority, User } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { addTodoNote, getTodo, getTodoNotes } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash, Calendar, Tag } from "lucide-react";

interface TodoDetailsProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
}

export function TodoDetails({
  todo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TodoDetailsProps) {
  const { currentUser } = useUser();
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(todo);

  useEffect(() => {
    setCurrentTodo(todo);
  }, [todo]);

  // Refresh todo data to get latest notes
  const refreshTodoData = async () => {
    if (todo?._id) {
      try {
        const response = await getTodo(todo._id);
        setCurrentTodo(response.data);
      } catch (error) {
        console.error("Failed to refresh todo data", error);
      }
    }
  };

  if (!currentTodo) return null;

  const priorityColorMap = {
    [Priority.HIGH]:
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    [Priority.MEDIUM]:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    [Priority.LOW]:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  // Handler for adding a note
  const handleAddNote = async () => {
    if (!noteContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await addTodoNote(currentTodo._id, noteContent, currentUser._id);
      toast.success("Note added successfully");
      setNoteContent("");
      // Refresh notes immediately
      await refreshTodoData();
    } catch (error) {
      toast.error("Failed to add note");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Render user avatar with name
  const renderUser = (user: User | string) => {
    if (typeof user === "string") {
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              {user.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{user}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback>
            {user.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{user.name || user.username}</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{currentTodo.title}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(currentTodo.createdAt)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="details"
          className="flex-1 overflow-hidden flex flex-col"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes">
              Notes ({currentTodo.notes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 pr-4">
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 bg-muted/50 rounded-md">
                  {currentTodo.description}
                </p>
              </div>

              {currentTodo.tags && currentTodo.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Tag className="h-4 w-4" /> Tags
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {currentTodo.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-2">Created By</h3>
                <div className="p-2 rounded-md border">
                  {currentTodo.createdBy && renderUser(currentTodo.createdBy)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              {!currentTodo.notes || currentTodo.notes.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md text-center">
                  No notes yet. Add your first note below.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTodo.notes.map((note, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="p-3">
                        <p className="text-sm whitespace-pre-wrap mb-2">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground text-right">
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {currentUser && (
                <div className="pt-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleAddNote}
                      disabled={isSubmitting || !noteContent.trim()}
                      size="sm"
                    >
                      Add Note
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mentions" className="space-y-4">
              {!currentTodo.mentionedUsers ||
              currentTodo.mentionedUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md text-center">
                  No mentions. Use @username in the description to mention
                  users.
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Filter out duplicate users by ID before rendering */}
                  {Array.from(
                    new Set(
                      currentTodo.mentionedUsers.map((user) =>
                        typeof user === "string" ? user : user._id
                      )
                    )
                  ).map((userId, index) => {
                    const user =
                      typeof currentTodo.mentionedUsers[0] === "string"
                        ? currentTodo.mentionedUsers.find((u) =>
                            typeof u === "string"
                              ? u === userId
                              : u._id === userId
                          )
                        : currentTodo.mentionedUsers.find((u) =>
                            typeof u === "string"
                              ? u === userId
                              : u._id === userId
                          );

                    return user ? (
                      <div
                        key={index}
                        className="p-2 rounded-md border flex items-center"
                      >
                        {renderUser(user)}
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex justify-between items-center mt-4 border-t pt-4">
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => onDelete(currentTodo._id)}
          >
            <Trash className="h-4 w-4" />
            <span>Delete</span>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => onEdit(currentTodo)}
            >
              <Pencil className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
