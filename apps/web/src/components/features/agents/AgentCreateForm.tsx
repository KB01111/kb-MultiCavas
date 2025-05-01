// src/components/features/agents/AgentCreateForm.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createAgent } from "@/lib/services/agentService";
import { AgentCreate } from "@/app/types";
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
  system_prompt: z.string().max(5000).optional().nullable(),
});

interface AgentCreateFormProps {
  onAgentCreated?: (newAgent: AgentCreate) => void; // Optional callback
}

export function AgentCreateForm({ onAgentCreated }: AgentCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      system_prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const agentData: AgentCreate = {
        name: values.name,
        description: values.description || null,
        system_prompt: values.system_prompt || null,
      };
      const newAgent = await createAgent(agentData);
      toast({
        title: "Agent Created",
        description: `Agent "${newAgent.name}" has been successfully created.`,
      });
      form.reset(); // Reset form after successful submission
      if (onAgentCreated) {
        onAgentCreated(newAgent); // Call the callback if provided
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
      toast({
        variant: "destructive",
        title: "Error Creating Agent",
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
              <FormLabel>Agent Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Agent" {...field} />
              </FormControl>
              <FormDescription>A unique name for your agent.</FormDescription>
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
                  placeholder="Describe what this agent does..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""} // Handle null value for textarea
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="system_prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="You are a helpful assistant..."
                  className="resize-y min-h-[100px]"
                  {...field}
                  value={field.value ?? ""} // Handle null value for textarea
                />
              </FormControl>
              <FormDescription>
                The core instructions defining the agent's behavior and personality.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
          {isSubmitting ? "Creating..." : "Create Agent"}
        </Button>
      </form>
    </Form>
  );
}

