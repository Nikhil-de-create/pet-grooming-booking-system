import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { format, parse, isValid } from "date-fns";
import { Staff, Appointment } from "@shared/schema";
import { 
  Alert,
  AlertTitle,
  AlertDescription 
} from "@/components/ui/alert";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UserIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon,
  ClockIcon
} from "lucide-react";

interface StaffCapacityManagerProps {
  date: Date | undefined;
  time: string | undefined;
}

export function StaffCapacityManager({ date, time }: StaffCapacityManagerProps) {
  // Query all staff members
  const { data: staff = [], isLoading: isLoadingStaff } = useQuery<Staff[]>({
    queryKey: ['/api/admin/staff'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!date && !!time,
  });

  // Query all appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ['/api/admin/appointments'],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!date && !!time,
  });

  // Calculate staff availability
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<Staff[]>([]);
  const [capacityPercentage, setCapacityPercentage] = useState(0);
  const [isOverbooked, setIsOverbooked] = useState(false);
  const [appointmentsAtTime, setAppointmentsAtTime] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!date || !time || isLoadingStaff || isLoadingAppointments) {
      return;
    }

    // Get appointments for this date and time
    const appointmentsAtDateTime = appointments.filter(appointment => {
      // For date comparison we need to ensure formats match
      const formattedAppointmentDate = typeof appointment.date === 'string' 
        ? appointment.date 
        : format(new Date(appointment.date), 'yyyy-MM-dd');
        
      const formattedSelectedDate = format(date, 'yyyy-MM-dd');

      return (
        formattedAppointmentDate === formattedSelectedDate &&
        appointment.time === time &&
        appointment.status !== 'cancelled'
      );
    });

    setAppointmentsAtTime(appointmentsAtDateTime);

    // Calculate assigned and available staff
    const activeStaff = staff.filter(s => s.active === true);
    const totalStaffCount = activeStaff.length;
    const assignedCount = appointmentsAtDateTime.length;
    
    // Calculate capacity
    if (totalStaffCount > 0) {
      const percentage = Math.min(100, Math.round((assignedCount / totalStaffCount) * 100));
      setCapacityPercentage(percentage);
    } else {
      setCapacityPercentage(0);
    }

    // Set overbooking state
    setIsOverbooked(assignedCount > totalStaffCount);
    
    // Create lists of assigned and available staff
    // In a real app, we would have a staffId in appointments to know exactly which staff is assigned
    // Here we're simulating by just taking the first N staff members
    const assigned: Staff[] = [];
    const available: Staff[] = [];
    
    activeStaff.forEach((staffMember, index) => {
      if (index < assignedCount) {
        assigned.push(staffMember);
      } else {
        available.push(staffMember);
      }
    });
    
    setAssignedStaff(assigned);
    setAvailableStaff(available);
    
  }, [date, time, appointments, staff, isLoadingStaff, isLoadingAppointments]);

  if (!date || !time) {
    return null;
  }

  if (isLoadingStaff || isLoadingAppointments) {
    return (
      <div className="mt-4 p-4 border rounded-md">
        <Skeleton className="h-4 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[200px] mb-4" />
        <Skeleton className="h-8 w-full mb-2" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-[100px]" />
          <Skeleton className="h-6 w-[100px]" />
          <Skeleton className="h-6 w-[100px]" />
        </div>
      </div>
    );
  }

  // No staff registered
  if (staff.length === 0) {
    return (
      <Alert variant="default" className="mt-4">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertTitle>No staff members configured</AlertTitle>
        <AlertDescription>
          You need to add staff members in your admin settings before you can manage capacity.
        </AlertDescription>
      </Alert>
    );
  }

  if (isOverbooked) {
    return (
      <Alert variant="destructive" className="mt-4">
        <XCircleIcon className="h-4 w-4" />
        <AlertTitle>Time slot overbooked!</AlertTitle>
        <AlertDescription>
          <p>
            This time slot has {appointmentsAtTime.length} appointments scheduled, but you only have {staff.filter(s => s.active).length} active staff members.
            Some customers may have to wait.
          </p>
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Capacity</p>
            <div className="flex items-center gap-2">
              <Progress value={capacityPercentage} className="h-2" />
              <span className="text-sm font-medium">{capacityPercentage}%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {assignedStaff.map(member => (
              <TooltipProvider key={member.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-red-100 border-red-200">
                      <UserIcon className="h-3 w-3 mr-1" />
                      {member.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assigned</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (availableStaff.length === 0 && staff.filter(s => s.active).length > 0) {
    return (
      <Alert variant="default" className="mt-4 border-yellow-200 bg-yellow-50">
        <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">No available staff</AlertTitle>
        <AlertDescription>
          <p className="text-yellow-700">
            All staff members are already assigned at this time slot. Please consider another time.
          </p>
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Capacity</p>
            <div className="flex items-center gap-2">
              <Progress value={capacityPercentage} className="h-2" />
              <span className="text-sm font-medium">{capacityPercentage}%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {assignedStaff.map(member => (
              <TooltipProvider key={member.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-yellow-100 border-yellow-200">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {member.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Busy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (availableStaff.length > 0) {
    return (
      <Alert variant="default" className="mt-4 border-green-200 bg-green-50">
        <CheckCircleIcon className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Staff available!</AlertTitle>
        <AlertDescription>
          <p className="text-green-700">
            You have {availableStaff.length} staff member{availableStaff.length > 1 ? 's' : ''} available for this time slot.
          </p>
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Capacity</p>
            <div className="flex items-center gap-2">
              <Progress value={capacityPercentage} className="h-2" />
              <span className="text-sm font-medium">{capacityPercentage}%</span>
            </div>
          </div>
          {assignedStaff.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Assigned Staff</p>
              <div className="flex flex-wrap gap-2">
                {assignedStaff.map(member => (
                  <TooltipProvider key={member.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-blue-100 border-blue-200">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {member.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Busy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Available Staff</p>
            <div className="flex flex-wrap gap-2">
              {availableStaff.map(member => (
                <TooltipProvider key={member.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-green-100 border-green-200">
                        <UserIcon className="h-3 w-3 mr-1" />
                        {member.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Available</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}