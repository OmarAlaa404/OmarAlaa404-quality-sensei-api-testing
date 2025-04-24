import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBoards } from "@/hooks/use-boards";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const boardSchema = z.object({
  name: z.string().min(1, "Board name is required"),
  description: z.string().optional()
});

type BoardFormData = z.infer<typeof boardSchema>;

interface BoardFormProps {
  isOpen: boolean;
  onClose: () => void;
  board: { id: number; name: string; description: string | null } | null;
}

export default function BoardForm({ isOpen, onClose, board }: BoardFormProps) {
  const { createBoardMutation, updateBoardMutation } = useBoards();
  const isEditMode = !!board;
  
  const form = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      name: board?.name || "",
      description: board?.description || ""
    }
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: board?.name || "",
        description: board?.description || ""
      });
    }
  }, [form, isOpen, board]);
  
  const onSubmit = (data: BoardFormData) => {
    if (isEditMode && board) {
      updateBoardMutation.mutate({
        id: board.id,
        data
      }, {
        onSuccess: () => onClose()
      });
    } else {
      createBoardMutation.mutate(data, {
        onSuccess: () => onClose()
      });
    }
  };
  
  return (
    <Modal
      title={isEditMode ? "Edit Board" : "Create New Board"}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={createBoardMutation.isPending || updateBoardMutation.isPending}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createBoardMutation.isPending || updateBoardMutation.isPending}
          >
            {createBoardMutation.isPending || updateBoardMutation.isPending
              ? "Saving..."
              : isEditMode ? "Save Changes" : "Create Board"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Board Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter board name" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter description (optional)" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white resize-none h-24"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
