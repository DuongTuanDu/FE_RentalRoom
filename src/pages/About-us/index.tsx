import {
  Building2,
  Users,
  FileText,
  DollarSign,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Globe,
  ShieldCheck,
  Car,
  Wallet,
  UserCog,
} from "lucide-react";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import Testimonials from "./components/Testimonials";
import WhyChoose from "./components/WhyChoose";
import Header from "@/layouts/header/Header";

const AboutUsPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: false,
      easing: "ease-in-out",
    });
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: Building2,
      title: "Quản lý nhiều nhà trọ - chung cư - ktx, sleepbox, homestay",
      description:
        "ó thể cùng một lúc quản lý nhiều nhà trọ - tòa nhà chung cư - ktx, đồng thời cũng có thể theo dõi tổng quan, chi tiết thông tin nhà cho thuê của mình với tính năng này.",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      icon: Users,
      title: "Quản lý phòng trọ, căn hộ, giường - sleepbox",
      description:
        "Các thông tin về phòng trọ như khách thuê phòng, số điện thoại, trạng thái phòng,... sẽ được cung cấp bởi tính năng này. Việc quản lý phòng trọ sẽ đơn giản hơn nhiều.",
      gradient: "from-sky-400 to-blue-500",
    },

    {
      icon: DollarSign,
      title: "Hóa đơn tiền phòng, thu tiền",
      description:
        "Chúng tôi giúp bạn theo dõi và tính toán tiền điện, nước, dịch vụ,... chốt tiền phòng hàng tháng một cách tự động, in hóa đơn cho khách thuê. Theo dõi thu tiền phòng hàng tháng cho bạn.",
      gradient: "from-cyan-400 to-blue-600",
    },
    {
      icon: FileText,
      title: "Quản lý cọc giữ chỗ và hợp đồng thuê nhà",
      description:
        "Lưu giữ tất cả thông tin khách thuê, tiền cọc, ngày cọc,... với chức năng này bạn sẽ không cần phải ghi nhớ bất cứ thông tin đặt cọc nào.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: ShieldCheck,
      title: "Quản lý khách thuê",
      description:
        "Quản lý các thông tin về khách thuê phòng, tình trạng giấy tờ tùy thân, tình trạng đăng ký tạm trú. Ngoài ra phần mềm còn hỗ trợ đăng ký tạm trú online trên dịch vụ công.",
      gradient: "from-sky-500 to-blue-700",
    },

    {
      icon: BarChart3,
      title: "Thống kê báo cáo",
      description:
        "Bạn sẽ theo dõi tổng quan hoạt động của nhà trọ, phòng trọ để sắp xếp công việc hợp lý, đồng thời nắm bắt nhanh doanh thu, chi phí và tỉ lệ phòng trống.",
      gradient: "from-sky-500 to-blue-700",
    },
    {
      icon: Car,
      title: "Quản lý xe, tài sản",
      description:
        "Quản lý thông tin xe của khách & tài sản khách sử dụng trong quá trình thuê nhà, kiểm kệ tình trạng của tài sản.",
      gradient: "from-sky-500 to-blue-700",
    },
    {
      icon: Wallet,
      title: "Quản lý tài chính",
      description:
        "Mọi thu, chi tổng kết kinh doanh sẽ được lưu trữ và tính toán tự động bạn sẽ không còn đau đầu với những con số.",
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      icon: UserCog,
      title: "Quản lý nhân viên",
      description:
        "Phần mềm cung cấp tính năng phân quyền để bạn có thể tổ chức công ty hoặc đội nhóm cùng tham gia quản lý.",
      gradient: "from-sky-500 to-blue-700",
    },
  ];

  const platforms = [
    {
      image: "https://quanlytro.me/images/banner_ipad_flatform.webp",
      title: "Quản lý trên điện thoại",
      description:
        "Quản lý ngay trên chiếc điện thoại. Nhẹ nhàng, thuận tiện, linh hoạt với đầy đủ tính năng và được đồng bộ với các nền tảng khác.",
      gradient: "from-purple-400 to-indigo-500",
      shadow: "hover:shadow-indigo-500/30",
    },
    {
      image: "https://quanlytro.me/images/banner_mobile_flatform.webp",
      title: "Quản lý trên máy tính bảng",
      description:
        "Nếu bạn đang có chiếc máy tính bảng là một lợi thế. Bạn có thể kết hợp được sự linh hoạt giữa điện thoại và máy tính.",
      gradient: "from-emerald-400 to-emerald-700",
      shadow: "hover:shadow-emerald-500/30",
    },
    {
      image: "https://quanlytro.me/images/banner_desktop_flatform.webp",
      title: "Quản lý trên máy tính",
      description:
        "Quản lý ngay trên website mà không cần cài đặt app. Tất cả các tính năng sẽ rất chi tiết, sẽ giúp bạn quản lý thuận tiện đầy đủ.",
      gradient: "from-sky-400 to-blue-500",
      shadow: "hover:shadow-blue-500/30",
    },
  ];

  return (
    <>
      <Header/>
      <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100">
        {/* Hero Section */}
        <div data-aos="fade-down">
          <HeroSection />
        </div>

        {/* Stats Section */}
        {/* <div data-aos="fade-up">
          <StatsSection />
        </div> */}

        {/* Multi-Platform Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-blue-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div data-aos="fade-left">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 uppercase">
                  Quản lý trên đa nền tảng
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-700 bg-clip-text text-transparent mb-6">
                  ĐIỆN THOẠI - IPAD - MÁY TÍNH - WEBSITE
                </h3>
              </div>
              <p
                className="text-lg text-slate-600 mx-auto leading-relaxed"
                data-aos="fade-right"
              >
                Với sự đa dạng về nền tảng sẽ giúp bạn quản lý nhà trọ linh động
                hơn, thay vì mẫu excel phức tạp hay sổ sách rờm rà. Thật tuyệt vời
                khi nay bạn đã có thể quản lý nhà trọ của mình trên mọi thiết bị
                bạn có.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8" data-aos="fade-up">
              {platforms.map((platform, index) => (
                <div key={index} className="group">
                  <div
                    className={`shadow-lg rounded-lg h-full flex flex-col items-center text-center hover:shadow-2xl ${platform.shadow}`}
                  >
                    <div className="w-full h-auto mb-6 flex items-center justify-center overflow-hidden rounded-t-lg">
                      <img
                        src={platform.image}
                        alt={platform.title}
                        className="w-full h-full object-cover "
                      />
                    </div>
                    <button
                      className={`bg-gradient-to-br ${platform.gradient} text-white px-6 py-2 rounded-full font-semibold text-md mb-4 hover:bg-blue-50 transition-colors border-4 border-indigo-200`}
                    >
                      {platform.title}
                    </button>
                    <p className="leading-relaxed text-start px-3 pb-4">
                      {platform.description}
                    </p>
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

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                  className="group"
                >
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 hover:bg-white/90 transition-all duration-500 border border-blue-200/50 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-6 transition-transform duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-center">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
    </>

  );
};


export default AboutUsPage;
