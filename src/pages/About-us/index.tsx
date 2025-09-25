import {
  Building2,
  Users,
  FileText,
  DollarSign,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3,
  Clock,
  Zap,
  Globe,
} from "lucide-react";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import CountUp from "@/components/animation/CountUp";
import TextType from "@/components/animation/TextType";
import SplitText from "@/components/animation/SplitText";

const AboutUsPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: "ease-in-out",
    });
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: Building2,
      title: "Quản Lý Tòa Nhà",
      description:
        "Quản lý nhiều tòa nhà, phòng trọ một cách hiệu quả và tập trung",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      icon: Users,
      title: "Quản Lý Khách Thuê",
      description:
        "Theo dõi thông tin khách thuê, hợp đồng và lịch sử thuê phòng",
      gradient: "from-sky-400 to-blue-500",
    },
    {
      icon: FileText,
      title: "Hợp Đồng Điện Tử",
      description:
        "Tạo và ký hợp đồng điện tử, quản lý điều khoản một cách chuyên nghiệp",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: DollarSign,
      title: "Quản Lý Tài Chính",
      description: "Theo dõi doanh thu, chi phí, hóa đơn và thanh toán tự động",
      gradient: "from-cyan-400 to-blue-600",
    },
    {
      icon: BarChart3,
      title: "Báo Cáo Thống Kê",
      description:
        "Phân tích dữ liệu, báo cáo doanh thu và hiệu quả kinh doanh",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      icon: Shield,
      title: "Bảo Mật Cao",
      description:
        "Hệ thống bảo mật đa lớp, bảo vệ thông tin khách hàng tuyệt đối",
      gradient: "from-sky-500 to-blue-700",
    },
  ];

  const stats = [
    { number: 1000, suffix: "+", label: "Phòng Trọ Quản Lý", icon: Building2 },
    { number: 500, suffix: "+", label: "Chủ Trọ Tin Dùng", icon: Users },
    { number: 99.9, suffix: "%", label: "Thời Gian Hoạt Động", icon: Clock },
    { number: 24, suffix: "/7", label: "Hỗ Trợ Khách Hàng", icon: Zap },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Chủ trọ - 15 phòng",
      content:
        "Hệ thống giúp tôi quản lý hiệu quả hơn 300%. Không còn lo lắng về việc quên thu tiền phòng hay theo dõi hợp đồng.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Trần Thị B",
      role: "Chủ trọ - 25 phòng",
      content:
        "Tính năng báo cáo rất chi tiết, giúp tôi nắm được tình hình kinh doanh một cách chính xác và kịp thời.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Lê Văn C",
      role: "Chủ trọ - 8 phòng",
      content:
        "Giao diện đơn giản, dễ sử dụng. Khách thuê của tôi cũng rất hài lòng với tính năng thanh toán online.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        data-aos="fade-down"
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-center text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight gap-3">
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
                text="Thông Minh"
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
                "Hệ thống quản lý phòng trọ toàn diện, giúp chủ trọ tối ưu hóa vận hành, tăng doanh thu và nâng cao trải nghiệm khách thuê"
              }
              typingSpeed={100}
              pauseDuration={1000}
              showCursor={true}
              cursorCharacter="|"
              className="text-xl md:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed"
            />
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-blue-500/25 transition-all transform hover:scale-105 flex items-center space-x-2 cursor-pointer">
                <span>Dùng Thử Miễn Phí</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white/80 backdrop-blur-md text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white transition-all border border-blue-200 hover:shadow-lg cursor-pointer">
                Xem Demo
              </button>
            </div>
          </div>
        </div>

        {/* Floating Animation Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" data-aos="fade-up">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 hover:bg-white/90 transition-all duration-300 border border-blue-200/50 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-bold text-slate-800 mb-2">
                    <CountUp
                      from={0}
                      to={stat.number}
                      separator=","
                      direction="up"
                      duration={1}
                      className="count-up-text"
                    />
                    {stat.suffix && <span className="ml-1">{stat.suffix}</span>}
                  </div>
                  <div className="text-slate-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
              data-aos="fade-left"
            >
              Tính Năng Nổi Bật
            </h2>
            <p
              className="text-xl text-slate-600 max-w-3xl mx-auto"
              data-aos="fade-right"
            >
              Giải pháp toàn diện từ A-Z cho việc quản lý phòng trọ hiện đại
            </p>
          </div>

          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-aos="fade-up"
          >
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 hover:bg-white/90 transition-all duration-500 border border-blue-200/50 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-100/50 to-sky-100/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
              data-aos="fade-right"
            >
              Khách Hàng Nói Gì?
            </h2>
            <p
              className="text-xl text-slate-600 max-w-3xl mx-auto"
              data-aos="fade-left"
            >
              Hàng trăm chủ trọ đã tin tưởng và thành công cùng RoomMaster
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" data-aos="fade-up">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-200/50 hover:bg-white/95 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">
                      {testimonial.name}
                    </div>
                    <div className="text-slate-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

export default AboutUsPage;
