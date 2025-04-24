import Navbar from "@/components/layout/navbar";
import SwaggerUI from "@/components/ui/swagger-ui";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function SwaggerPage() {
  const openSwaggerInNewTab = () => {
    window.open('/api-docs', '_blank');
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold cursor-blink">API Documentation</h1>
            <Button 
              variant="outline"
              onClick={openSwaggerInNewTab}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              <ExternalLink className="h-4 w-4 mr-1" /> Open in New Tab
            </Button>
          </div>
          
          <SwaggerUI />
        </div>
      </main>
    </div>
  );
}
