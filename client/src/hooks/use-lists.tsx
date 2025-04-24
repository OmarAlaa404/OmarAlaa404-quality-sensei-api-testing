import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { List, InsertList } from "@shared/schema";

export function useLists(boardId: number | null) {
  const { toast } = useToast();

  const {
    data: lists = [],
    isLoading,
    error,
  } = useQuery<List[]>({
    queryKey: [`/api/boards/${boardId}/lists`],
    enabled: !!boardId,
  });

  const createListMutation = useMutation({
    mutationFn: async (newList: Omit<InsertList, "boardId">) => {
      if (!boardId) throw new Error("Board ID is required");
      const res = await apiRequest("POST", `/api/boards/${boardId}/lists`, {
        ...newList,
        boardId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}/lists`] });
      toast({
        title: "List Created",
        description: "Your new list has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<List> }) => {
      if (!boardId) throw new Error("Board ID is required");
      const res = await apiRequest("PUT", `/api/boards/${boardId}/lists/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}/lists`] });
      toast({
        title: "List Updated",
        description: "List has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!boardId) throw new Error("Board ID is required");
      await apiRequest("DELETE", `/api/boards/${boardId}/lists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}/lists`] });
      toast({
        title: "List Deleted",
        description: "List has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete list",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    lists,
    isLoading,
    error,
    createListMutation,
    updateListMutation,
    deleteListMutation,
  };
}
