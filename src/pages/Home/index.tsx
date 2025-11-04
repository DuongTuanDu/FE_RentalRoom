import { FileText, CheckCircle, ArrowRight, Globe } from "lucide-react";
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
  useEffect(() => {
    lastBatchCountRef.current = currentBatch.length || 0;
    setItems((prev) => (page === 1 ? currentBatch : [...prev, ...currentBatch]));
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
  }, [items]);

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

      {/* Posts Cards */}
      <div
        className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        data-aos="fade-down"
      >
        <div className="flex items-center justify-between mb-12" data-aos="fade-left">
          <h2 className="text-2xl md:text-3xl font-bold uppercase">Bài đăng mới nhất</h2>
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

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="bg-gradient-to-r from-blue-500/10 to-blue-600/15 backdrop-blur-md rounded-3xl p-12 border border-blue-200/50"
            data-aos="fadeInUp"
          >
            <Globe className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Sẵn Sàng Bắt Đầu?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Đăng ký ngay để trải nghiệm 30 ngày miễn phí và nhận hỗ trợ setup
              từ đội ngũ chuyên gia
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all transform hover:scale-105 flex items-center space-x-2">
                <span>Đăng Ký Ngay</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Không cần thẻ tín dụng</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
