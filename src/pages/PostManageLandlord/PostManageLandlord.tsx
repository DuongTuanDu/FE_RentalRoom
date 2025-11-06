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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import type { IPost } from "@/types/post";
import { useNavigate } from "react-router-dom";

const PostManageLandlord = () => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [isDraft, setIsDraft] = useState<boolean | undefined>(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<IPost | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState<IPost | null>(null);

  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

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
      setPage(1);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const {
    data: postsData,
    isLoading,
    error,
  } = useGetPostsQuery({ page, limit, isDraft });

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [softDeletePost, { isLoading: isDeleting }] =
    useSoftDeletePostMutation();

  const filteredPosts = useMemo(() => {
    if (!postsData?.data) return [];

    let filtered = postsData.data;

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

  const handleSubmitPost = async (formData: FormData) => {
    try {
      if (editingPost) {
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
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm theo tiêu đề, địa chỉ, mô tả..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select
                value={
                  isDraft === undefined
                    ? "all"
                    : isDraft
                    ? "draft"
                    : "published"
                }
                onValueChange={(value) => {
                  if (value === "all") {
                    setIsDraft(undefined);
                  } else if (value === "draft") {
                    setIsDraft(true);
                  } else {
                    setIsDraft(false);
                  }
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="published">Đã đăng</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 bài đăng</SelectItem>
                  <SelectItem value="12">12 bài đăng</SelectItem>
                  <SelectItem value="16">16 bài đăng</SelectItem>
                  <SelectItem value="24">24 bài đăng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Cards */}
      <div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post._id}
                className="overflow-hidden group hover:shadow-lg transition-all duration-200 border border-border py-0"
              >
                {/* Image */}
                <div className="relative">
                  {post.images && post.images.length > 0 ? (
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}

                  {/* Badge trạng thái */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
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
                    {post.isDraft && <Badge variant="outline">Bản nháp</Badge>}
                  </div>

                  {/* Số ảnh */}
                  {post.images && post.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      +{post.images.length - 1}
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="px-4 pb-4">
                  {/* Tiêu đề */}
                  <h3 className="text-base font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  {/* Địa chỉ + Ngày tạo */}
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{post.address}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* Giá + Diện tích */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <DollarSign className="h-3 w-3 text-green-600 shrink-0" />
                      <span className="text-md font-bold text-green-700 truncate">
                        {`${formatPrice(post.priceMin)} - ${formatPrice(
                          post.priceMax
                        )}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Square className="h-3 w-3 text-blue-600 shrink-0" />
                      <span className="text-xs font-medium text-blue-700 truncate">
                        {post.areaMin} - {post.areaMax} m²
                      </span>
                    </div>
                  </div>

                  {/* Mô tả ngắn */}
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-4">
                    {post.description.replace(/<[^>]*>/g, "")}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/landlord/posts/${post.slug + `-` + post._id}`
                        )
                      }
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Xem
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(post)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(post)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(() => {
          const total = postsData?.pagination?.total ?? 0;
          const totalPages =
            postsData?.pagination?.totalPages ??
            (total ? Math.ceil(total / limit) : 0);
          const currentPage = postsData?.pagination?.page ?? page;
          const currentLimit = postsData?.pagination?.limit ?? limit;
          const startItem =
            total === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
          const endItem = Math.min(
            currentPage * currentLimit,
            total || currentPage * currentLimit
          );
          return (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-medium">{startItem}</span> đến{" "}
                <span className="font-medium">{endItem}</span> trong tổng số{" "}
                <span className="font-medium">{total}</span> bài đăng
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, totalPages || 0) },
                    (_, i) => {
                      let pageNum: number;
                      if ((totalPages || 0) <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (totalPages && currentPage >= totalPages - 2) {
                        pageNum = (totalPages as number) - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((prev) =>
                      totalPages ? Math.min(totalPages, prev + 1) : prev + 1
                    )
                  }
                  disabled={totalPages ? currentPage === totalPages : false}
                >
                  Sau
                </Button>
              </div>
            </div>
          );
        })()}
      </div>

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
    </div>
  );
};

export default PostManageLandlord;
