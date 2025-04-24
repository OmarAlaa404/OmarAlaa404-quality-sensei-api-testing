import { useState } from "react";
import { useBoards } from "@/hooks/use-boards";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  List, 
  CheckSquare, 
  PlusCircle, 
  Edit, 
  Trash2 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/ui/modal";
import BoardForm from "./board-form";

export default function BoardList() {
  const { boards, isLoading, deleteBoardMutation } = useBoards();
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<{ id: number; name: string; description: string | null } | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<number | null>(null);
  
  const handleEdit = (board: { id: number; name: string; description: string | null }) => {
    setBoardToEdit(board);
    setIsBoardModalOpen(true);
  };
  
  const handleDelete = (boardId: number) => {
    setBoardToDelete(boardId);
  };
  
  const confirmDelete = () => {
    if (boardToDelete !== null) {
      deleteBoardMutation.mutate(boardToDelete);
      setBoardToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <Card key={n} className="bg-gray-800 border-gray-700 overflow-hidden">
            <CardContent className="p-5">
              <Skeleton className="h-6 w-1/2 bg-gray-700 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-gray-700 mb-4" />
              <div className="flex items-center mt-4">
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-700 p-0">
              <Skeleton className="h-10 w-full bg-gray-600" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <Card key={board.id} className="bg-gray-800 border-gray-700 overflow-hidden card-transition hover:shadow-xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-white">{board.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-700"
                      onClick={() => handleEdit(board)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer hover:bg-gray-700 text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(board.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-gray-400 text-sm mt-1">{board.description}</p>
              
              {/* This will display mock counts as we don't have actual data yet */}
              <div className="mt-4">
                <div className="flex items-center text-xs text-gray-400">
                  <List className="h-3 w-3 mr-1" />
                  <span>3 lists</span>
                  <span className="mx-2">•</span>
                  <CheckSquare className="h-3 w-3 mr-1" />
                  <span>9 cards</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Link href={`/board/${board.id}`} className="block w-full">
                <Button 
                  variant="ghost" 
                  className="w-full rounded-none h-10 bg-gray-700 hover:bg-gray-600 text-primary"
                >
                  Open Board
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        
        {/* Add Board Card */}
        <Card className="bg-gray-800 border-gray-700 border-dashed hover:bg-gray-750 cursor-pointer min-h-[200px] flex items-center justify-center"
              onClick={() => { setBoardToEdit(null); setIsBoardModalOpen(true); }}>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <PlusCircle className="h-12 w-12 text-gray-500 mb-2" />
            <p className="text-gray-400 text-lg font-medium">Add New Board</p>
          </CardContent>
        </Card>
      </div>
      
      <BoardForm 
        isOpen={isBoardModalOpen}
        onClose={() => { setIsBoardModalOpen(false); setBoardToEdit(null); }}
        board={boardToEdit}
      />
      
      <ConfirmModal
        title="Delete Board"
        description="Are you sure you want to delete this board? This action cannot be undone."
        isOpen={boardToDelete !== null}
        onClose={() => setBoardToDelete(null)}
        onConfirm={confirmDelete}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteBoardMutation.isPending}
      />
    </>
  );
}
