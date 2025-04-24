import Navbar from "@/components/layout/navbar";
import ApiTester from "@/components/api-testing/api-tester";
import { Play } from "lucide-react";

export default function ApiTestingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold cursor-blink">API Testing</h1>
          </div>
          
          <ApiTester />
        </div>
      </main>
    </div>
  );
}
