"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { addTodoNote, getTodoNotes } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import { toast } from "sonner";

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

  if (!todo) return null;

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
      await addTodoNote(todo._id, noteContent, currentUser._id);
      toast.success("Note added successfully");
      setNoteContent("");
      // Refresh notes by re-opening the dialog or refreshing data
    } catch (error) {
      toast.error("Failed to add note");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
          <DialogTitle className="text-xl">{todo.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`px-2 py-1 ${priorityColorMap[todo.priority]}`}
            >
              {todo.priority}
            </Badge>
            <span className="text-sm">
              Created: {formatDate(todo.createdAt)}
            </span>
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
              Notes ({todo.notes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="mentions">
              Mentions ({todo.mentionedUsers?.length || 0})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-2">
            <TabsContent value="details" className="space-y-4 p-1">
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {todo.description}
                </p>
              </div>

              {todo.tags && todo.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {todo.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-2">Created By</h3>
                {todo.createdBy && renderUser(todo.createdBy)}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4 p-1">
              {!todo.notes || todo.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {todo.notes.map((note, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="py-3 px-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {note.createdBy && renderUser(note.createdBy)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3 px-4">
                        <p className="text-sm whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </CardContent>
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

            <TabsContent value="mentions" className="p-1">
              {!todo.mentionedUsers || todo.mentionedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No mentions.</p>
              ) : (
                <div className="space-y-2">
                  {todo.mentionedUsers.map((user, index) => (
                    <div key={index} className="p-2 rounded-md border">
                      {renderUser(user)}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex justify-between items-center mt-4">
          <Button variant="destructive" onClick={() => onDelete(todo._id)}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onEdit(todo)}>Edit</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
