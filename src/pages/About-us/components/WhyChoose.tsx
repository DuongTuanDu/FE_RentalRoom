import {
  Building2,
  CheckCircle,
  Globe,
  MessageCircle,
  Smartphone,
  Users,
} from "lucide-react";

const reasons = [
  {
    icon: CheckCircle,
    title: "Tiết kiệm thời gian, chi phí",
    description:
      "Với thiết kế thông minh, giao diện dễ sử dụng, bám sát vào nghiệp vụ quản lý. Bạn có thể quản lý nhiều nhà trọ cùng một lúc! Giúp tiết kiệm thời gian và chi phí.",
  },
  {
    icon: Building2,
    title: "Nền tảng ổn định",
    description:
      "Chúng tôi luôn đảm bảo hệ thống có tính ổn định, luôn sẵn sàng phục vụ khách hàng. Mọi dữ liệu được sao lưu định kỳ.",
  },
  {
    icon: Smartphone,
    title: "Quản lý mọi lúc, mọi nơi",
    description:
      "Chỉ với thiết bị di động trên tay bạn có thể quản lý nhà trọ, phòng trọ bất cứ nơi đâu. Dù là ở nhà, đi công tác hay có thể là đi du lịch.",
  },
  {
    icon: Globe,
    title: "Không giới hạn",
    description:
      "Bạn có nhiều nhà trọ, có vài trăm phòng hoặc nhiều hơn. Ứng dụng được thiết kế hướng đến nhiều loại hình và quy mô có thể đáp ứng hầu hết nhu cầu.",
  },
  {
    icon: Users,
    title: "Tiếp cận tối người thuê phòng",
    description:
      "Trong công việc quản lý chúng ta cần trống là sự thoải tài chính. Chúng tôi có nhiều nền tảng trợ giúp kết nối giữa người thuê và bạn.",
  },
  {
    icon: MessageCircle,
    title: "Tận tình, phục vụ chuyên nghiệp",
    description:
      "Luôn cố gắng tạo ra môi trường làm việc chuyên nghiệp, sáng tạo và kỷ luật cao. Với đội ngũ trẻ đầy nhiệt huyết, hỗ trợ tận tình luôn luôn sẵn sàng cùng bạn.",
  },
];

const WhyChoose = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/30 to-transparent">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16" data-aos="fade-up">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          VÌ SAO NÊN CHỌN{" "}
          <span className="text-cyan-600">PHẦN MỀM QUẢN LÝ NHÀ TRỌ</span> MIỄN
          PHÍ{" "}
          <span className="text-cyan-600">
            RENTAL ROOM - QUẢN LÝ NHÀ CHO THUÊ ?
          </span>
        </h2>
        <p className="text-lg text-slate-600 max-w-4xl mx-auto mt-6">
          Với xu hướng ứng dụng công nghệ vào thực tiễn chúng tôi nhận ra sự khó
          khăn và bất cập trong khâu quản lý nhà trọ, phòng trọ. Phần mềm ra đời
          nhằm giải quyết các vấn đề này.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {reasons.map((item, index) => (
          <div
            key={index}
            data-aos={index % 2 === 0 ? "fade-up" : "fade-down"}
            className="group relative pt-8"
          >
            {/* Icon circle - nằm trên cùng */}
            <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <item.icon className="w-8 h-8 text-white" />
            </div>

            {/* Hiệu ứng nền chìm phía sau card */}
            <div className="absolute inset-0 flex items-center justify-center -z-0 transition-transform duration-500 group-hover:translate-y-7">
              <div className="w-[90%] h-[90%] bg-cyan-400/80 rounded-xl rotate-12 translate-y-3 transition-transform duration-500 group-hover:rotate-6 animate-pulse"></div>
            </div>

            {/* Main white card */}
            <div className="bg-white rounded-2xl px-8 py-16 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10 h-full">
              <div className="text-center flex-1 flex flex-col justify-between">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChoose;
