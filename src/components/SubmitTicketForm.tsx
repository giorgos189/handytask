// src/components/SubmitTicketForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const ticketFormSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters.").max(50),
  address: z.string().min(5, "Address must be at least 5 characters.").max(100),
  contactInfo: z.string().email("Invalid email address.").or(z.string().min(10, "Phone number must be at least 10 digits.")),
  problemDescription: z.string().min(10, "Problem description must be at least 10 characters.").max(500),
  assignedHandyman: z.string().optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export function SubmitTicketForm() {
  const addTicket = useTaskStore((state) => state.addTicket);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      clientName: "",
      address: "",
      contactInfo: "",
      problemDescription: "",
      assignedHandyman: "",
    },
  });

  function onSubmit(data: TicketFormValues) {
    addTicket(data);
    toast({
      title: "Ticket Submitted!",
      description: `Ticket for ${data.clientName} has been successfully created.`,
    });
    router.push("/");
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
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., john.doe@example.com or 555-1234" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please provide an email address or phone number.
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
              name="assignedHandyman"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Handyman (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Handy Andy" {...field} />
                  </FormControl>
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
