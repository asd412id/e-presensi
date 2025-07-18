import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { useRecoilValue } from "recoil";
import { IconCalendarEvent, IconUser, IconLogout } from "@tabler/icons-react";

import { ThemeSwitch } from "@/components/theme-switch";
import { userState } from "@/config/recoil";

export const Navbar = () => {
  const user = useRecoilValue(userState);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-2"
            color="foreground"
            href="/"
          >
            <IconCalendarEvent className="text-primary" size={24} />
            <p className="font-bold text-inherit text-xl">E-Presensi</p>
          </Link>
        </NavbarBrand>
        {user && (
          <div className="hidden lg:flex gap-4 justify-start ml-6">
            <NavbarItem>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </NavbarItem>
          </div>
        )}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        {user ? (
          <NavbarItem className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IconUser
                className="text-violet-600 dark:text-violet-400"
                size={20}
              />
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                {user.name || user.username}
              </span>
            </div>
            <Button
              className="text-sm font-normal"
              color="danger"
              size="sm"
              startContent={<IconLogout size={16} />}
              variant="flat"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </NavbarItem>
        ) : null}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        {user && <NavbarMenuToggle />}
      </NavbarContent>

      {user && (
        <NavbarMenu>
          <div className="mx-4 mt-4 flex flex-col gap-3">
            <NavbarMenuItem>
              <Link
                className="w-full text-lg"
                color="foreground"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                className="w-full justify-start text-lg"
                color="danger"
                startContent={<IconLogout size={20} />}
                variant="light"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </NavbarMenuItem>
          </div>
        </NavbarMenu>
      )}
    </HeroUINavbar>
  );
};
