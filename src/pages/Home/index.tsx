import { ArrowRight, Building2, Home, Search, Shield, Clock, Users, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
      <section className="relative lg:py-14 overflow-hidden">
        <div className="!max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            data-aos="fade-up"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-8 leading-tight"
          >
            Hệ Thống Quản Lý & Tìm Kiếm Phòng Trọ
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Dành Cho Chủ Trọ Và Người Thuê
            </span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-lg md:text-2xl text-gray-700 mb-16 max-w-5xl mx-auto leading-relaxed"
          >
            Một nền tảng giúp <strong className="text-blue-700">chủ trọ quản lý nhà trọ chuyên nghiệp </strong>  
            và <strong className="text-green-700">người thuê tìm phòng minh bạch, an toàn</strong> 
          
          </p>

        <div
          data-aos="fade-up"
          data-aos-delay="400"
          className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto items-stretch"
        >
          <div
            onClick={() => navigate("/about-us")}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 h-full"
          >
            <div className="h-full flex flex-col bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-3xl p-10 shadow-2xl hover:shadow-blue-600/40">
              <Building2 className="w-20 h-20 mx-auto mb-6" />

              <h3 className="text-3xl font-bold mb-5">Bạn là Chủ trọ?</h3>

              <p className="text-blue-50 text-lg mb-8 leading-relaxed opacity-90 flex-1">
                Quản lý toàn bộ hoạt động nhà trọ chỉ trên một nền tảng:
                <br />
                • Quản lý phòng, người thuê, hợp đồng
                <br />
                • Tự động tạo hóa đơn & nhắc hạn thanh toán
                <br />
                • Đăng tin cho thuê dễ dàng
                <br />
                Nhiều gói dịch vụ phù hợp mọi quy mô.
              </p>

              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg"
              >
                Xem các gói dịch vụ dành cho chủ trọ
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>
          </div>

          <div
            onClick={() => navigate("/posts")}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105 h-full"
          >
            <div className="h-full flex flex-col bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-3xl p-10 shadow-2xl hover:shadow-green-600/40">
              <Home className="w-20 h-20 mx-auto mb-6" />

              <h3 className="text-3xl font-bold mb-5">Bạn đang tìm phòng trọ?</h3>

              <p className="text-green-50 text-lg mb-8 leading-relaxed opacity-90 flex-1">
                Tìm kiếm và lựa chọn phòng trọ phù hợp:
                <br />
                • Thông tin rõ ràng, hình ảnh thật
                <br />
                • Liên hệ trực tiếp chủ trọ
                <br />
                • Đặt lịch xem phòng, ký hợp đồng online
                <br />
                Hoàn toàn miễn phí cho người thuê.
              </p>

              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-white text-green-700 hover:bg-green-50 font-bold text-lg"
              >
                <Search className="mr-3 w-6 h-6" />
                Tìm phòng trọ ngay bây giờ
              </Button>
            </div>
          </div>
        </div>


        </div>

        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 data-aos="fade-up" className="text-center text-3xl md:text-4xl font-bold text-slate-800 mb-16">
            Tại sao nên chọn chúng tôi làm sự lựa chọn hàng đầu?
          </h2>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, title: "Minh bạch 100%", desc: "Chỉ chủ trọ thật mới được đăng tin" },
              { icon: Clock, title: "Tiết kiệm thời gian", desc: "Quản lý tự động – Tìm phòng chỉ 5 phút" },
              { icon: Users, title: "Không trung gian", desc: "Liên hệ trực tiếp, không mất phí môi giới" },
              { icon: CheckCircle, title: "Hợp đồng online", desc: "Ký điện tử an toàn, hợp pháp" },
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

      <section className="py-24 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 data-aos="fade-up" className="text-4xl md:text-5xl font-bold mb-6">
            Bạn sẵn sàng chưa?
          </h2>
          <p data-aos="fade-up" data-aos-delay="200" className="text-xl mb-12 opacity-90">
            Hàng nghìn chủ trọ và người thuê đã tin dùng mỗi ngày
          </p>

          <div data-aos="fade-up" data-aos-delay="400" className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-blue-700 bg-white hover:bg-gray-100 font-bold text-lg px-10 py-7"
              onClick={() => navigate("/about-us")}
            >
              <Building2 className="mr-3 w-6 h-6" />
              Tôi là Chủ trọ – Xem gói dịch vụ
            </Button>

            <Button
              size="lg"
              className="bg-white/20 hover:bg-white/30 backdrop-blur border border-white/50 font-bold text-lg px-10 py-7"
              onClick={() => navigate("/posts")}
            >
              <Search className="mr-3 w-6 h-6" />
              Tôi muốn tìm phòng trọ
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;