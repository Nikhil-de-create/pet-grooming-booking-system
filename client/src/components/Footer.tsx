import { PawPrintIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white mt-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <span className="text-primary-600 text-lg font-bold flex items-center">
              <PawPrintIcon className="h-5 w-5 mr-2" /> PawPerfect
            </span>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-500 md:text-right">
              &copy; {new Date().getFullYear()} PawPerfect Grooming. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
