import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO, isValid, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
// Import the Appointment type from a relative path that works for our frontend
// This is a simplified version of the type from shared/schema.ts
interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  petOwner: string;
  phone: string;
  email: string;
  petName: string;
  petType: string;
  petBreed: string;
  petSize?: string;
  petNotes?: string;
  serviceId: number;
  businessId: number;
  createdAt: Date;
}
import { getQueryFn } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar as CalendarIcon, Clock, User, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminCalendarProps {
  onAppointmentStatusChange: (id: number, status: string) => Promise<void>;
}

export function AdminCalendar({ onAppointmentStatusChange }: AdminCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch appointments data
  const { data: appointments = [], isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ['/api/admin/appointments'],
    queryFn: getQueryFn({ on401: 'throw' }),
    refetchOnWindowFocus: false
  });

  // Function to get appointments for the selected date
  const getAppointmentsForDate = (date: Date | undefined) => {
    if (!date || !appointments.length) return [];
    
    return appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.date);
      return isValid(appointmentDate) && isSameDay(appointmentDate, date);
    });
  };

  // Filter appointments based on the selected date
  const appointmentsForSelectedDate = getAppointmentsForDate(selectedDate);

  // Get all dates that have appointments
  const appointmentDates = appointments.reduce((dates: Date[], appointment: Appointment) => {
    try {
      const date = new Date(appointment.date);
      if (isValid(date)) {
        // Check if this date is already in our array
        if (!dates.some(existingDate => isSameDay(existingDate, date))) {
          dates.push(date);
        }
      }
    } catch (e) {
      console.error("Invalid date format:", appointment.date);
    }
    return dates;
  }, []);

  // Handle appointment status change
  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    await onAppointmentStatusChange(appointmentId, newStatus);
    setSelectedAppointment(null);
    refetch();
  };

  // Determine badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Calendar section */}
      <div className="md:w-1/2 lg:w-1/3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Appointment Calendar
            </CardTitle>
            <CardDescription>
              View and manage your appointments by date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasAppointment: appointmentDates
              }}
              modifiersClassNames={{
                hasAppointment: "bg-primary/20 text-primary font-bold"
              }}
            />
            <div className="mt-4 flex justify-between items-center text-sm">
              <span className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-primary/20 mr-2"></div>
                Has appointments
              </span>
              <span>{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments list for selected date */}
      <div className="md:w-1/2 lg:w-2/3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? `Appointments for ${format(selectedDate, 'MMMM d, yyyy')}` 
                : 'Select a date to view appointments'
              }
            </CardTitle>
            <CardDescription>
              {appointmentsForSelectedDate.length 
                ? `${appointmentsForSelectedDate.length} appointment(s) scheduled` 
                : 'No appointments scheduled for this date'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {appointmentsForSelectedDate.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    No appointments scheduled for this date.
                  </div>
                ) : (
                  appointmentsForSelectedDate.map((appointment: Appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <div className={`h-1 ${getStatusColor(appointment.status)}`}></div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-zinc-400" />
                              <span className="font-medium">{appointment.time}</span>
                              <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-3">
                              <div>
                                <div className="flex items-center text-sm text-zinc-500">
                                  <User className="h-3.5 w-3.5 mr-1" />
                                  Customer:
                                </div>
                                <div className="font-medium">{appointment.petOwner}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-zinc-500">Phone:</div>
                                <div>{appointment.phone}</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-zinc-500">Pet:</div>
                                <div>{appointment.petName} ({appointment.petType}, {appointment.petBreed})</div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-zinc-500">Service:</div>
                                <div>{appointment.serviceId}</div>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            Manage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment details dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                {format(new Date(selectedAppointment.date), 'MMMM d, yyyy')} at {selectedAppointment.time}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium">Customer:</div>
                <div className="col-span-3">{selectedAppointment.petOwner}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium">Contact:</div>
                <div className="col-span-3">{selectedAppointment.phone} | {selectedAppointment.email}</div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium">Pet:</div>
                <div className="col-span-3">
                  {selectedAppointment.petName} ({selectedAppointment.petType}, {selectedAppointment.petBreed})
                  {selectedAppointment.petSize && <span> | {selectedAppointment.petSize}</span>}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium">Service:</div>
                <div className="col-span-3">{selectedAppointment.serviceId}</div>
              </div>
              
              {selectedAppointment.petNotes && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right text-sm font-medium">Notes:</div>
                  <div className="col-span-3">{selectedAppointment.petNotes}</div>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm font-medium">Status:</div>
                <div className="col-span-3">
                  <Select 
                    defaultValue={selectedAppointment.status}
                    onValueChange={(value) => handleStatusChange(selectedAppointment.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}