import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import BoardList from "@/components/boards/board-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import BoardForm from "@/components/boards/board-form";

export default function HomePage() {
  const [isBoardModalOpen, setBoardModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold cursor-blink">My Boards</h1>
            <Button 
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={() => setBoardModalOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> New Board
            </Button>
          </div>
          
          <BoardList />
          
          <BoardForm 
            isOpen={isBoardModalOpen}
            onClose={() => setBoardModalOpen(false)}
            board={null}
          />
        </div>
      </main>
    </div>
  );
}
