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
  Layers,
  ListChecks,
  BedDouble,
  Newspaper,
  ScrollText,
  FileSignature,
  FileSpreadsheet,
  BellElectric,
  WashingMachine,
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
    staffAccess: false,
  },
  {
    title: "Quản lý nhà trọ",
    icon: Building2,
    staffAccess: true,
    items: [
      {
        title: "Danh sách nhà trọ",
        icon: Building2,
        path: "/landlord/buildings",
        staffAccess: true,
      },
      {
        title: "Quản lý tầng",
        icon: Layers,
        path: "/landlord/floors",
        staffAccess: true,
      },
      {
        title: "Quản lý phòng",
        icon: Home,
        path: "/landlord/rooms",
        staffAccess: true,
      },
      {
        title: "Quản lý nhân viên",
        icon: Users,
        path: "/landlord/staff-management",
        staffAccess: false,
      },
    ],
  },
  // {
  //   title: "Danh sách người thuê",
  //   icon: Users,
  //   staffAccess: true,
  //   path: "/landlord/tenants",
  // },
  {
    title: "Tài chính",
    icon: DollarSign,
    staffAccess: true,
    items: [
      {
        title: "Hóa đơn",
        icon: FileText,
        path: "/landlord/invoices",
        staffAccess: true,
      },
      {
        title: "Thu chi",
        icon: ClipboardList,
        path: "/landlord/revenues",
        staffAccess: true,
      },
    ],
  },
  {
    title: "Dịch vụ & Tiện ích",
    icon: Wrench,
    staffAccess: true,
    items: [
      {
        title: "Dịch vụ tòa nhà",
        icon: Wrench,
        path: "/landlord/building-services",
        staffAccess: true,
      },
      {
        title: "Quản lý điện nước",
        icon: BellElectric,
        path: "/landlord/utilities",
        staffAccess: true,
      },
      {
        title: "Thiết bị giặt sấy",
        icon: WashingMachine,
        path: "/landlord/laundry-devices",
        staffAccess: true,
      },
      {
        title: "Yêu cầu sửa chữa",
        icon: ClipboardList,
        path: "/landlord/maintenance",
        staffAccess: true,
      },
      {
        title: "Quản lý quy định tòa",
        icon: FileText,
        path: "/landlord/regulations",
        staffAccess: true,
      },
    ],
  },
  {
    title: "Quản lý nội thất",
    icon: Layers,
    staffAccess: true,
    items: [
      {
        title: "Danh mục nội thất",
        icon: ListChecks,
        path: "/landlord/furnitures",
        staffAccess: true,
      },
      {
        title: "Quản lý theo tòa nhà",
        icon: Building2,
        path: "/landlord/building-furniture",
        staffAccess: true,
      },
      {
        title: "Quản lý theo phòng",
        icon: BedDouble,
        path: "/landlord/room-furniture",
        staffAccess: true,
      },
    ],
  },
  {
    title: "Quản lý bài viết",
    icon: Newspaper,
    path: "/landlord/posts",
    staffAccess: true,
  },
  {
    title: "Quản lý hợp đồng",
    icon: ScrollText,
    staffAccess: true,
    items: [
      {
        title: "Quản lý điều khoản",
        icon: FileSignature,
        path: "/landlord/terms",
        staffAccess: true,
      },
      {
        title: "Mẫu hợp đồng",
        icon: FileSpreadsheet,
        path: "/landlord/contracts-template",
        staffAccess: true,
      },
      {
        title: "Yêu cầu tạo hợp đồng",
        icon: FileText,
        path: "/landlord/contact-management",
        staffAccess: true,
      },
      {
        title: "Quản lý hợp đồng",
        icon: ScrollText,
        path: "/landlord/contracts",
        staffAccess: true,

      },
    ],
  },
  {
    title: "Quản lý lịch xem phòng",
    icon: Calendar,
    staffAccess: true,
    items: [
      {
        title: "Lịch xem phòng",
        icon: Calendar,
        path: "/landlord/appointment-management",
        staffAccess: true,
      },
      {
        title: "Cài đặt lịch",
        icon: Calendar,
        path: "/landlord/availability-management",
        staffAccess: true,
      },
    ],
  },
  {
    title: "Gói dịch vụ",
    icon: Layers,
    staffAccess: false,
    items: [
      {
        title: "Các gói dịch vụ",
        icon: Building2,
        path: "/landlord/package-services",
        staffAccess: false,
      },
      {
        title: "Lịch sử gói dịch vụ",
        icon: ListChecks,
        path: "/landlord/history-subscription",
        staffAccess: false,
      },
    ],
  },
  {
    title: "Thông báo",
    icon: Bell,
    path: "/landlord/notifications",
    staffAccess: true,
  },
  {
    title: "Cài đặt",
    icon: Settings,
    path: "/landlord/settings",
    staffAccess: true,
  },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const authState = useSelector((state: any) => state.auth);

  const isStaff =
    authState.userInfo?.role === "staff" ||
    authState.userInfo?.userType === "staff" ||
    authState.role === "staff";

  const adminInfo = {
    name: authState.userInfo?.name || (isStaff ? "Nhân viên" : "Chủ trọ"),
    email: authState.userInfo?.email || "landlord@phongtro.com",
    avatar:
      authState.userInfo?.avatar || "https://avatar.iran.liara.run/public/41",
    role: isStaff ? "Nhân viên" : "Chủ trọ",
  };

  const handleLogout = () => {
    dispatch(setLogout());
    navigate("/auth/login");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActivePath = (path: string) => location.pathname === path;

  const filterMenuItems = (items: any[]) => {
    return items
      .filter((item) => {
        if (!isStaff) return true;

        if (item.items) {
          const filteredSubItems = item.items.filter(
            (subItem: any) => subItem.staffAccess
          );
          return item.staffAccess && filteredSubItems.length > 0;
        }

        return item.staffAccess;
      })
      .map((item) => {
        if (item.items && isStaff) {
          return {
            ...item,
            items: item.items.filter((subItem: any) => subItem.staffAccess),
          };
        }
        return item;
      });
  };

  const filteredMenuItems = filterMenuItems(menuItems);

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
              {filteredMenuItems.map((item) => {
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
                            {item.items.map((subItem: any) => {
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
                        .map((n: string) => n[0])
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
                <DropdownMenuItem onClick={() => navigate("/landlord/profile")}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  <span>Hồ sơ</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/landlord/settings")}
                >
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
