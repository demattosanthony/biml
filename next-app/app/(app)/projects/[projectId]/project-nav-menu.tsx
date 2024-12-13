"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  CircleDot,
  GitPullRequest,
  MessageCircle,
  Play,
  LayoutGrid,
  BookOpen,
  Shield,
  LineChart,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  count?: number;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/projects/1",
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    label: "Topics",
    href: "/projects/1/topics",
    icon: <CircleDot className="h-4 w-4" />,
    count: 24,
  },
  //   {
  //     label: "Under Review",
  //     href: "#pull-requests",
  //     icon: <GitPullRequest className="h-4 w-4" />,
  //     count: 7,
  //   },
  //   {
  //     label: "Settings",
  //     href: "#settings",
  //     icon: <Settings className="h-4 w-4" />,
  //   },
];

export default function NavigationMenu() {
  const [activeItem, setActiveItem] = useState("Overview");

  return (
    <nav className="border-b w-full flex items-start max-w-6xl">
      <div className="flex h-14 items-center gap-2 px-4 overflow-x-auto">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            className={cn(
              "h-full rounded-none border-b-2 px-4 hover:bg-transparent hover:border-gray-300",
              "flex items-center gap-2 flex-shrink-0",
              activeItem === item.label
                ? "border-primary text-gray-900 font-semibold"
                : "border-transparent text-gray-600"
            )}
            onClick={() => setActiveItem(item.label)}
            asChild
          >
            <Link href={item.href}>
              {item.icon}
              <span>{item.label}</span>
              {item.count && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                    activeItem === item.label
                      ? "bg-secondary-100 text-primary"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
