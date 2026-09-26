import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSupportMessagesService,
  sendUserMessageService,
  markMessagesAsReadService,
  getUnreadCountService,
  getAdminSupportConversationsService,
  getAdminSupportConversationByIdService,
  replyToCompanyService,
  type SupportMessagePayload,
} from "../services/supportService";
import type { ChatMessage, Conversation } from "../lib/interfaces";
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";

export interface SupportQueryOptions {
  refetchInterval?: number | false;
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

/**
 * Hook for company support messages (GET /support/messages)
 */
export const useSupportMessages = (options?: SupportQueryOptions) => {
  return useQuery<ChatMessage[]>({
    queryKey: ["support", "messages"],
    queryFn: () => getSupportMessagesService(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: options?.staleTime ?? 10000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
};

/**
 * Hook for company sending a message to support (POST /support/messages)
 */
export const useSendUserMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupportMessagePayload | string) =>
      sendUserMessageService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "messages"] });
      queryClient.invalidateQueries({ queryKey: ["support", "unread-count"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to send message"));
    },
  });
};

/**
 * Hook for marking company messages as read (POST /support/messages/read)
 */
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => markMessagesAsReadService(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "unread-count"] });
    },
  });
};

/**
 * Hook for company unread messages count (GET /support/unread-count)
 */
export const useUnreadCount = (options?: SupportQueryOptions) => {
  return useQuery<number>({
    queryKey: ["support", "unread-count"],
    queryFn: () => getUnreadCountService(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: options?.staleTime ?? 30000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
};

/**
 * Hook for admin / support / finance to list all client conversations (GET /admin/support/conversations)
 */
export const useAdminSupportConversations = (
  params?: Record<string, unknown>,
  options?: SupportQueryOptions
) => {
  return useQuery<Conversation[]>({
    queryKey: ["admin", "support", "conversations", params],
    queryFn: () => getAdminSupportConversationsService(params),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: options?.staleTime ?? 10000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
};

/**
 * Hook for admin / support / finance to get each user conversation & messages (GET /admin/support/conversations/{id})
 */
export const useAdminSupportConversationById = (
  id?: string | number | null,
  options?: SupportQueryOptions
) => {
  const isRealBackendId = Boolean(
    id &&
    String(id).trim() !== "" &&
    !String(id).startsWith("conv-") &&
    !String(id).startsWith("pending-") &&
    String(id) !== "support-desk"
  );
  return useQuery<Conversation>({
    queryKey: ["admin", "support", "conversation", id ? String(id) : id],
    queryFn: () => getAdminSupportConversationByIdService(id!),
    enabled: (options?.enabled ?? true) && isRealBackendId,
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: options?.staleTime ?? 8000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  });
};

/**
 * Hook for admin / support / finance to reply to a company (POST /admin/support/conversations/{id}/messages)
 */
export const useReplyToCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string | number;
      payload: SupportMessagePayload | string;
    }) => replyToCompanyService(conversationId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "admin",
          "support",
          "conversation",
          String(variables.conversationId),
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "conversation"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "conversations"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to send reply"));
    },
  });
};
