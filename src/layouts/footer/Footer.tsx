import {
  Home,
  Heart,
  Shield,
  Users,
  Search,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Building,
  CreditCard,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Trang chủ", href: "/", icon: Home },
    { name: "Tìm phòng trọ", href: "/rooms", icon: Search },
    { name: "Đăng tin phòng", href: "/post-room", icon: Building },
    { name: "Liên hệ", href: "/contact", icon: Phone },
  ];

  const supportLinks = [
    { name: "Trung tâm trợ giúp", href: "/help" },
    { name: "Hướng dẫn thuê phòng", href: "/rental-guide" },
    { name: "Hướng dẫn cho chủ nhà", href: "/landlord-guide" },
    { name: "Liên hệ hỗ trợ", href: "/support" },
  ];

  const legalLinks = [
    { name: "Chính sách bảo mật", href: "/privacy" },
    { name: "Điều khoản dịch vụ", href: "/terms" },
    { name: "Chính sách thanh toán", href: "/payment-policy" },
    { name: "Quy định đăng tin", href: "/posting-policy" },
  ];

  const features = [
    {
      icon: Search,
      title: "Tìm phòng dễ dàng",
      desc: "Hệ thống tìm kiếm thông minh",
    },
    {
      icon: Shield,
      title: "An toàn & Bảo mật",
      desc: "Xác minh và bảo mật tuyệt đối",
    },
    {
      icon: Users,
      title: "Kết nối trực tiếp",
      desc: "Liên hệ trực tiếp với chủ nhà",
    },
    {
      icon: CreditCard,
      title: "Thanh toán linh hoạt",
      desc: "Hỗ trợ nhiều hình thức thanh toán tiện lợi",
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-500 hover:bg-blue-50",
    },
    {
      icon: Twitter,
      href: "#",
      label: "Twitter",
      color: "hover:text-sky-400 hover:bg-sky-50",
    },
    {
      icon: Instagram,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-500 hover:bg-pink-50",
    },
    {
      icon: Linkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-600 hover:bg-blue-50",
    },
  ];

  const contactInfo = [
    { icon: Phone, text: "024 3456 7890", href: "tel:02434567890" },
    {
      icon: Mail,
      text: "support@rentalroom.vn",
      href: "mailto:support@rentalroom.vn",
    },
    { icon: MapPin, text: "Hà Nội, Việt Nam", href: "#" },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Top wave decoration */}
      <div className="relative z-10">
        {/* Features Section */}
        <div className="pt-16 pb-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 hover:border-teal-400/40 transition-all duration-300 hover:transform hover:scale-105 hover:-translate-y-1 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="border-t border-gray-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Rental Room
                  </h2>
                  <p className="text-sm text-gray-400">Quản lý phòng trọ</p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed text-sm">
                Nền tảng quản lý phòng trọ hiện đại, kết nối người thuê và chủ
                nhà. Tìm kiếm phòng trọ phù hợp, đăng tin miễn phí và quản lý
                hiệu quả.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors duration-300 group"
                  >
                    <contact.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">{contact.text}</span>
                  </a>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`p-3 rounded-xl bg-gray-800/50 text-gray-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 ${social.color} hover:shadow-lg`}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white relative">
                Liên kết nhanh
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="group flex items-center text-gray-300 hover:text-teal-400 transition-all duration-300 hover:translate-x-2"
                    >
                      <link.icon className="w-4 h-4 mr-3 group-hover:text-teal-400 transition-colors duration-300" />
                      <span className="relative">
                        {link.name}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white relative">
                Hỗ trợ
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-teal-400 transition-all duration-300 hover:translate-x-2 transform inline-block relative group"
                    >
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white relative">
                Pháp lý
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-teal-400 transition-all duration-300 hover:translate-x-2 transform inline-block relative group"
                    >
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm flex items-center">
                © {currentYear} Rental Room. Made with
                <Heart className="w-4 h-4 mx-1 text-red-500 animate-pulse" />
                in Vietnam
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
