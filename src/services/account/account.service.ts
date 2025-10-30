import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { 
  IAccount,
  IAccountProfile,
  GetAccountsResponse, 
  UpdateAccountStatusResponse, 
  UpdateAccountStatusRequest, 
  GetAccountsRequest, 
  UpdateAccountRoleRequest, 
  UpdateAccountRoleResponse 
} from "@/types/account";

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: async (args) => {
    const { url, method, data, params } = args;
    return baseQuery({ url, method, data, params });
  },
  tagTypes: ["Account"],
  endpoints: (builder) => ({
    getAccounts: builder.query<GetAccountsResponse, GetAccountsRequest>({
      query: ({ page, limit, search, role }) => {
        const params = new URLSearchParams({
          page: page?.toString() || "1",
          limit: limit?.toString() || "20",
        });
        
        if (search) {
          params.append("search", search);
        }
        
        if (role && role !== "all") {
          params.append("role", role);
        }
        
        return {
          url: `/admin/accounts?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Account"],
    }),

    getAccountById: builder.query<IAccountProfile, string>({
      query: (id) => ({
        url: `/admin/accounts/${id}`,
        method: "GET",
      }),
      providesTags: ["Account"],
    }),
    
    updateAccountStatus: builder.mutation<UpdateAccountStatusResponse, UpdateAccountStatusRequest>({
      query: ({ id }) => ({
        url: `/admin/accounts/${id}/status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Account"],
    }),
    
    updateAccountRole: builder.mutation<UpdateAccountRoleResponse, UpdateAccountRoleRequest>({
      query: ({ id, role }) => ({
        url: `/admin/accounts/${id}/role`,
        method: "PATCH",
        data: { role },
      }),
      invalidatesTags: ["Account"],
    }),
  }),
});

export const { 
  useGetAccountsQuery, 
  useUpdateAccountStatusMutation, 
  useUpdateAccountRoleMutation,
  useGetAccountByIdQuery
} = accountApi;