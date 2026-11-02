import { ChevronsUpDown, Key, LogOut } from "lucide-react";

import ChangePassword from "@/app/auth/ChangePassword";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/redux/authSlice";
import { persistor } from "@/redux/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function NavUser({ user }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [islogout, setLogout] = useState(false);
  const [dialog, setDialog] = useState(false);
  const user_position = useSelector((state) => state.auth.user_position);
  const sidebar_state = localStorage.getItem("sidebar:state");
  const handleLogout = async () => {
    setLogout(true);
    try {
      await persistor.flush();
      localStorage.clear();
      dispatch(logout());
      navigate("/");
      setTimeout(() => persistor.purge(), 1000);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogout(false);
      setDialog(false);
    }
  };

  const splitUser = user.name;
  const intialsChar = splitUser
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          {sidebar_state == "true" && (
            <div className="flex justify-center py-2">
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm hover:scale-110 transition-transform">
                Updated on: 11-Aug-2026
              </span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-yellow-500 text-black">
                    {intialsChar}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user_position}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-yellow-500 text-black">
                      {intialsChar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Key />

                <span className=" cursor-pointer">Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDialog(true);
                }}
              >
                <LogOut />

                <span className=" cursor-pointer">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <ChangePassword setOpen={setOpen} open={open} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dialog} onOpenChange={setDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure need to logout
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              disabled={islogout}
              loading={islogout}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {islogout ? <>Logouting...</> : "Logout"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
