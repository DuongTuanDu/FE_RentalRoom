import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  ClipboardList,
  DollarSign,
  FileText,
  Settings,
  Wrench,
  UserCheck,
  Calendar,
  Bell,
  BarChart3,
  Layers,
  ListChecks,
  BedDouble,
  Newspaper,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "@/services/auth/auth.slice";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, LogOut } from "lucide-react";
import LogoHeader from "./logo/LogoHeader";

// Menu items configuration cho quản lý phòng trọ
const menuItems = [
  {
    title: "Tổng quan",
    icon: LayoutDashboard,
    path: "/landlord/dashboard",
  },
  {
    title: "Quản lý nhà trọ",
    icon: Building2,
    items: [
      {
        title: "Danh sách nhà trọ",
        icon: Building2,
        path: "/landlord/buildings",
      },
      {
        title: "Quản lý tầng",
        icon: Layers,
        path: "/landlord/floors",
      },
      {
        title: "Quản lý phòng",
        icon: Home,
        path: "/landlord/rooms",
      },
    ],
  },
  {
    title: "Người thuê",
    icon: Users,
    items: [
      {
        title: "Danh sách người thuê",
        icon: UserCheck,
        path: "/landlord/tenants",
      },
      {
        title: "Hợp đồng thuê",
        icon: FileText,
        path: "/landlord/contracts",
      },
    ],
  },
  {
    title: "Tài chính",
    icon: DollarSign,
    items: [
      {
        title: "Hóa đơn",
        icon: FileText,
        path: "/landlord/invoices",
      },
      {
        title: "Thu chi",
        icon: ClipboardList,
        path: "/landlord/transactions",
      },
      {
        title: "Báo cáo doanh thu",
        icon: BarChart3,
        path: "/landlord/revenue-reports",
      },
    ],
  },
  {
    title: "Dịch vụ & Tiện ích",
    icon: Wrench,
    items: [
      {
        title: "Dịch vụ phòng",
        icon: Wrench,
        path: "/landlord/building-services",
      },
      {
        title: "Yêu cầu sửa chữa",
        icon: ClipboardList,
        path: "/landlord/maintenance",
      },
      {
        title: "Quản lý quy định tòa",
        icon: FileText,
        path: "/landlord/regulations",
      },
    ],
  },
  {
    title: "Quản lý nội thất",
    icon: Layers,
    items: [
      {
        title: "Danh mục nội thất",
        icon: ListChecks,
        path: "/landlord/furnitures",
      },
      {
        title: "Quản lý theo tòa nhà",
        icon: Building2,
        path: "/landlord/building-furniture",
      },
      {
        title: "Quản lý theo phòng",
        icon: BedDouble,
        path: "/landlord/room-furniture",
      },
    ],
  },
  {
    title: "Quản lý bài viết",
    icon: Newspaper,
    path: "/landlord/posts",
  },
  {
    title: "Thông báo",
    icon: Bell,
    path: "/landlord/notifications",
  },
  {
    title: "Lịch hẹn",
    icon: Calendar,
    path: "/landlord/appointments",
  },
  {
    title: "Cài đặt",
    icon: Settings,
    path: "/landlord/settings",
  },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const authState = useSelector((state: any) => state.auth);

  const adminInfo = {
    name: authState.userInfo ? "Chủ trọ" : "Quản trị viên",
    email: authState.userInfo?.email || "landlord@phongtro.com",
    avatar:
      authState.userInfo?.avatar || "https://avatar.iran.liara.run/public/41",
    role: "landlord",
  };

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/auth/login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center px-1 pb-4">
              <LogoHeader isScrolled={true} />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;

                if (item.items) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="cursor-pointer">
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              const SubIcon = subItem.icon;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    onClick={() =>
                                      handleNavigation(subItem.path)
                                    }
                                    isActive={isActivePath(subItem.path)}
                                    className="cursor-pointer"
                                  >
                                    <SubIcon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => handleNavigation(item.path)}
                      isActive={isActivePath(item.path)}
                      className="cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={adminInfo.avatar} alt={adminInfo.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                      {adminInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="font-semibold text-sm">
                      {adminInfo.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {adminInfo.role}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-56 bg-white"
                align="end"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{adminInfo.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {adminInfo.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
