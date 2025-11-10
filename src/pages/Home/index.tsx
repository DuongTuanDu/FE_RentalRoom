import { FileText, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import HeroSection from "../About-us/components/HeroSection";
import StatsSection from "../About-us/components/StatsSection";
import WhyChoose from "../About-us/components/WhyChoose";
import Testimonials from "../About-us/components/Testimonials";
import { useGetPostsResidentsQuery } from "@/services/post/post.service";
import { Spinner } from "@/components/ui/spinner";
import { useFormatDate } from "@/hooks/useFormatDate";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useViewedPosts } from "@/hooks/useViewedPosts";

const HomePage = () => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const { data, isLoading, isFetching } = useGetPostsResidentsQuery({
    page,
    limit: 12,
    keyword: "",
  });
  const currentBatch = data?.data || [];
  const lastBatchCountRef = useRef(0);
  const { viewedPosts, addViewedPost } = useViewedPosts();

  useEffect(() => {
    lastBatchCountRef.current = currentBatch.length || 0;
    setItems((prev) =>
      page === 1 ? currentBatch : [...prev, ...currentBatch]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBatch]);
  const formatDate = useFormatDate();
  const formatPrice = useFormatPrice();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: false,
      easing: "ease-in-out",
    });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [items, viewedPosts]);

  const canLoadMore = lastBatchCountRef.current === 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
      {/* Hero Section */}
      <div data-aos="fade-down">
        <HeroSection />
      </div>

      {/* Stats Section */}
      <div data-aos="fade-up">
        <StatsSection />
      </div>

      {/* Recently Viewed Section */}
      {viewedPosts.length > 0 && (
        <div
          className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          data-aos="fade-up"
        >
          <div
            className="flex items-center justify-between mb-12"
            data-aos="fade-left"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold uppercase">
                Đã xem gần đây
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {viewedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                formatDate={formatDate}
                formatPrice={formatPrice}
                onViewDetail={addViewedPost}
              />
            ))}
          </div>
        </div>
      )}

      {/* Posts Cards */}
      <div
        className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        data-aos="fade-down"
      >
        <div
          className="flex items-center justify-between mb-12"
          data-aos="fade-left"
        >
          <h2 className="text-2xl md:text-3xl font-bold uppercase">
            Bài đăng mới nhất
          </h2>
          <Link
            to="/posts"
            className="text-blue-700 hover:underline inline-flex items-center gap-2 font-medium"
          >
            <span className="hidden sm:inline">Xem tất cả bài đăng</span>
            <span className="sm:hidden">Xem tất cả</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {isLoading && items.length === 0 ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <p>Không có bài đăng nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                formatDate={formatDate}
                formatPrice={formatPrice}
                onViewDetail={addViewedPost}
              />
            ))}
          </div>
        )}
      </div>

      {/* View More Pagination */}
      {items.length > 0 && (
        <div className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex justify-center">
          {canLoadMore ? (
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60 hover:scale-105 duration-300"
              onClick={() => setPage((p) => p + 1)}
              disabled={isFetching}
            >
              {isFetching ? <Spinner /> : "Xem thêm"}
            </Button>
          ) : (
            <></>
          )}
        </div>
      )}

      {/* Why Choose Section */}
      <WhyChoose />

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  );
};

export default HomePage;
