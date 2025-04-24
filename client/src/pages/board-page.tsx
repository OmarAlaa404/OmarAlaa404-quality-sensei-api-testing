import { useState } from "react";
import { useRoute } from "wouter";
import Navbar from "@/components/layout/navbar";
import BoardDetail from "@/components/boards/board-detail";
import SwaggerUI from "@/components/ui/swagger-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BoardPage() {
  const [_, params] = useRoute("/board/:id");
  const boardId = params ? parseInt(params.id) : null;
  const [activeTab, setActiveTab] = useState<string>("board");
  
  if (!boardId) {
    return <div>Invalid board ID</div>;
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger 
                  value="board" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Board
                </TabsTrigger>
                <TabsTrigger 
                  value="swagger" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Swagger Docs
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="board" className="mt-0">
              <BoardDetail 
                boardId={boardId} 
                onApiViewClick={() => setActiveTab("swagger")} 
              />
            </TabsContent>
            
            <TabsContent value="swagger" className="mt-0">
              <SwaggerUI />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
