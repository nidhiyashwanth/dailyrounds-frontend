"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Priority, Todo, User } from "@/lib/types";
import { createTodo, updateTodo } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const todoSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters" }),
  priority: z.nativeEnum(Priority),
  tags: z.array(z.string()),
  tagInput: z.string().optional(),
  mentionedUsers: z.array(z.string()),
});

type TodoFormValues = z.infer<typeof todoSchema>;

interface TodoFormProps {
  todo?: Todo;
  onSuccess?: () => void;
  users: User[];
}

export function TodoForm({ todo, onSuccess, users }: TodoFormProps) {
  const { currentUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(todo?.tags || []);
  const [mentionedUsers, setMentionedUsers] = useState<string[]>(
    todo?.mentionedUsers.map((user) =>
      typeof user === "string" ? user : user._id
    ) || []
  );

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo?.title || "",
      description: todo?.description || "",
      priority: todo?.priority || Priority.MEDIUM,
      tags: todo?.tags || [],
      tagInput: "",
      mentionedUsers:
        todo?.mentionedUsers.map((user) =>
          typeof user === "string" ? user : user._id
        ) || [],
    },
  });

  // Handle adding tags
  const addTag = (tag: string) => {
    if (!tag || tags.includes(tag)) return;
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag.length > 0) {
      setTags([...tags, cleanTag]);
      form.setValue("tags", [...tags, cleanTag]);
      form.setValue("tagInput", "");
    }
  };

  // Handle removing tags
  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue("tags", updatedTags);
  };

  // Handle tag input key press (Enter to add a tag)
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && form.getValues("tagInput")) {
      e.preventDefault();
      addTag(form.getValues("tagInput") || "");
    }
  };

  // Handle form submission
  const onSubmit = async (values: TodoFormValues) => {
    if (!currentUser) {
      toast.error("You must be logged in to create a todo");
      return;
    }

    setIsSubmitting(true);
    try {
      const todoData = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        tags: values.tags,
        mentionedUsers: values.mentionedUsers,
        createdBy: currentUser._id,
      };

      if (todo?._id) {
        // Update existing todo
        await updateTodo(todo._id, todoData);
        toast.success("Todo updated successfully");
      } else {
        // Create new todo
        await createTodo(todoData);
        toast.success("Todo created successfully");
      }

      // Reset form after successful submission
      if (!todo) {
        form.reset({
          title: "",
          description: "",
          priority: Priority.MEDIUM,
          tags: [],
          tagInput: "",
          mentionedUsers: [],
        });
        setTags([]);
        setMentionedUsers([]);
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(todo ? "Failed to update todo" : "Failed to create todo");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract @mentions from description
  useEffect(() => {
    const description = form.watch("description");
    if (description) {
      const matches = description.match(/@(\w+)/g) || [];
      const mentions = matches.map((match) => match.substring(1));

      // Check if mentioned users exist in the users list
      const validMentions = mentions
        .map((mention) => {
          const user = users.find((u) => u.username === mention);
          return user ? user._id : null;
        })
        .filter(Boolean) as string[];

      if (validMentions.length > 0) {
        setMentionedUsers(validMentions);
        form.setValue("mentionedUsers", validMentions);
      }
    }
  }, [form.watch("description"), users, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Task description (use @username to mention users)"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>Use @username to mention users</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Priority.HIGH}>High</SelectItem>
                    <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={Priority.LOW}>Low</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    placeholder="Add tags (press Enter to add)"
                    {...field}
                    onKeyDown={handleTagKeyPress}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormDescription>Add relevant tags to your task</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {mentionedUsers.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Mentioned Users</h3>
            <div className="flex flex-wrap gap-2">
              {mentionedUsers.map((userId) => {
                const user = users.find((u) => u._id === userId);
                return (
                  <Badge key={userId} variant="outline">
                    @{user?.username || "unknown"}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : todo ? "Update Todo" : "Create Todo"}
        </Button>
      </form>
    </Form>
  );
}
