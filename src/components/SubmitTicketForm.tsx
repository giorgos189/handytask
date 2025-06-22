
// src/components/SubmitTicketForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useEffect, useState } from "react";
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
import { useTaskStore } from "@/store/tasks";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllUsers, type User } from "@/auth/auth";
import { HandymanMultiSelect } from "./HandymanMultiSelect";

const ticketFormSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters.").max(50),
  address: z.string().min(5, "Address must be at least 5 characters.").max(100),
  contactInfo: z.string().min(7, "Phone number must be at least 7 digits.").regex(/^[0-9]+$/, "Contact information must only contain numbers."),
  problemDescription: z.string().max(500, "Problem description cannot exceed 500 characters."),
  assignedHandymen: z.array(z.string().email("Each handyman must be a valid email.")).optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export function SubmitTicketForm() {
  const addTicket = useTaskStore((state) => state.addTicket);
  const router = useRouter();
  const { toast } = useToast();
  const [availableHandymen, setAvailableHandymen] = useState<User[]>([]);

  useEffect(() => {
    // Fetch all users when the component mounts
    const fetchHandymen = async () => {
        try {
            const users = await getAllUsers();
            setAvailableHandymen(users);
        } catch (error) {
            console.error("Failed to fetch handymen:", error);
            toast({
                title: "Error",
                description: "Could not load the list of users.",
                variant: "destructive",
            });
        }
    };
    fetchHandymen();
  }, [toast]);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      clientName: "",
      address: "",
      contactInfo: "",
      problemDescription: "",
      assignedHandymen: [],
    },
  });

  async function onSubmit(data: TicketFormValues) {
    try {
      await addTicket({
        ...data,
        assignedHandymen: data.assignedHandymen || [], // Ensure it's an array
      });
      toast({
        title: "Ticket Submitted!",
        description: `Ticket for ${data.clientName} has been successfully created.`,
      });
      router.push("/");
    } catch (error) {
       toast({
        title: "Submission Error",
        description: "Failed to create the ticket. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to submit ticket:", error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Submit New Handyman Job Request</CardTitle>
        <CardDescription>Please provide details about the hardware issue and location.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 5551234567" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please provide a contact phone number (numbers only).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the hardware issue in detail..."
                      className="resize-y min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="assignedHandymen"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Assigned Handymen (Optional)</FormLabel>
                  <HandymanMultiSelect
                    availableHandymen={availableHandymen}
                    selectedHandymenEmails={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select handymen to assign..."
                  />
                  <FormDescription>
                    Select one or more handymen for this task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
