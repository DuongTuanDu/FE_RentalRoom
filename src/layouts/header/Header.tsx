// src/layouts/header.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Home,
  Handshake,
  User,
  Settings,
  LogOut,
  ScrollText,
  Wrench,
} from "lucide-react";
import LanguageSelector from "@/components/language/LanguageSelector";
import LogoHeader from "../logo/LogoHeader";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "@/services/auth/auth.slice";
import config from "@/config/config";
import { useGetProfileQuery } from "@/services/profile/profile.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { data } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const userInfo = data?.user;

  const dispatch = useDispatch();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Trang chủ", icon: Home },
    {
      path: config.contractPath,
      label: "Hợp đồng của tôi",
      icon: ScrollText,
      requiresAuth: true,
    },
    {
      path: "/resident/my-appointments",
      label: "Lịch hẹn xem phòng",
      icon: ScrollText,
      requiresAuth: true,
    },
    { path: "/about-us", label: "Về chúng tôi", icon: Handshake },
  ];

  const handleLogout = () => {
    dispatch(setLogout());
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/10 backdrop-blur-md shadow-lg border-b border-white/10"
          : "bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="group">
              <LogoHeader isScrolled={isScrolled} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems
              .filter((item) => !item.requiresAuth || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative font-medium transition-all duration-300 group ${
                    isScrolled
                      ? "text-gray-700 hover:text-teal-600"
                      : "text-white hover:text-teal-100"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <div
                    className={`absolute inset-x-0 -bottom-1 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                      isScrolled ? "bg-teal-500" : "bg-white"
                    }`}
                  ></div>
                </Link>
              ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:block">
              <LanguageSelector isScrolled={isScrolled} />
            </div>

            {isAuthenticated ? (
              <div className="hidden md:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 h-auto p-2">
                      <Avatar className="h-8 w-8">
                        {/* <AvatarImage
                          src={userInfo.avatarUrl || ""}
                          alt={userInfo.userInfo.fullName}
                        /> */}
                        <AvatarFallback className="bg-teal-500 text-white">
                          {userInfo?.userInfo
                            ? getInitials(userInfo.userInfo?.fullName)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`font-medium text-sm ${
                          isScrolled ? "text-gray-700" : "text-white"
                        }`}
                      >
                        {userInfo?.userInfo?.fullName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Tài khoản</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(config.contactRequestPath)}
                      className="cursor-pointer"
                    >
                      <ScrollText className="mr-2 h-4 w-4" />
                      <span>Yêu cầu hợp đồng</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(config.maintenancePath)}
                      className="cursor-pointer"
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      <span>Yêu cầu bảo trì</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(config.myRoomPath)}
                      className="cursor-pointer"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span>Phòng của tôi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/settings")}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Cài đặt</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={() => navigate(config.loginPath)}
                variant="ghost"
                className={`hidden md:flex px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                  isScrolled
                    ? "text-blue-600 hover:bg-blue-100"
                    : "text-white hover:bg-white/20"
                }`}
              >
                Đăng nhập
              </Button>
            )}

            {/* Mobile Menu Sheet */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`lg:hidden transition-colors duration-300 ${
                    isScrolled
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Navigation Items */}
                  <nav className="space-y-2">
                    {navItems
                      .filter((item) => !item.requiresAuth || isAuthenticated)
                      .map((item) => (
                        <Button
                          key={item.path}
                          variant="ghost"
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full justify-start h-auto py-3 px-4"
                        >
                          <item.icon className="w-5 h-5 mr-3" />
                          <span className="font-medium">{item.label}</span>
                        </Button>
                      ))}
                  </nav>

                  {/* Language Selector */}
                  <div className="pt-4 pl-2 border-t">
                    <LanguageSelector isScrolled={true} />
                  </div>

                  {/* Auth Section */}
                  {isAuthenticated ? (
                    <div className="hidden md:flex">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center space-x-2 h-auto p-2">
                            <Avatar className="h-8 w-8">
                              {/* <AvatarImage
                                src={userInfo.avatarUrl}
                                alt={userInfo.username}
                              /> */}
                              <AvatarFallback className="bg-teal-500 text-white">
                                {userInfo?.userInfo?.fullName
                                  ? getInitials(userInfo?.userInfo?.fullName)
                                  : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={`font-medium text-sm ${
                                isScrolled ? "text-gray-700" : "text-white"
                              }`}
                            >
                              {userInfo?.userInfo?.fullName}
                            </span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => navigate("/profile")}
                            className="cursor-pointer"
                          >
                            <User className="mr-2 h-4 w-4" />
                            <span>Tài khoản</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate("/settings")}
                            className="cursor-pointer"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Cài đặt</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Đăng xuất</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="pt-4 border-t space-y-2">
                      <Button
                        onClick={() => {
                          navigate("/auth/login");
                          setIsMobileMenuOpen(false);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        Đăng nhập
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
