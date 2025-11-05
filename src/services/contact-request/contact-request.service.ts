import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type {
  IContact,
  IGetContactsRequest,
  IGetContactsResponse,
  IUpdateContactStatusRequest,
  IUpdateContactStatusResponse,
  ICreateContactRequest,
  ICreateContactResponse
} from "@/types/contact-request";

export const contactRequestApi = createApi({
  reducerPath: "ContactRequestApi",
  baseQuery: async (args) => {
    const { url, method, data, params, config } = args as any;
    return baseQuery({ url, method, data, params, config });
  },
  tagTypes: ["ContactRequest"],
  endpoints: (builder) => ({
    getContacts: builder.query<IGetContactsResponse, IGetContactsRequest>({
      query: (params) => ({
        url: "/landlords/contacts",
        method: "GET",
        params,
      }),
      providesTags: ["ContactRequest"],
    }),

    updateContactStatus: builder.mutation<IUpdateContactStatusResponse, { id: string; data: IUpdateContactStatusRequest }
    >({
    query: ({ id, data }) => ({
        url: `/landlords/contacts/${id}/status`,
        method: "PATCH",
        data,
    }),
    invalidatesTags: ["ContactRequest"],
    }),

    createContactRequest: builder.mutation<ICreateContactResponse, ICreateContactRequest
    >({
    query: (data) => ({
        url: `/contacts`,
        method: "POST",
        data,
    }),
    invalidatesTags: ["ContactRequest"],
    }),

    getContactsResident: builder.query<IGetContactsResponse, IGetContactsRequest>({
      query: (params) => ({
        url: "/contacts",
        method: "GET",
        params,
      }),
      providesTags: ["ContactRequest"],
    }),

    updateContactStatusResident: builder.mutation<IUpdateContactStatusResponse, { id: string; data: IUpdateContactStatusRequest }
    >({
    query: ({ id, data }) => ({
        url: `/contacts/${id}/status`,
        method: "PATCH",
        data,
    }),
    invalidatesTags: ["ContactRequest"],
    }),
  }),
});

export const {
    useGetContactsQuery,
    useUpdateContactStatusMutation,
    useCreateContactRequestMutation,
    useGetContactsResidentQuery,
    useUpdateContactStatusResidentMutation,
} = contactRequestApi;