import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Board, InsertBoard } from "@shared/schema";

export function useBoards() {
  const { toast } = useToast();

  const {
    data: boards = [],
    isLoading,
    error,
  } = useQuery<Board[]>({
    queryKey: ["/api/boards"],
  });

  const createBoardMutation = useMutation({
    mutationFn: async (newBoard: Omit<InsertBoard, "userId">) => {
      const res = await apiRequest("POST", "/api/boards", newBoard);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      toast({
        title: "Board Created",
        description: "Your new board has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create board",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Board> }) => {
      const res = await apiRequest("PUT", `/api/boards/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      toast({
        title: "Board Updated",
        description: "Board has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update board",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/boards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      toast({
        title: "Board Deleted",
        description: "Board has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete board",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    boards,
    isLoading,
    error,
    createBoardMutation,
    updateBoardMutation,
    deleteBoardMutation,
  };
}

export function useBoard(id: number | null) {
  const { toast } = useToast();

  const {
    data: board,
    isLoading,
    error,
  } = useQuery<Board>({
    queryKey: [`/api/boards/${id}`],
    enabled: !!id,
  });

  return {
    board,
    isLoading,
    error,
  };
}
