import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Service } from "@shared/schema";
import { BookingFormData } from "@/pages/Booking";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
];

const petTypes = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
  { label: "Rabbit", value: "rabbit" },
  { label: "Guinea Pig", value: "guinea_pig" },
  { label: "Bird", value: "bird" },
  { label: "Other", value: "other" }
];

const petSizes = [
  { label: "Small (0-15 lbs)", value: "small" },
  { label: "Medium (16-40 lbs)", value: "medium" },
  { label: "Large (41-70 lbs)", value: "large" },
  { label: "X-Large (71+ lbs)", value: "x-large" }
];

// Add validation schema
const formSchema = z.object({
  serviceId: z.number({
    required_error: "Please select a service",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  petOwner: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  petName: z.string().min(1, {
    message: "Pet name is required",
  }),
  petType: z.string({
    required_error: "Please select a pet type",
  }),
  petBreed: z.string().min(1, {
    message: "Pet breed is required",
  }),
  petSize: z.string({
    required_error: "Please select a pet size",
  }),
  petNotes: z.string().optional(),
});

interface AdminBookingFormProps {
  onSuccess?: () => void;
  onDateTimeChange?: (date: Date | undefined, time: string | undefined) => void;
}

export function AdminBookingForm({ onSuccess, onDateTimeChange }: AdminBookingFormProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();

  // Fetch services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Form setup with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petOwner: "",
      phone: "",
      email: "",
      petName: "",
      petBreed: "",
      petNotes: "",
    },
  });

  // Book appointment mutation
  const { mutate: bookAppointment, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest('POST', '/api/book-appointment', {
        ...data,
        date: format(data.date, 'yyyy-MM-dd') // Convert Date to string format
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment booked",
        description: "The appointment has been successfully booked.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: "There was an error booking the appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    bookAppointment(values);
  }

  // Check if the selected date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Selection */}
          <FormField
            control={form.control}
            name="serviceId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Service</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} (${service.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Selection */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                          setDate(date);
                          if (onDateTimeChange) {
                            onDateTimeChange(date, form.getValues('time'));
                          }
                        }
                      }}
                      disabled={(date) => isPastDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time Selection */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (onDateTimeChange && date) {
                      onDateTimeChange(date, value);
                    }
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pet Type Selection */}
          <FormField
            control={form.control}
            name="petType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {petTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pet Size Selection */}
          <FormField
            control={form.control}
            name="petSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet Size</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {petSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pet Owner Name */}
          <FormField
            control={form.control}
            name="petOwner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pet Name */}
          <FormField
            control={form.control}
            name="petName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Pet name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pet Breed */}
          <FormField
            control={form.control}
            name="petBreed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet's Breed</FormLabel>
                <FormControl>
                  <Input placeholder="Pet breed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="petNotes"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any specific instructions or concerns"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isPending}
        >
          {isPending ? "Booking..." : "Book Appointment"}
        </Button>
      </form>
    </Form>
  );
}