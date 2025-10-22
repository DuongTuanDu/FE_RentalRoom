import { Outlet, useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import AppSidebar from "./SiderLandlord";

// Main Layout Component
export default function LayoutLandlord() {
  const navigate = useNavigate();

  const handlePackageServiceClick = () => {
    navigate("/landlord/package-services");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 flex items-center gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Tìm kiếm..." className="pl-10 w-full" />
              </div>
            </div>
            
            {/* Package Service Button */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePackageServiceClick}
                className="mr-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="sm"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                <span className="font-medium">Gói Dịch Vụ</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-muted/40 py-4 px-4 md:px-6">
            <div className="text-center text-sm text-muted-foreground">
              <strong>Rental Room Landlord</strong> © {new Date().getFullYear()}{" "}
              Created with <span className="text-red-500">❤️</span>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}