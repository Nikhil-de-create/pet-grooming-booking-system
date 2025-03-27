import { BookingFormData } from "@/pages/Booking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

interface CustomerDetailsProps {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function CustomerDetails({ 
  formData, 
  setFormData, 
  onSubmit, 
  onBack, 
  isSubmitting 
}: CustomerDetailsProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  
  const selectedService = services?.find(s => s.id === formData.serviceId);
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.petOwner) errors.petOwner = "Pet owner name is required";
    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.petName) errors.petName = "Pet name is required";
    if (!formData.petBreed) errors.petBreed = "Pet breed is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Enter Your Details</h2>
        <Button variant="ghost" onClick={onBack} className="text-primary-600 hover:text-primary-800">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Schedule
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg">
            <h3 className="font-medium text-primary-800">Booking Summary</h3>
            <div className="mt-2 space-y-1">
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
              <div className="flex justify-between pt-1 border-t border-primary-200 mt-1">
                <span className="text-gray-800 font-medium">Total:</span>
                <span className="font-semibold text-primary-600">
                  ${selectedService?.price}
                </span>
              </div>
            </div>
          </div>
          
          {/* Owner Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="petOwner">Full Name</Label>
                <Input
                  id="petOwner"
                  value={formData.petOwner}
                  onChange={(e) => setFormData({ ...formData, petOwner: e.target.value })}
                  className={validationErrors.petOwner ? "border-red-300" : ""}
                />
                {validationErrors.petOwner && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.petOwner}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={validationErrors.phone ? "border-red-300" : ""}
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={validationErrors.email ? "border-red-300" : ""}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Pet Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Pet Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="petName">Pet's Name</Label>
                <Input
                  id="petName"
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  className={validationErrors.petName ? "border-red-300" : ""}
                />
                {validationErrors.petName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.petName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="petType">Pet Type</Label>
                <Select 
                  value={formData.petType}
                  onValueChange={(value) => setFormData({ ...formData, petType: value })}
                >
                  <SelectTrigger id="petType">
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="petBreed">Breed</Label>
                <Input
                  id="petBreed"
                  value={formData.petBreed}
                  onChange={(e) => setFormData({ ...formData, petBreed: e.target.value })}
                  className={validationErrors.petBreed ? "border-red-300" : ""}
                />
                {validationErrors.petBreed && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.petBreed}</p>
                )}
              </div>
              <div>
                <Label htmlFor="petSize">Size</Label>
                <Select 
                  value={formData.petSize}
                  onValueChange={(value) => setFormData({ ...formData, petSize: value })}
                >
                  <SelectTrigger id="petSize">
                    <SelectValue placeholder="Select pet size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (under 20 lbs)</SelectItem>
                    <SelectItem value="medium">Medium (20-50 lbs)</SelectItem>
                    <SelectItem value="large">Large (50-90 lbs)</SelectItem>
                    <SelectItem value="xlarge">X-Large (over 90 lbs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="petNotes">Special Instructions or Notes</Label>
                <Textarea
                  id="petNotes"
                  value={formData.petNotes}
                  onChange={(e) => setFormData({ ...formData, petNotes: e.target.value })}
                  placeholder="Any specific concerns, health issues, or grooming preferences..."
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                "Book Appointment"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
