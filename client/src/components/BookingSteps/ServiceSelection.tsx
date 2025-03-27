import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingFormData } from "@/pages/Booking";
import { BathIcon, ScissorsIcon, FlaskConicalIcon, PawPrintIcon } from "lucide-react";

interface ServiceSelectionProps {
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  onNext: () => void;
}

// Map service icons to Lucide icons
const iconMap: Record<string, React.ReactNode> = {
  "fa-shower": <BathIcon className="h-5 w-5" />,
  "fa-cut": <ScissorsIcon className="h-5 w-5" />,
  "fa-spa": <FlaskConicalIcon className="h-5 w-5" />,
  "fa-paw": <PawPrintIcon className="h-5 w-5" />,
};

export function ServiceSelection({ formData, setFormData, onNext }: ServiceSelectionProps) {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  
  const handleServiceSelect = (serviceId: number) => {
    setFormData({ ...formData, serviceId });
    onNext();
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Grooming Service</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-2 border-transparent">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-100 rounded-full p-3">
                    <Skeleton className="h-6 w-6" />
                  </div>
                  <div className="ml-4 space-y-2 w-full">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between mt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services?.map((service) => (
            <Card 
              key={service.id}
              className={`border-2 cursor-pointer transition transform hover:scale-[1.02] hover:shadow-lg ${
                formData.serviceId === service.id ? 'border-primary-500' : 'border-transparent'
              }`}
              onClick={() => handleServiceSelect(service.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-100 rounded-full p-3 text-primary-600">
                    {iconMap[service.icon] || <PawPrintIcon className="h-5 w-5" />}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{service.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary-600">
                        ${service.price}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <ClockIcon className="mr-1 h-4 w-4" />
                        <span>{service.duration} min</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
