import { useState, useEffect, useRef } from "react";
import { Search, Home, Filter, X, ChevronDown, Clock, Sparkles } from "lucide-react";
import { useGetPostsResidentsQuery } from "@/services/post/post.service";
import PostCard from "@/components/PostCard";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { useViewedPosts } from "@/hooks/useViewedPosts";
import Header from "@/layouts/header/Header";

const PostsPage = () => {
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [areaRange, setAreaRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "new" | "viewed">("all");

  const { data, isLoading, isFetching } = useGetPostsResidentsQuery({
    page,
    limit: 12,
  });

  const allPosts = data?.data || [];
  const { viewedPosts, addViewedPost } = useViewedPosts();
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();
  const observer = useRef<IntersectionObserver>(new IntersectionObserver(() => {}));
  const lastPostElementRef = useRef<HTMLDivElement>(null);

  const getFilteredPosts = () => {
    let filtered = allPosts;

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter((post: any) => {
        const title = post.title?.toLowerCase() || "";
        const buildingName = post.buildingId?.name?.toLowerCase() || "";
        const address = post.address?.toLowerCase() || "";
        const buildingAddress = post.buildingId?.address?.toLowerCase() || "";
        
        return (
          title.includes(keyword) ||
          buildingName.includes(keyword) ||
          address.includes(keyword) ||
          buildingAddress.includes(keyword)
        );
      });
    }

    filtered = filtered.filter((post: any) => {
      const price = post.priceMin || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    filtered = filtered.filter((post: any) => {
      const area = post.areaMin || 0;
      return area >= areaRange[0] && area <= areaRange[1];
    });

    if (activeTab === "new") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter((post: any) => {
        const postDate = new Date(post.createdAt);
        return postDate >= sevenDaysAgo;
      });
      filtered = [...filtered].sort((a: any, b: any) => 
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
      if (entries[0].isIntersecting && allPosts.length < (data?.pagination.total || 0)) {
        setPage((prev) => prev + 1);
      }
    });

    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }
  }, [isFetching, allPosts.length, data?.pagination.total]);

  const tabs = [
    { id: "all", label: "Tất cả", icon: Home },
    { id: "viewed", label: "Vừa xem", icon: Clock },
  ];

  const resetFilters = () => {
    setPriceRange([0, 10000000]);
    setAreaRange([0, 100]);
    setSearchKeyword("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="sticky z-40 bg-white shadow-md border-b lg:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Tìm kiếm & Bộ lọc
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl pt-24 mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside
            className={`${
              showFilters ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : "hidden"
            } lg:block lg:static lg:w-80 lg:p-0 lg:bg-transparent lg:overflow-visible`}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Tìm kiếm & Bộ lọc</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-8">
                <Label className="text-base font-semibold mb-3 block">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Tên phòng, địa chỉ, tòa nhà..."
                    className="pl-10 pr-4 py-2.5 rounded-lg border-gray-300 focus:border-blue-500"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                {searchKeyword && (
                  <p className="text-xs text-gray-500 mt-2">
                    Đang tìm "{searchKeyword}" trong {allPosts.length} bài đăng
                  </p>
                )}
              </div>

              <div className="mb-8">
                <Label className="text-base font-semibold mb-3 block">Mức giá (đồng/tháng)</Label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000000}
                    step={100000}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <Label className="text-base font-semibold mb-3 block">Diện tích (m²)</Label>
                <div className="px-2">
                  <Slider
                    value={areaRange}
                    onValueChange={setAreaRange}
                    max={100}
                    step={5}
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{areaRange[0]} m²</span>
                    <span>{areaRange[1]}+ m²</span>
                  </div>
                </div>
              </div>

              <Button onClick={resetFilters} variant="outline" className="w-full mb-3">
                Đặt lại bộ lọc
              </Button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 bg-white rounded-xl shadow p-2 flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Results count */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {isLoading ? "Đang tải..." : `${total.toLocaleString()} bài đăng`}
                {searchKeyword && !isLoading && (
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    cho "{searchKeyword}"
                  </span>
                )}
              </h1>
            </div>

            {isLoading && page === 1 ? (
              <div className="flex justify-center py-20">
                <Spinner fontSize="lg" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow">
                <Home className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchKeyword 
                    ? `Không tìm thấy kết quả cho "${searchKeyword}"`
                    : activeTab === "viewed" 
                    ? "Bạn chưa xem phòng trọ nào"
                    : activeTab === "new"
                    ? "Không có phòng trọ mới trong 7 ngày qua"
                    : "Không tìm thấy phòng trọ nào phù hợp"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchKeyword
                    ? "Thử tìm kiếm bằng từ khóa khác"
                    : activeTab === "viewed"
                    ? "Hãy xem các phòng trọ để chúng xuất hiện ở đây"
                    : "Hãy thử thay đổi bộ lọc hoặc tìm kiếm lại"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post: any, index: number) => (
                  <div
                    key={post._id}
                    ref={index === posts.length - 1 ? lastPostElementRef : null}
                    data-aos="fade-up"
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

            {isFetching && page > 1 && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}

            {!isFetching && posts.length > 0 && posts.length >= 12 && (
              <div className="text-center py-12 text-gray-500">
                <p>Đã hiển thị hết tất cả phòng trọ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsPage;