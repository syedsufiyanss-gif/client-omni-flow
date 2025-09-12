import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Target,
  MessageSquare,
  FolderKanban,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  Building2,
  X,
  UserPlus,
  Calendar,
} from "lucide-react";

interface CRMSidebarProps {
  onClose?: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    current: false,
  },
  {
    name: "Leads",
    href: "/leads",
    icon: UserPlus,
    current: false,
    badge: "12",
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: Users,
    current: false,
  },
  {
    name: "Opportunities",
    href: "/opportunities",
    icon: Target,
    current: false,
    badge: "5",
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
    current: false,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: Calendar,
    current: false,
    badge: "8",
  },
  {
    name: "Communications",
    href: "/communications",
    icon: MessageSquare,
    current: false,
  },
  {
    name: "Quotes",
    href: "/quotes",
    icon: FileText,
    current: false,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: CreditCard,
    current: false,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Companies",
    href: "/companies",
    icon: Building2,
    current: false,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    current: false,
  },
  {
    name: "Support",
    href: "/support",
    icon: HelpCircle,
    current: false,
  },
];

export function CRMSidebar({ onClose }: CRMSidebarProps) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo and close button */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">OmniFlow CRM</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}