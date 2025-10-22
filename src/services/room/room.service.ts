import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/lib/api-client";
import type { IRoomListResponse, IRoom, CreateRoomRequest } from "@/types/room";

// Custom baseQuery for handling FormData
const customBaseQuery = async (args: any) => {
  const { url, method, data, params } = args;
  
  // If data is FormData, we need to handle it specially
  if (data instanceof FormData) {
    console.log('Sending FormData with files:', Array.from(data.entries()));
  }
  
  return baseQuery({ url, method, data, params });
};

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    getRooms: builder.query<
      IRoomListResponse,
      {
        buildingId?: string;
        floorId?: string;
        status?: "available" | "occupied" | "maintenance";
        q?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ buildingId, floorId, status, q, page, limit }) => {
        const params = new URLSearchParams();
        
        if (buildingId) params.append("buildingId", buildingId);
        if (floorId) params.append("floorId", floorId);
        if (status) params.append("status", status);
        if (q) params.append("q", q);
        params.append("page", page?.toString() || "1");
        params.append("limit", limit?.toString() || "20");

        return {
          url: `/rooms?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Room"],
    }),

    createRoom: builder.mutation<IRoom, CreateRoomRequest>({
      query: (data) => {
        console.log('Creating room with data:', data);
        
        const formData = new FormData();
        
        // Add basic fields
        formData.append("buildingId", data.buildingId);
        formData.append("floorId", data.floorId);
        formData.append("roomNumber", data.roomNumber);
        formData.append("area", data.area.toString());
        formData.append("price", data.price.toString());
        formData.append("maxTenants", data.maxTenants.toString());
        formData.append("status", data.status);
        if (data.description) {
          formData.append("description", data.description);
        }
        
        // Add images if provided
        if (data.images && data.images.length > 0) {
          console.log('Adding images to FormData:', data.images.length, 'files');
          data.images.forEach((file, index) => {
            console.log(`Adding file ${index}:`, file.name, file.size, file.type);
            formData.append("images", file);
          });
        } else {
          console.log('No images to add');
        }
        
        // Debug: Log FormData contents
        console.log('FormData entries:');
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, value.name, value.size, value.type);
          } else {
            console.log(`${key}:`, value);
          }
        }
        
        return {
          url: "/rooms",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: ["Room"],
    }),

    updateRoom: builder.mutation<IRoom, { id: string; data: any }>({
      query: ({ id, data }) => {
        console.log('Updating room with data:', { id, data });
        
        const formData = new FormData();
        
        // Add basic fields
        if (data.roomNumber !== undefined) formData.append("roomNumber", data.roomNumber);
        if (data.area !== undefined) formData.append("area", data.area.toString());
        if (data.price !== undefined) formData.append("price", data.price.toString());
        if (data.maxTenants !== undefined) formData.append("maxTenants", data.maxTenants.toString());
        if (data.status !== undefined) formData.append("status", data.status);
        if (data.description !== undefined) formData.append("description", data.description);
        if (data.floorId !== undefined) formData.append("floorId", data.floorId);
        
        // Add image management fields
        if (data.removeUrls && data.removeUrls.length > 0) {
          console.log('Adding removeUrls:', data.removeUrls);
          formData.append("removeUrls", JSON.stringify(data.removeUrls));
        }
        if (data.replaceAllImages !== undefined) {
          console.log('Adding replaceAllImages:', data.replaceAllImages);
          formData.append("replaceAllImages", data.replaceAllImages.toString());
        }
        
        // Add new images if provided
        if (data.images && data.images.length > 0) {
          console.log('Adding new images:', data.images.length, 'files');
          data.images.forEach((file: File, index: number) => {
            console.log(`Adding file ${index}:`, file.name, file.size, file.type);
            formData.append("images", file);
          });
        } else {
          console.log('No new images to add');
        }
        
        // Debug: Log FormData contents
        console.log('Update FormData entries:');
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, value.name, value.size, value.type);
          } else {
            console.log(`${key}:`, value);
          }
        }
        
        return {
          url: `/rooms/${id}`,
          method: "PUT",
          data: formData,
        };
      },
      invalidatesTags: ["Room"],
    }),

    deleteRoom: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),

    addRoomImages: builder.mutation<{ message: string; images: string[] }, { id: string; images: File[] }>({
      query: ({ id, images }) => {
        const formData = new FormData();
        images.forEach((file) => {
          formData.append("images", file);
        });
        
        return {
          url: `/rooms/${id}/images`,
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: ["Room"],
    }),

    removeRoomImages: builder.mutation<{ message: string; images: string[]; deleted: number }, { id: string; urls: string[] }>({
      query: ({ id, urls }) => ({
        url: `/rooms/${id}/images`,
        method: "DELETE",
        data: { urls },
      }),
      invalidatesTags: ["Room"],
    }),
    getRoomById: builder.query<IRoom, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: "GET",
      }),
      providesTags: ["Room"],
    }),

    restoreRoom: builder.mutation<IRoomListResponse, string>({
      query: (id) => ({
        url: `/rooms/${id}/restore`,
        method: "POST",
      }),
      invalidatesTags: ["Room"],
    }),

    updateStatusRoom: builder.mutation<IRoomListResponse, { id: string; status: "available" | "rented" | "maintenance" }>({
      query: ({ id, status }) => ({
        url: `/rooms/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["Room"],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useAddRoomImagesMutation,
  useRemoveRoomImagesMutation,
  useGetRoomByIdQuery,
  useRestoreRoomMutation,
  useUpdateStatusRoomMutation
} = roomApi;