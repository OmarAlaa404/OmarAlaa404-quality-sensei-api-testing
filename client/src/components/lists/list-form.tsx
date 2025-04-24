import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLists } from "@/hooks/use-lists";
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
import { List } from "@shared/schema";

const listSchema = z.object({
  title: z.string().min(1, "List title is required"),
});

type ListFormData = z.infer<typeof listSchema>;

interface ListFormProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
  list?: List;
}

export default function ListForm({ isOpen, onClose, boardId, list }: ListFormProps) {
  const { createListMutation, updateListMutation } = useLists(boardId);
  const isEditMode = !!list;
  
  const form = useForm<ListFormData>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      title: list?.title || ""
    }
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: list?.title || ""
      });
    }
  }, [form, isOpen, list]);
  
  const onSubmit = (data: ListFormData) => {
    if (isEditMode && list) {
      updateListMutation.mutate({
        id: list.id,
        data
      }, {
        onSuccess: () => onClose()
      });
    } else {
      createListMutation.mutate(data, {
        onSuccess: () => onClose()
      });
    }
  };
  
  return (
    <Modal
      title={isEditMode ? "Edit List" : "Add New List"}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={createListMutation.isPending || updateListMutation.isPending}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={createListMutation.isPending || updateListMutation.isPending}
          >
            {createListMutation.isPending || updateListMutation.isPending
              ? "Saving..."
              : isEditMode ? "Save Changes" : "Add List"}
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
                <FormLabel className="text-white">List Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter list title" 
                    {...field} 
                    className="bg-gray-700 border-gray-600 text-white"
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
