import { BookingFormData } from "@/pages/Booking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";

interface ConfirmationProps {
  formData: BookingFormData;
  onBookAnother: () => void;
}

export function Confirmation({ formData, onBookAnother }: ConfirmationProps) {
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  
  const selectedService = services?.find(s => s.id === formData.serviceId);
  
  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircleIcon className="text-2xl text-green-600 h-8 w-8" />
          </div>
          
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">Booking Confirmed!</h2>
          <p className="mt-2 text-gray-600">
            Thank you for booking with PawPerfect. We're looking forward to pampering your pet!
          </p>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <h3 className="font-medium text-gray-800 mb-2">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{formData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pet:</span>
                <span className="font-medium">{formData.petName}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>A confirmation email has been sent to <span className="font-medium">{formData.email}</span></p>
          </div>
          
          <div className="mt-8">
            <Button
              variant="outline"
              className="bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-200"
              onClick={onBookAnother}
            >
              Book Another Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
