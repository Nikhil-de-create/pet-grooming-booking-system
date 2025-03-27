import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PawPrintIcon, ShieldIcon } from "lucide-react";
import { useAuth } from "@/lib/auth.tsx";

export function NavBar() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const isAdmin = location.startsWith("/admin");
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-primary-600 text-2xl font-bold flex items-center">
              <PawPrintIcon className="h-6 w-6 mr-2" /> PawPerfect
            </Link>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6">
            {isAuthenticated ? (
              <Link href="/admin/dashboard">
                <Button variant="ghost" className="text-gray-500 hover:text-primary-600">
                  <ShieldIcon className="h-4 w-4 mr-1" /> Dashboard
                </Button>
              </Link>
            ) : (
              !isAdmin && (
                <Link href="/admin/login">
                  <Button variant="ghost" className="text-gray-500 hover:text-primary-600">
                    <ShieldIcon className="h-4 w-4 mr-1" /> Admin
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
