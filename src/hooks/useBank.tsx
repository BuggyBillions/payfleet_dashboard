import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllBanksService,
  getAccountService,
  createAccountService,
  resolveAccountService,
  type BankItem,
  type BankAccountDetails,
  type CreateAccountPayload,
} from "../services/bankService";
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";

/**
 * Hook to get list of supported banks with search query (/all-banks?search=...)
 */
export const useAllBanks = (search = "") => {
  return useQuery<BankItem[]>({
    queryKey: ["banks", search],
    queryFn: () => getAllBanksService(search),
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to get current active bank account details (/get-account)
 */
export const useAccount = () => {
  return useQuery<BankAccountDetails | null>({
    queryKey: ["account"],
    queryFn: () => getAccountService(),
  });
};

/**
 * Mutation to create/save bank account (/create-account)
 */
export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => createAccountService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Bank account saved successfully!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save bank account"));
    },
  });
};

/**
 * Mutation to resolve account name (/resolve-account)
 */
export const useResolveAccount = () => {
  return useMutation({
    mutationFn: ({
      account_number,
      bank_code,
    }: {
      account_number: string | number;
      bank_code: string;
    }) => resolveAccountService({ account_number, bank_code }),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not resolve account name"));
    },
  });
};
