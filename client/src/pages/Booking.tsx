import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { BookingProgress } from "@/components/BookingProgress";
import { ServiceSelection } from "@/components/BookingSteps/ServiceSelection";
import { DateTimeSelection } from "@/components/BookingSteps/DateTimeSelection";
import { CustomerDetails } from "@/components/BookingSteps/CustomerDetails";
import { Confirmation } from "@/components/BookingSteps/Confirmation";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertAppointment } from "@shared/schema";

export type BookingFormData = {
  serviceId: number;
  date: string;
  time: string;
  petOwner: string;
  phone: string;
  email: string;
  petName: string;
  petType: string;
  petBreed: string;
  petSize: string;
  petNotes: string;
}

export default function Booking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: 0,
    date: "",
    time: "",
    petOwner: "",
    phone: "",
    email: "",
    petName: "",
    petType: "dog",
    petBreed: "",
    petSize: "medium",
    petNotes: "",
  });
  
  const { toast } = useToast();
  
  const { mutate: bookAppointment, isPending } = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const res = await apiRequest("POST", "/api/book-appointment", data);
      return res.json();
    },
    onSuccess: () => {
      setStep(4); // Move to confirmation step
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error booking your appointment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = () => {
    bookAppointment(formData as InsertAppointment);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        <div className="bg-primary-100 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-800 tracking-tight">
                Book Your Pet Grooming Appointment
              </h1>
              <p className="mt-4 text-lg text-primary-600 max-w-2xl mx-auto">
                Give your furry friend the care they deserve with our professional grooming services
              </p>
              
              <BookingProgress currentStep={step} />
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {step === 1 && (
            <ServiceSelection 
              formData={formData} 
              setFormData={setFormData} 
              onNext={() => setStep(2)} 
            />
          )}
          
          {step === 2 && (
            <DateTimeSelection 
              formData={formData} 
              setFormData={setFormData} 
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          
          {step === 3 && (
            <CustomerDetails 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              isSubmitting={isPending}
            />
          )}
          
          {step === 4 && (
            <Confirmation 
              formData={formData} 
              onBookAnother={() => {
                setFormData({
                  serviceId: 0,
                  date: "",
                  time: "",
                  petOwner: "",
                  phone: "",
                  email: "",
                  petName: "",
                  petType: "dog",
                  petBreed: "",
                  petSize: "medium",
                  petNotes: "",
                });
                setStep(1);
              }} 
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
