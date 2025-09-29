import CountUp from "@/components/animation/CountUp";
import { Building2, Clock, Users, Zap } from "lucide-react";

const StatsSection = () => {
    const stats = [
    { number: 1000, suffix: "+", label: "Phòng Trọ Quản Lý", icon: Building2 },
    { number: 500, suffix: "+", label: "Chủ Trọ Tin Dùng", icon: Users },
    { number: 99.9, suffix: "%", label: "Thời Gian Hoạt Động", icon: Clock },
    { number: 24, suffix: "/7", label: "Hỗ Trợ Khách Hàng", icon: Zap },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
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
  );
};

export default StatsSection;