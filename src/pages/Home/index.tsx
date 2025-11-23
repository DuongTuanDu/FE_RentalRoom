import {
  ArrowRight,
  Building2,
  Home,
  Search,
  Shield,
  Clock,
  Users,
  CheckCircle,
  Check,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import SplitText from "@/components/animation/SplitText";
import TextType from "@/components/animation/TextType";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      easing: "ease-out-cubic",
    });
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <section className="relative pt-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-lg md:text-xl lg:text-3xl font-bold mb-6">
              <SplitText
                text="Hệ Thống"
                tag="span"
                className="text-slate-800 inline align-baseline"
                splitType="chars"
                delay={50}
                duration={0.6}
                ease="power3.out"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
              />
              <span className="mx-2">
                <SplitText
                  text="Quản Lý & Tìm kiếm"
                  tag="span"
                  className="inline align-baseline"
                  charsClass="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent ml-1"
                  splitType="chars"
                  delay={70}
                  duration={0.6}
                  ease="power3.out"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                />
              </span>
              <span className="mx-2">
                <SplitText
                  text="Phòng Trọ"
                  tag="span"
                  className="text-slate-800 inline align-baseline"
                  splitType="chars"
                  delay={110}
                  duration={0.6}
                  ease="power3.out"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                />
              </span>
            </h1>
            <TextType
              text={
                "Một nền tảng giúp chủ trọ quản lý nhà trọ chuyên nghiệp và người thuê tìm phòng minh bạch, an toàn"
              }
              typingSpeed={100}
              pauseDuration={1000}
              showCursor={true}
              cursorCharacter="|"
              className="text-lg md:text-2xl text-gray-800 mb-8 font-semibold leading-relaxed"
            />
          </div>

          {/* Cards Section */}
          <div
            data-aos="fade-up"
            data-aos-delay="400"
            className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto"
          >
            {/* Card 1: Chủ trọ */}
            <Card
              onClick={() => navigate("/about-us")}
              className="group cursor-pointer h-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 overflow-hidden relative"
            >
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
              
              {/* Sparkle Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>

              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-xl shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
                      Bạn là Chủ trọ?
                    </CardTitle>
                    <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  </div>
                </div>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Quản lý toàn bộ hoạt động nhà trọ chỉ trên một nền tảng chuyên nghiệp
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-lg bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Quản lý phòng, người thuê, hợp đồng một cách hệ thống
                  </p>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Tự động tạo hóa đơn & nhắc hạn thanh toán thông minh
                  </p>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Đăng tin cho thuê dễ dàng với giao diện trực quan
                  </p>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50">
                  <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Nhiều gói dịch vụ phù hợp mọi quy mô
                  </p>
                </div>
              </CardContent>

              <CardFooter className="relative pt-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/about-us");
                  }}
                >
                  <span>Xem các gói dịch vụ</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>

            {/* Card 2: Người thuê */}
            <Card
              onClick={() => navigate("/posts")}
              className="group cursor-pointer h-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 overflow-hidden relative"
            >
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-300/10 rounded-full blur-2xl -ml-16 -mb-16"></div>
              
              {/* Sparkle Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="w-5 h-5 text-green-500 animate-pulse" />
              </div>

              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 shadow-xl shadow-green-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-green-700 transition-colors">
                      Bạn đang tìm phòng trọ?
                    </CardTitle>
                    <div className="h-1 w-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                  </div>
                </div>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Tìm kiếm và lựa chọn phòng trọ phù hợp với nhu cầu của bạn một cách nhanh chóng
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-4">
                <div className="flex items-start gap-4 p-3 rounded-lg bg-green-50/50 group-hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex-shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Thông tin rõ ràng, hình ảnh thật từ chủ trọ
                  </p>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-green-50/50 group-hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex-shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Liên hệ trực tiếp chủ trọ không qua trung gian
                  </p>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg bg-green-50/50 group-hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex-shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Đặt lịch xem phòng, ký hợp đồng online tiện lợi
                  </p>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200/50">
                  <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Hoàn toàn miễn phí cho người thuê
                  </p>
                </div>
              </CardContent>

              <CardFooter className="relative pt-3">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 hover:from-green-700 hover:via-green-800 hover:to-emerald-900 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 group-hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/posts");
                  }}
                >
                  <Search className="mr-2 w-5 h-5" />
                  <span>Tìm phòng trọ ngay bây giờ</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            data-aos="fade-up"
            className="text-center text-3xl md:text-4xl font-bold text-slate-800 mb-16"
          >
            Tại sao nên chọn chúng tôi làm sự lựa chọn hàng đầu?
          </h2>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              {
                icon: Shield,
                title: "Minh bạch 100%",
                desc: "Chỉ chủ trọ thật mới được đăng tin",
              },
              {
                icon: Clock,
                title: "Tiết kiệm thời gian",
                desc: "Quản lý tự động – Tìm phòng chỉ 5 phút",
              },
              {
                icon: Users,
                title: "Không trung gian",
                desc: "Liên hệ trực tiếp, không mất phí môi giới",
              },
              {
                icon: CheckCircle,
                title: "Hợp đồng online",
                desc: "Ký điện tử an toàn, hợp pháp",
              },
            ].map((item, i) => (
              <div
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <item.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
