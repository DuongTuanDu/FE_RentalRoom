import SplitText from "@/components/animation/SplitText";
import TextType from "@/components/animation/TextType";
import config from "@/config/config";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Content Left Side */}
          <div className="w-full lg:w-[55%] animate-fadeInUp text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              <SplitText
                text="Quản Lý"
                tag="span"
                className="text-slate-800 inline align-baseline"
                splitType="chars"
                delay={100}
                duration={0.6}
                ease="power3.out"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
              />

              <span className="mx-3">
                <SplitText
                  text="Phòng Trọ"
                  tag="span"
                  className="inline align-baseline"
                  charsClass="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent ml-1"
                  splitType="chars"
                  delay={120}
                  duration={0.6}
                  ease="power3.out"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                />
              </span>

              <SplitText
                text="Hiện Đại"
                tag="span"
                className="text-slate-800 inline align-baseline"
                splitType="chars"
                delay={140}
                duration={0.6}
                ease="power3.out"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
              />
            </h1>

            <TextType
              text={
                "Hiệu quả - Chuyên nghiệp - Tránh sai sót... Quản lý chưa bao giờ dễ dàng hơn thế!"
              }
              typingSpeed={100}
              pauseDuration={1000}
              showCursor={true}
              cursorCharacter="|"
              className="text-lg md:text-2xl text-gray-800 mb-8 font-semibold leading-relaxed"
            />
            
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Chúng tôi mang đến một ứng dụng tuyệt vời giúp bạn có thể dễ dàng
              quản lý nhà trọ, nhà cho thuê, chung cư mini, chuỗi căn hộ, ký túc
              xá, văn phòng cho thuê... Dù quy mô nhỏ hay lớn với công nghệ 4.0
              không còn thời quản lý phòng cho thuê bằng excel, RENTAL ROOM sẽ hỗ
              trợ bạn giải quyết các vấn về như lưu trữ thông tin, hợp đồng, khách
              hàng, hóa đơn tiền thuê nhà tự động... Giúp ban quản trị quản lý một
              cách nhanh chóng, dễ dàng, hiệu quả chỉ với chiếc điện thoại thông
              minh.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all transform hover:scale-105 flex items-center space-x-2 cursor-pointer">
                <span onClick={() => navigate(config.homePath)}>
                  Dùng Thử Miễn Phí
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate(config.homePath)}
                className="bg-white/80 backdrop-blur-md text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white transition-all border border-blue-200 hover:shadow-lg cursor-pointer"
              >
                Xem Demo
              </button>
            </div>
          </div>

          {/* Image Right Side */}
          <div className="w-full lg:w-[45%] relative animate-fadeInUp">
              <img
                src="https://quanlytro.me/images/banner-home.webp?version=244342"
                alt="Quản lý phòng trọ thông minh"
                className="w-full h-auto"
              />
          </div>
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
    </section>
  );
};

export default HeroSection;