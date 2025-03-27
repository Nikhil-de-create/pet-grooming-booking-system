import { useEffect, useState } from "react";
import { BookingFormData } from "@/pages/Booking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import { ArrowLeftIcon } from "lucide-react";

interface DateTimeSelectionProps {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DateTimeSelection({ formData, setFormData, onNext, onBack }: DateTimeSelectionProps) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  
  const selectedService = services?.find(s => s.id === formData.serviceId);
  
  useEffect(() => {
    // Generate available times for demo - in a real app, this would come from the backend
    const times: string[] = [];
    for (let i = 9; i <= 16; i++) {
      if (i !== 12) { // Lunch break at noon
        times.push(`${i}:00`);
        if (i !== 16) times.push(`${i}:30`);
      }
    }
    setAvailableTimes(times);
  }, []);
  
  const handleTimeSelect = (time: string) => {
    setFormData({ ...formData, time });
    onNext();
  };
  
  // Calculate minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Select Date and Time</h2>
        <Button variant="ghost" onClick={onBack} className="text-primary-600 hover:text-primary-800">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Services
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {/* Selected Service Summary */}
          {selectedService && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-primary-800">Selected Service</h3>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <span className="font-medium">{selectedService.name}</span>
                  <span className="text-sm ml-2 text-gray-600">
                    ({selectedService.duration} min)
                  </span>
                </div>
                <span className="font-semibold text-primary-600">
                  ${selectedService.price}
                </span>
              </div>
            </div>
          )}
          
          {/* Date Picker */}
          <div className="mb-6">
            <Label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Select Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={minDate}
              className="block w-full"
            />
          </div>
          
          {/* Available Times */}
          {formData.date && (
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={formData.time === time ? "default" : "outline"}
                    onClick={() => handleTimeSelect(time)}
                    className="text-center py-2 px-1 text-sm font-medium"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
