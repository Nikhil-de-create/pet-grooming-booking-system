import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  CalendarIcon, 
  ScissorsIcon, 
  LogOutIcon, 
  PawPrintIcon, 
  PlusCircleIcon,
  PhoneIcon,
  UsersIcon
} from "lucide-react";
import { Appointment, Service } from "@shared/schema";
import { AdminCalendar } from "@/components/AdminCalendar";
import { AdminBookingForm } from "@/components/AdminBookingForm";
import { StaffCapacityManager } from "@/components/StaffCapacityManager";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    // Using new error handling approach with Query v5
    gcTime: 0,
  });
  
  // Fetch services for service names
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  
  // Update appointment status
  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Status Updated",
        description: "Appointment status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  });
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin/login");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };
  
  // Add type annotation for appointments
  const filteredAppointments = appointments ? appointments.filter((appointment: Appointment) => {
    if (activeTab === "all") return true;
    return appointment.status === activeTab;
  }) : [];
  
  const getServiceName = (serviceId: number) => {
    return services?.find(service => service.id === serviceId)?.name || "Unknown Service";
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline" as const;
      case "approved":
        return "secondary" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };
  
  // State for managing the new booking dialog
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  // Function to close the dialog and refresh appointments
  const handleBookingSuccess = () => {
    setBookingDialogOpen(false);
    // No need to invalidate queries as the mutation in AdminBookingForm does this
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Floating Action Button for quick booking */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <div className="fixed right-8 bottom-8 z-40">
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <PlusCircleIcon className="h-6 w-6" />
              <span className="sr-only">Add Walk-in Booking</span>
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Walk-in or Phone Booking</DialogTitle>
            <DialogDescription>
              Fill out this form to book an appointment for a walk-in customer or phone call.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6">
            <AdminBookingForm 
              onSuccess={handleBookingSuccess} 
              onDateTimeChange={(date, time) => {
                setSelectedDate(date);
                setSelectedTime(time);
              }}
            />
          </div>
          
          {selectedDate && selectedTime && (
            <div className="mt-4">
              <StaffCapacityManager 
                date={selectedDate} 
                time={selectedTime} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Navigation */}
      <nav className="bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">
                <PawPrintIcon className="inline-block mr-2 h-5 w-5" /> PawPerfect Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-white border-white hover:bg-primary-700">
                    <PhoneIcon className="mr-2 h-4 w-4" /> Add Walk-in Booking
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Add Walk-in or Phone Booking</DialogTitle>
                    <DialogDescription>
                      Fill out this form to book an appointment for a walk-in customer or phone call.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-6">
                    <AdminBookingForm 
                      onSuccess={handleBookingSuccess} 
                      onDateTimeChange={(date, time) => {
                        setSelectedDate(date);
                        setSelectedTime(time);
                      }}
                    />
                  </div>
                  
                  {selectedDate && selectedTime && (
                    <div className="mt-4">
                      <StaffCapacityManager 
                        date={selectedDate} 
                        time={selectedTime} 
                      />
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
              <Button variant="ghost" className="text-white" onClick={handleLogout}>
                <LogOutIcon className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage upcoming pet grooming appointments
            </p>
          </div>
          
          {/* Main Tabs */}
          <Tabs defaultValue="list" className="mb-6">
            <TabsList className="mb-6">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            
            {/* List View Tab */}
            <TabsContent value="list">
              {/* Status Filter Tabs */}
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Appointments</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  {isLoading ? (
                    // Loading state
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-md shadow p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[200px]" />
                              <Skeleton className="h-4 w-[150px]" />
                            </div>
                            <Skeleton className="h-6 w-[80px]" />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-4 w-[140px]" />
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Skeleton className="h-8 w-[80px]" />
                            <Skeleton className="h-8 w-[80px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      {filteredAppointments && filteredAppointments.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {filteredAppointments.map((appointment) => (
                            <li key={appointment.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{appointment.petOwner}</p>
                                      <p className="text-sm text-gray-500">{appointment.phone}</p>
                                    </div>
                                  </div>
                                  <Badge variant={getStatusBadgeVariant(appointment.status)}>
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex gap-6">
                                    <p className="flex items-center text-sm text-gray-500">
                                      <PawPrintIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                      <span>{appointment.petName}</span>
                                    </p>
                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                      <ScissorsIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                      <span>{getServiceName(appointment.serviceId)}</span>
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    <p>
                                      <span>{appointment.date}</span> at <span>{appointment.time}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 flex justify-end space-x-3">
                                  {appointment.status !== "approved" && (
                                    <Button 
                                      variant="outline" 
                                      className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                                      size="sm"
                                      onClick={() => updateStatus({ id: appointment.id, status: "approved" })}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {appointment.status !== "cancelled" && (
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => updateStatus({ id: appointment.id, status: "cancelled" })}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-6 sm:px-6 text-center text-gray-500">
                          No appointments found.
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            {/* Calendar View Tab */}
            <TabsContent value="calendar">
              <div className="bg-white p-4 rounded-md shadow">
                <AdminCalendar 
                  onAppointmentStatusChange={async (id, status) => {
                    updateStatus({ id, status });
                    return Promise.resolve();
                  }} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
