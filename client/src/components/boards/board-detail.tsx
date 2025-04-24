import { useState } from "react";
import { useBoard } from "@/hooks/use-boards";
import { useLists } from "@/hooks/use-lists";
import { 
  ArrowLeft, 
  Edit2, 
  PlusCircle, 
  Code,
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BoardForm from "./board-form";
import ListView from "@/components/lists/list-view";
import ListForm from "@/components/lists/list-form";
import { Link } from "wouter";

interface BoardDetailProps {
  boardId: number;
  onApiViewClick: () => void;
}

export default function BoardDetail({ boardId, onApiViewClick }: BoardDetailProps) {
  const { board, isLoading: isBoardLoading } = useBoard(boardId);
  const { lists, isLoading: isListsLoading } = useLists(boardId);
  const [isBoardModalOpen, setBoardModalOpen] = useState(false);
  const [isListModalOpen, setListModalOpen] = useState(false);
  
  if (isBoardLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="flex gap-4 mt-6 overflow-x-auto pb-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg shadow-md w-72 shrink-0">
              <div className="p-3 border-b border-gray-700">
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="p-3 space-y-2">
                {Array(3).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!board) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <h2 className="text-xl font-semibold">Board not found</h2>
        <p className="text-gray-400 mt-2">The board you're looking for doesn't exist or you don't have access to it.</p>
        <Link href="/">
          <Button className="mt-4">
            Return to Boards
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold cursor-blink">
              {board.name}
            </h1>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-primary"
              onClick={() => setBoardModalOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={() => setListModalOpen(true)}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add List
            </Button>
            <Button 
              variant="outline"
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              onClick={onApiViewClick}
            >
              <Code className="h-4 w-4 mr-1" /> API Docs
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max" style={{ minHeight: "calc(100vh - 230px)" }}>
            {isListsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg shadow-md w-72 shrink-0">
                  <div className="p-3 border-b border-gray-700">
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="p-3 space-y-2">
                    {Array(3).fill(0).map((_, j) => (
                      <Skeleton key={j} className="h-24 w-full" />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <>
                {lists.map(list => (
                  <ListView key={list.id} list={list} boardId={boardId} />
                ))}
                
                <div className="w-72 h-12 flex items-center justify-center">
                  <Button 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-md px-4 py-2 flex items-center"
                    onClick={() => setListModalOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add another list
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <BoardForm 
        isOpen={isBoardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        board={board ? { id: board.id, name: board.name, description: board.description } : null}
      />
      
      <ListForm
        isOpen={isListModalOpen}
        onClose={() => setListModalOpen(false)}
        boardId={boardId}
      />
    </>
  );
}
