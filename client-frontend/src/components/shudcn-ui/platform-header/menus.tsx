"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { siteConfig } from "@/components";

const menuItems = siteConfig.headerItems;

export function Menus() {
  return (
    <NavigationMenu viewport={true}>
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.name}>
            <NavigationMenuLink
              asChild
              className={cn(navigationMenuTriggerStyle(), "bg-transparent text-xs")}
            >
              <Link href={item.href}>{item.name}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
