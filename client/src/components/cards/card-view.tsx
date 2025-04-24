import { useState } from "react";
import { 
  MoreVertical, 
  Calendar, 
  Paperclip 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/modal";
import LabelBadge, { getLabelColor } from "@/components/ui/label-badge";
import { formatDate } from "@/lib/date-utils";
import { useCards } from "@/hooks/use-cards";
import { Card as CardType } from "@shared/schema";

interface CardViewProps {
  card: CardType;
  onEdit: () => void;
}

export default function CardView({ card, onEdit }: CardViewProps) {
  const { deleteCardMutation } = useCards(card.listId);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const handleDelete = () => {
    deleteCardMutation.mutate(card.id, {
      onSuccess: () => setDeleteModalOpen(false)
    });
  };
  
  return (
    <>
      <div className="bg-gray-700 rounded-md p-3 mb-2 shadow card-transition">
        <div className="flex justify-between">
          <h4 className="font-medium text-white">{card.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-gray-700"
                onClick={onEdit}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-gray-700 text-red-400 hover:text-red-300"
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {card.description && (
          <p className="text-sm text-gray-400 mt-1">{card.description}</p>
        )}
        
        {card.labels && card.labels.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {card.labels.map((label, index) => (
              <LabelBadge
                key={index}
                text={label}
                color={getLabelColor(label)}
              />
            ))}
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between text-xs">
          {card.dueDate && (
            <span className="text-gray-400 flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> 
              {formatDate(card.dueDate)}
            </span>
          )}
          
          {card.attachments && card.attachments.length > 0 && (
            <div className="flex space-x-2">
              <div className="text-gray-400">
                <Paperclip className="h-3 w-3 inline mr-1" /> 
                {card.attachments.length}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ConfirmModal
        title="Delete Card"
        description="Are you sure you want to delete this card? This action cannot be undone."
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteCardMutation.isPending}
      />
    </>
  );
}
