// src/layouts/LogoHeader.tsx
import { Home, KeyRound, User } from "lucide-react";

interface LogoHeaderProps {
  isScrolled?: boolean;
}

const LogoHeader = ({ isScrolled }: LogoHeaderProps) => {
  return (
    <div className="flex items-center group/logo cursor-pointer relative overflow-hidden group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:overflow-visible">
      <div className="relative shrink-0 group-data-[collapsible=icon]:mr-0 mr-3">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:rotate-3 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:group-hover/logo:rotate-0 ${
            isScrolled
              ? "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 shadow-lg group-data-[collapsible=icon]:shadow-md"
              : "bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg"
          }`}
        >
          <Home
            className={`w-4 h-4 transition-all duration-300 group-data-[collapsible=icon]:size-4 ${
              isScrolled ? "text-white" : "text-white"
            }`}
          />

          <KeyRound
            className={`w-3 h-3 absolute -top-1 -right-1 transition-all duration-300 group-data-[collapsible=icon]:hidden ${
              isScrolled ? "text-cyan-300" : "text-cyan-200"
            }`}
          />

          <User
            className={`w-2 h-2 absolute -bottom-1 -left-1 transition-all duration-300 group-data-[collapsible=icon]:hidden ${
              isScrolled ? "text-teal-300" : "text-teal-200"
            }`}
          />
        </div>

        <div
          className={`absolute -top-1 -right-2 w-1 h-1 rounded-full transition-all duration-500 group-hover/logo:animate-pulse group-data-[collapsible=icon]:hidden ${
            isScrolled ? "bg-teal-400" : "bg-white/60"
          }`}
        ></div>
        <div
          className={`absolute -bottom-2 -left-1 w-1 h-1 rounded-full transition-all duration-700 group-hover/logo:animate-bounce group-data-[collapsible=icon]:hidden ${
            isScrolled ? "bg-cyan-400" : "bg-white/40"
          }`}
        ></div>
      </div>

      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
        <div
          className={`font-bold text-lg tracking-tight transition-all duration-300 group-hover/logo:scale-105 ${
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

      <div
        className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover/logo:w-full transition-all duration-500 bg-white/60 group-data-[collapsible=icon]:hidden`}
      ></div>
    </div>
  );
};

export default LogoHeader;
