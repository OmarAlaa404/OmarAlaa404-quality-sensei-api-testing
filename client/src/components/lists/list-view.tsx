import { useState } from "react";
import { useLists } from "@/hooks/use-lists";
import { useCards } from "@/hooks/use-cards";
import { 
  MoreHorizontal, 
  PlusCircle, 
  Edit2, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmModal } from "@/components/ui/modal";
import CardView from "@/components/cards/card-view";
import CardForm from "@/components/cards/card-form";
import ListForm from "./list-form";
import { List } from "@shared/schema";

interface ListViewProps {
  list: List;
  boardId: number;
}

export default function ListView({ list, boardId }: ListViewProps) {
  const { deleteListMutation } = useLists(boardId);
  const { cards, isLoading: isCardsLoading } = useCards(list.id);
  
  const [isListEditModalOpen, setListEditModalOpen] = useState(false);
  const [isCardModalOpen, setCardModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<any>(null);
  
  const handleCardEdit = (card: any) => {
    setCardToEdit(card);
    setCardModalOpen(true);
  };
  
  const handleAddCard = () => {
    setCardToEdit(null);
    setCardModalOpen(true);
  };
  
  const handleDeleteList = () => {
    deleteListMutation.mutate(list.id, {
      onSuccess: () => setDeleteModalOpen(false)
    });
  };
  
  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-md w-72 flex flex-col max-h-full">
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-medium text-white">{list.title}</h3>
          <div className="flex space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-gray-700"
                  onClick={() => setListEditModalOpen(true)}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-gray-700 text-red-400 hover:text-red-300"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          {isCardsLoading ? (
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-700 rounded-md p-3 animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2 mb-3"></div>
                  <div className="flex gap-1">
                    <div className="h-4 bg-gray-600 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {cards.map(card => (
                <CardView 
                  key={card.id} 
                  card={card} 
                  onEdit={() => handleCardEdit(card)} 
                />
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full text-left px-3 py-2 text-gray-400 hover:text-white text-sm hover:bg-gray-700 rounded-md transition-colors duration-200"
                onClick={handleAddCard}
              >
                <PlusCircle className="h-4 w-4 mr-1 inline" /> Add a card
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
      
      <ListForm
        isOpen={isListEditModalOpen}
        onClose={() => setListEditModalOpen(false)}
        boardId={boardId}
        list={list}
      />
      
      <CardForm
        isOpen={isCardModalOpen}
        onClose={() => { setCardModalOpen(false); setCardToEdit(null); }}
        listId={list.id}
        card={cardToEdit}
      />
      
      <ConfirmModal
        title="Delete List"
        description="Are you sure you want to delete this list? All cards in this list will also be deleted. This action cannot be undone."
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteList}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteListMutation.isPending}
      />
    </>
  );
}
