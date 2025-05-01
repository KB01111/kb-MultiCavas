// src/components/features/teams/TeamCreateForm.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createTeam } from "@/lib/services/teamService";
import { TeamCreate, TeamResponse } from "@/app/types";
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional().nullable(),
});

interface TeamCreateFormProps {
  onTeamCreated?: (newTeam: TeamResponse) => void; // Optional callback
}

export function TeamCreateForm({ onTeamCreated }: TeamCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const teamData: TeamCreate = {
        name: values.name,
        description: values.description || null,
      };
      const newTeam = await createTeam(teamData);
      toast({
        title: "Team Created",
        description: `Team "${newTeam.name}" has been successfully created.`,
      });
      form.reset(); // Reset form after successful submission
      if (onTeamCreated) {
        onTeamCreated(newTeam); // Call the callback if provided
      }
    } catch (error) {
      console.error("Failed to create team:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Team",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Marketing Agents" {...field} />
              </FormControl>
              <FormDescription>A unique name for your agent team.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose of this team..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""} // Handle null value for textarea
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
          {isSubmitting ? "Creating..." : "Create Team"}
        </Button>
      </form>
    </Form>
  );
}

