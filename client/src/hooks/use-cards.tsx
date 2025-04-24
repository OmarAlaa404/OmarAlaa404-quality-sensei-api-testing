import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, InsertCard } from "@shared/schema";

export function useCards(listId: number | null) {
  const { toast } = useToast();

  const {
    data: cards = [],
    isLoading,
    error,
  } = useQuery<Card[]>({
    queryKey: [`/api/lists/${listId}/cards`],
    enabled: !!listId,
  });

  const createCardMutation = useMutation({
    mutationFn: async (newCard: Omit<InsertCard, "listId">) => {
      if (!listId) throw new Error("List ID is required");
      const res = await apiRequest("POST", `/api/lists/${listId}/cards`, {
        ...newCard,
        listId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/cards`] });
      toast({
        title: "Card Created",
        description: "Your new card has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Card> }) => {
      if (!listId) throw new Error("List ID is required");
      const res = await apiRequest("PATCH", `/api/lists/${listId}/cards/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/cards`] });
      toast({
        title: "Card Updated",
        description: "Card has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!listId) throw new Error("List ID is required");
      await apiRequest("DELETE", `/api/lists/${listId}/cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/lists/${listId}/cards`] });
      toast({
        title: "Card Deleted",
        description: "Card has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    cards,
    isLoading,
    error,
    createCardMutation,
    updateCardMutation,
    deleteCardMutation,
  };
}
