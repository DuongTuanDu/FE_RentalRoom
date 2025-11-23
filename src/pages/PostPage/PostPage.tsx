import { useState, useEffect, useRef } from "react";
import { Search, Home, X, Clock, RotateCcw } from "lucide-react";
import { useGetPostsResidentsQuery } from "@/services/post/post.service";
import PostCard from "@/components/PostCard";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useViewedPosts } from "@/hooks/useViewedPosts";

const PostsPage = () => {
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "new" | "viewed">("all");
  const [accumulatedPosts, setAccumulatedPosts] = useState<any[]>([]);

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const { data, isLoading, isFetching } = useGetPostsResidentsQuery({
    page,
    limit: 12,
    keyword: debouncedKeyword || undefined,
  });

  const { viewedPosts, addViewedPost } = useViewedPosts();
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();
  const observer = useRef<IntersectionObserver>(
    new IntersectionObserver(() => {})
  );
  const lastPostElementRef = useRef<HTMLDivElement>(null);

  // Reset page khi debounced keyword hoặc tab thay đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, activeTab]);

  // Tích lũy posts từ các pages
  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      if (page === 1) {
        // Reset khi về page 1 (khi search/tab thay đổi hoặc reset)
        setAccumulatedPosts(data.data);
      } else {
        // Thêm posts mới vào danh sách đã tích lũy
        setAccumulatedPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const newPosts = data.data.filter(
            (p: any) => !existingIds.has(p._id)
          );
          return [...prev, ...newPosts];
        });
      }
    }
  }, [data?.data, page]);

  // Lấy posts từ accumulatedPosts hoặc data hiện tại
  const allPosts =
    accumulatedPosts.length > 0 ? accumulatedPosts : data?.data || [];

  const getFilteredPosts = () => {
    // Với tab "all", không cần filter (API đã xử lý search)
    if (activeTab === "all") {
      return allPosts;
    }

    let filtered = allPosts;

    // Filter theo tab
    if (activeTab === "new") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter((post: any) => {
        const postDate = new Date(post.createdAt);
        return postDate >= sevenDaysAgo;
      });
      filtered = [...filtered].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (activeTab === "viewed") {
      filtered = filtered.filter((post: any) =>
        viewedPosts.some((vp) => vp._id === post._id)
      );
    }

    return filtered;
  };

  const posts = getFilteredPosts();
  const total = posts.length;

  useEffect(() => {
    if (isFetching) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        accumulatedPosts.length < (data?.pagination.total || 0)
      ) {
        setPage((prev) => prev + 1);
      }
    });

    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isFetching, accumulatedPosts.length, data?.pagination.total]);

  const tabs = [
    { id: "all", label: "Tất cả", icon: Home },
    { id: "viewed", label: "Vừa xem", icon: Clock },
  ];

  const resetFilters = () => {
    setSearchKeyword("");
    setPage(1);
  };

  const hasActiveFilters = searchKeyword.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tìm phòng trọ
          </h1>
          <p className="text-gray-600">
            Khám phá hàng ngàn phòng trọ phù hợp với bạn
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên phòng, địa chỉ, tòa nhà..."
              className="pl-12 pr-12 py-6 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div>
            <div className="inline-flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Tabs */}

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 inline-flex items-center gap-1">
              {isLoading ? (
                <Spinner fontSize="sm" />
              ) : (
                <span className="text-blue-600">{total.toLocaleString()}</span>
              )}
              <span className="text-gray-700">bài đăng</span>
            </h2>
            {debouncedKeyword && !isLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Kết quả tìm kiếm cho{" "}
                <span className="font-semibold text-gray-700">
                  "{debouncedKeyword}"
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading && page === 1 ? (
          <div className="flex justify-center items-center py-20">
            <Spinner fontSize="lg" />
          </div>
        ) : !isLoading && posts.length === 0 && allPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {debouncedKeyword
                ? `Không tìm thấy kết quả`
                : activeTab === "viewed"
                ? "Bạn chưa xem phòng trọ nào"
                : activeTab === "new"
                ? "Không có phòng trọ mới"
                : "Không tìm thấy phòng trọ nào"}
            </h3>
            <p className="text-gray-500 mb-1">
              {debouncedKeyword
                ? `Không có phòng trọ nào khớp với "${debouncedKeyword}"`
                : activeTab === "viewed"
                ? "Hãy xem các phòng trọ để chúng xuất hiện ở đây"
                : activeTab === "new"
                ? "Không có phòng trọ mới trong 7 ngày qua"
                : "Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
            </p>
            {hasActiveFilters && (
              <Button onClick={resetFilters} variant="outline" className="mt-4">
                <RotateCcw className="w-4 h-4 mr-2" />
                Đặt lại bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post: any, index: number) => (
              <div
                key={post._id}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
                className="transition-transform hover:scale-[1.02]"
              >
                <PostCard
                  post={post}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                  onViewDetail={addViewedPost}
                />
              </div>
            ))}
          </div>
        )}

        {/* Loading More */}
        {isFetching && page > 1 && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3 text-gray-600">
              <Spinner />
              <span className="text-sm">Đang tải thêm...</span>
            </div>
          </div>
        )}

        {/* End Message */}
        {!isFetching &&
          !isLoading &&
          posts.length > 0 &&
          accumulatedPosts.length >= (data?.pagination.total || 0) && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">
                  Đã hiển thị tất cả kết quả
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default PostsPage;
