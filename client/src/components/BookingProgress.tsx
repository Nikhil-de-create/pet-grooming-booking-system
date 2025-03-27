import { 
  CalendarIcon, 
  CheckIcon, 
  ListIcon, 
  UserIcon 
} from "lucide-react";

interface BookingProgressProps {
  currentStep: number;
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            <ListIcon className="h-4 w-4" />
          </div>
          <span className={`mt-1 text-xs ${
            currentStep >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'
          }`}>
            Service
          </span>
        </div>
        
        <div className={`h-0.5 w-1/6 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
        
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            <CalendarIcon className="h-4 w-4" />
          </div>
          <span className={`mt-1 text-xs ${
            currentStep >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'
          }`}>
            Date & Time
          </span>
        </div>
        
        <div className={`h-0.5 w-1/6 ${currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
        
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            <UserIcon className="h-4 w-4" />
          </div>
          <span className={`mt-1 text-xs ${
            currentStep >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'
          }`}>
            Details
          </span>
        </div>
        
        <div className={`h-0.5 w-1/6 ${currentStep >= 4 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
        
        <div className="flex flex-col items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 4 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            <CheckIcon className="h-4 w-4" />
          </div>
          <span className={`mt-1 text-xs ${
            currentStep >= 4 ? 'text-primary-600 font-medium' : 'text-gray-500'
          }`}>
            Confirm
          </span>
        </div>
      </div>
    </div>
  );
}
