import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCards } from "@/hooks/use-cards";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@shared/schema";

// Schema for form validation
const cardSchema = z.object({
  title: z.string().min(1, "Card title is required"),
  description: z.string().optional(),
  status: z.string().optional(),
  dueDate: z.string().optional(),
  labels: z.string().optional(), // We'll split this into an array when submitting
  attachments: z.string().optional() // We'll split this into an array when submitting
});

type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
  card?: Card | null;
}

export default function CardForm({ isOpen, onClose, listId, card }: CardFormProps) {
  const { createCardMutation, updateCardMutation } = useCards(listId);
  const isEditMode = !!card;
  
  // Convert card labels and attachments arrays to comma-separated strings for the form
  const getDefaultLabels = () => {
    if (!card || !card.labels) return "";
    return card.labels.join(", ");
  };
  
  const getDefaultAttachments = () => {
    if (!card || !card.attachments) return "";
    return card.attachments.join(", ");
  };
  
  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: card?.title || "",
      description: card?.description || "",
      status: card?.status || "todo",
      dueDate: card?.dueDate || "",
      labels: getDefaultLabels(),
      attachments: getDefaultAttachments()
    }
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: card?.title || "",
        description: card?.description || "",
        status: card?.status || "todo",
        dueDate: card?.dueDate || "",
        labels: getDefaultLabels(),
        attachments: getDefaultAttachments()
      });
    }
  }, [form, isOpen, card]);
  
  const onSubmit = (data: CardFormData) => {
    // Process the string inputs into arrays for labels and attachments
    const formattedData = {
      ...data,
      labels: data.labels ? data.labels.split(",").map(label => label.trim()) : [],
      attachments: data.attachments ? data.attachments.split(",").map(att => att.trim()) : []
    };
    
    if (isEditMode && card) {
      updateCardMutation.mutate({
        id: card.id,
        data: formattedData
      }, {
        onSuccess: () => onClose()
      });
    } else {
      createCardMutation.mutate(formattedData, {
        onSuccess: () => onClose()
      });
    }
  };
  
  return (
    <Modal
      title={isEditMode ? "Edit Card" : "Add New Card"}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={createCardMutation.isPending || updateCardMutation.isPending}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createCardMutation.isPending || updateCardMutation.isPending}
          >
            {createCardMutation.isPending || updateCardMutation.isPending
              ? "Saving..."
              : isEditMode ? "Save Changes" : "Add Card"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Card Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter card title" 
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Status</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., todo, in-progress, done" 
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Due Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="labels"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Labels</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="critical, backend, frontend (comma-separated)" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </FormControl>
                <FormDescription className="text-gray-400 text-xs">
                  Enter labels separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Attachments</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="file1.docx, file2.pdf (comma-separated)" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </FormControl>
                <FormDescription className="text-gray-400 text-xs">
                  Enter filenames separated by commas (simulated)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
