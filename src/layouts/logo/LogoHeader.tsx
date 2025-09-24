// src/layouts/LogoHeader.tsx
import { Home, KeyRound, User } from "lucide-react";

interface LogoHeaderProps {
  isScrolled?: boolean;
}

const LogoHeader = ({ isScrolled }: LogoHeaderProps) => {
  return (
    <div className="flex items-center group cursor-pointer relative">
      <div className="relative mr-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 ${
            isScrolled
              ? "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 shadow-lg"
              : "bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg"
          }`}
        >
          {/* Icon chính: Home */}
          <Home
            className={`w-6 h-6 transition-all duration-300 ${
              isScrolled ? "text-white" : "text-white"
            }`}
          />

          {/* Icon phụ: Key */}
          <KeyRound
            className={`w-3 h-3 absolute -top-1 -right-1 transition-all duration-300 ${
              isScrolled ? "text-cyan-300" : "text-cyan-200"
            }`}
          />

          {/* Icon phụ: User */}
          <User
            className={`w-2.5 h-2.5 absolute -bottom-1 -left-1 transition-all duration-300 ${
              isScrolled ? "text-teal-300" : "text-teal-200"
            }`}
          />
        </div>

        {/* Decorative dots */}
        <div
          className={`absolute -top-1 -right-2 w-2 h-2 rounded-full transition-all duration-500 group-hover:animate-pulse ${
            isScrolled ? "bg-teal-400" : "bg-white/60"
          }`}
        ></div>
        <div
          className={`absolute -bottom-2 -left-1 w-1.5 h-1.5 rounded-full transition-all duration-700 group-hover:animate-bounce ${
            isScrolled ? "bg-cyan-400" : "bg-white/40"
          }`}
        ></div>
      </div>

      {/* Text logo */}
      <div className="flex flex-col">
        <div
          className={`font-bold text-2xl tracking-tight transition-all duration-300 group-hover:scale-105 ${
            isScrolled
              ? "bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent"
              : "text-white"
          }`}
        >
          Rental Room
        </div>
        <div
          className={`text-xs font-medium tracking-wide transition-colors duration-300 ${
            isScrolled ? "text-teal-500" : "text-white/80"
          }`}
        >
          Quản lý phòng trọ
        </div>
      </div>

      {/* Animated underline */}
      <div
        className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-500 ${
          isScrolled
            ? "bg-gradient-to-r from-teal-500 to-cyan-500"
            : "bg-white/60"
        }`}
      ></div>
    </div>
  );
};

export default LogoHeader;
