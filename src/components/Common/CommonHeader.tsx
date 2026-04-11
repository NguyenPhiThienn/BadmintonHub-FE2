import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/context/useUserContext";
import { useMe } from "@/hooks/useAuth";
import { useMenuSidebar } from "@/stores/useMenuSidebar";
import { mdiAccountTie, mdiLogout, mdiOfficeBuildingMarker } from "@mdi/js";
import { Icon } from "@mdi/react";
import { HamburgerMenu } from "iconsax-reactjs";
import Image from "next/image";
import Link from "next/link";
import { DropdownNav } from "./DropdownNav";

export default function CommonHeader() {
  const { toggle } = useMenuSidebar();
  const { logoutUser } = useUser();
  const { data: profileResponse } = useMe();
  const profile = profileResponse?.data;
  return (
    <>
      <div
        className="w-full fixed top-0 left-0 right-0 z-50
      p-3 md:p-4 px-4 bg-darkCardV1 border-b border-b-darkBorderV1 flex justify-between items-center h-[78px]"
      >
        <div className="flex items-center w-fit md:w-[250px] justify-between gap-3 md:gap-4">
          <button
            onClick={toggle}
            className="bg-darkBorderV1 flex items-center justify-center hover:bg-darkBorderV1/70 !text-neutral-300/70 !p-0 !h-10 !w-10 rounded-full md:hidden flex-shrink-0"
          >
            <HamburgerMenu size="20" color="#fff" />
          </button>
          <Link target="_blank" href="https://giaiphaptudongdien.com/" className="flex items-center select-none">
            <Image quality={100} draggable={false} src="/images/logo2.webp" width={1000} height={1000} alt="Logo" className="h-12 md:w-full md:h-full object-contain rounded pr-2" />
          </Link>
        </div>
        <DropdownNav />
        <div className="flex items-center gap-3 md:gap-4 ml-4">
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm text-neutral-300 font-semibold truncate max-w-[200px]">
                👋 Xin chào, {profile?.role === "partner" ? (profile?.employeeName || "Đối tác") : (profile?.employee?.position || "Quản trị viên")}
              </span>
              <span className="text-xs font-semibold text-accent text-right max-w-[220px] truncate">
                {profile?.role === "partner" ? (profile?.partnerName || profile?.partner?.partnerName) : (profile?.employee?.fullName || profile?.username || "Admin")}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden border border-accent/70 shadow-[0_0_15px_rgba(68,215,182,0.2)] p-0.5 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                  <img
                    src={profile?.employee?.avatar || `https://api.dicebear.com/9.x/bottts/svg?seed=${profile?.username || "Sophie"}`}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="flex flex-col !p-0 !py-1">
                  <div className="flex gap-1">
                    <Icon path={mdiAccountTie} size={0.8} className="flex-shrink-0" />
                    <span className="text-sm font-semibold capitalize">{profile?.fullName || "Admin"}</span>
                  </div>
                  {
                    profile?.partnerName === "admin" && <div className="flex gap-1">
                      <Icon path={mdiOfficeBuildingMarker} size={0.8} className="flex-shrink-0" />
                      <span className="text-xs text-neutral-400 font-normal">{profile?.partnerName || "admin"}</span>
                    </div>
                  }
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logoutUser}
                  className="hover:!bg-red-500/10 hover:!text-red-400 text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                  <Icon path={mdiLogout} size={0.8} className="flex-shrink-0" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}
