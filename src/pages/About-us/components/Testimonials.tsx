import { Marquee } from "./Marquee";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "Hệ thống giúp tôi quản lý hiệu quả hơn 300%. Không còn lo lắng về việc quên thu tiền phòng hay theo dõi hợp đồng.",
      author: "Sarah J.",
      role: "Chủ trọ - 15 phòng",
    },
    {
      quote:
        "Tính năng báo cáo rất chi tiết, giúp tôi nắm được tình hình kinh doanh một cách chính xác và kịp thời.",
      author: "Michael T.",
      role: "Chủ trọ - 25 phòng",
    },
    {
      quote:
        "Giao diện đơn giản, dễ sử dụng. Khách thuê của tôi cũng rất hài lòng với tính năng thanh toán online.",
      author: "Elena R.",
      role: "Chủ trọ - 8 phòng",
    },
    {
      quote:
        "Phần mềm giúp tôi tiết kiệm rất nhiều thời gian trong việc quản lý hợp đồng và nhắc nhở thanh toán.",
      author: "David P.",
      role: "Chủ trọ - 12 phòng",
    },
    {
      quote:
        "Dịch vụ hỗ trợ khách hàng rất nhanh chóng và tận tình. Tôi cảm thấy yên tâm khi sử dụng lâu dài.",
      author: "Ngọc A.",
      role: "Chủ trọ - 20 phòng",
    },
  ];

  // Create more items for demonstration by duplicating the testimonials array
  const duplicatedTestimonials = [...testimonials];
  for (let i = 0; i < 5; i++) {
    testimonials.forEach((testimonial) => {
      duplicatedTestimonials.push({ ...testimonial });
    });
  }

  // Split testimonials into two rows for the Marquee
  const firstRow = duplicatedTestimonials.slice(
    0,
    duplicatedTestimonials.length / 2
  );
  const secondRow = duplicatedTestimonials.slice(
    duplicatedTestimonials.length / 2
  );

  return (
    <div className="py-10 md:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div data-aos="fade-left">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 uppercase">
              Lý do chủ nhà chọn chúng tôi
            </h2>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-500 mb-4 uppercase">
              Cảm nhận từ khách hàng
            </h2>
          </div>
          <p className="text-xl text-slate-600 mx-auto" data-aos="fade-right">
            Sự hài lòng của khách hàng là động lực giúp chúng tôi hoàn thiện ứng
            dụng, đồng thời mở ra cơ hội có thêm nhiều khách hàng mới trong
            tương lai. Chúng tôi chân thành cảm ơn khách hàng đã tin dùng cũng
            như đóng góp giúp phần mềm ngày càng hoàn thiện hơn!
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:90s] py-4">
            {firstRow.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-2 md:p-6 lg:p-8 mx-3 hover:shadow-xl 
                  transition-all duration-500 transform hover:-translate-y-2 
                  relative group"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-xl"
                ></div>
                <p className="text-gray-700mb-2 md:mb-6 italic max-w-[200px] lg:max-w-sm">
                  {testimonial.quote}
                </p>
                <div className="transform transition duration-300 group-hover:translate-x-2">
                  <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </Marquee>

          <Marquee reverse pauseOnHover className="[--duration:80s] py-4">
            {secondRow.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-2 lg:p-8 mx-3 hover:shadow-xl transition-all duration-500 transform relative group"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-600 
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-xl"
                ></div>
                <div className="text-2xl md:text-4xl mb-1.5 lg:mb-4 text-blue-200 dark:text-blue-800">
                  &quot;
                </div>
                <p className="text-gray-700 mb-6 italic max-w-[200px] lg:max-w-sm">
                  {testimonial.quote}
                </p>
                <div className="transform transition duration-300 group-hover:translate-x-2">
                  <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
