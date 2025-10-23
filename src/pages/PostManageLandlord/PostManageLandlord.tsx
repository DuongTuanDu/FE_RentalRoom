import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  FileText,
  MapPin,
  DollarSign,
  Square,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useSoftDeletePostMutation,
} from "@/services/post/post.service";
import { STATUS_COLORS, STATUS_LABELS } from "./const/data";
import { Spinner } from "@/components/ui/spinner";
import { ModalPost } from "./components/ModalPost";
import { DeletePostPopover } from "./components/DeletePostPopover";
import { PostDetail } from "./components/PostDetail";
import { toast } from "sonner";
import type { IPost } from "@/types/post";

const PostManageLandlord = () => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<IPost | null>(null);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState<IPost | null>(null);

  // Post detail drawer states
  const [isPostDetailOpen, setIsPostDetailOpen] = useState(false);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);

  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  // Debounced search
  const debouncedSetSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        setDebouncedSearch(value);
      }, 700),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  // Get posts data
  const { data: postsData, isLoading, error } = useGetPostsQuery();

  // Mutations
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [softDeletePost, { isLoading: isDeleting }] =
    useSoftDeletePostMutation();

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    if (!postsData?.data) return [];

    let filtered = postsData.data;

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.address.toLowerCase().includes(searchLower) ||
          post.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [postsData?.data, debouncedSearch]);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: IPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (post: IPost) => {
    setDeletingPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenPostDetail = (postId: string) => {
    setViewingPostId(postId);
    setIsPostDetailOpen(true);
  };

  const handleSubmitPost = async (formData: FormData) => {
    try {
      if (editingPost) {
        // Update logic here if needed
        toast.success("Cập nhật bài đăng thành công");
      } else {
        await createPost(formData).unwrap();
        toast.success("Tạo bài đăng thành công");
      }
      setIsModalOpen(false);
      setEditingPost(null);
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;

    try {
      await softDeletePost(deletingPost._id).unwrap();
      toast.success("Xóa bài đăng thành công");
      setIsDeleteDialogOpen(false);
      setDeletingPost(null);
    } catch (error: any) {
      toast.error(error?.message?.message || "Có lỗi xảy ra");
    }
  };

  if (error) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="text-center py-8">
          <p className="text-destructive">Có lỗi xảy ra khi tải dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Quản lý Bài đăng
          </h1>
          <p className="text-muted-foreground">
            Quản lý các bài đăng cho thuê phòng trọ
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={handleOpenCreateModal}>
            <Plus className="h-4 w-4" />
            Tạo Bài đăng Mới
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
          <CardDescription>
            Tìm kiếm bài đăng theo tiêu đề, địa chỉ hoặc mô tả
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm theo tiêu đề, địa chỉ, mô tả..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Posts Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Danh sách Bài đăng ({filteredPosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>Không có bài đăng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card
                  key={post._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Image Section */}
                      <div className="w-64 h-48 bg-muted flex-shrink-0 relative ml-5">
                        {post.images && post.images.length > 0 ? (
                          <div className="relative w-full h-full">
                            <img
                              src={post.images[0]}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                            {post.images.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                +{post.images.length - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <ImageIcon className="h-12 w-12" />
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 px-6 py-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span className="line-clamp-1">
                                  {post.address}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge
                              variant="secondary"
                              className={
                                STATUS_COLORS[
                                  post.status as keyof typeof STATUS_COLORS
                                ] || "bg-gray-100 text-gray-800"
                              }
                            >
                              {STATUS_LABELS[
                                post.status as keyof typeof STATUS_LABELS
                              ] || post.status}
                            </Badge>
                            {post.isDraft && (
                              <Badge variant="outline">Bản nháp</Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="text-xl font-bold text-green-600">
                              {formatPrice(post.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Square className="h-5 w-5 text-blue-600" />
                            <span className="text-lg font-semibold text-blue-600">
                              {post.area} m²
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.description.replace(/<[^>]*>/g, "")}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPostDetail(post._id)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Xem
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditModal(post)}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Sửa
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeleteDialog(post)}
                              className="gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Post (Create/Edit) */}
      <ModalPost
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingPost(null);
          }
        }}
        post={editingPost}
        onSubmit={handleSubmitPost}
        isLoading={isCreating}
      />

      {/* Delete Post Popover */}
      <DeletePostPopover
        open={isDeleteDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingPost(null);
          }
        }}
        post={deletingPost}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Post Detail Drawer */}
      <PostDetail
        open={isPostDetailOpen}
        onOpenChange={(open: boolean) => {
          setIsPostDetailOpen(open);
          if (!open) {
            setViewingPostId(null);
          }
        }}
        postId={viewingPostId}
      />
    </div>
  );
};

export default PostManageLandlord;
