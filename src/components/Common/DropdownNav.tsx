'use client'
import { useMe } from "@/hooks/useAuth";
import {
    mdiAccountCogOutline,
    mdiAccountGroup,
    mdiBriefcaseArrowLeftRightOutline,
    mdiDotsHorizontalCircleOutline,
    mdiExpansionCard,
    mdiFlash,
    mdiFlask,
    mdiHandshake,
    mdiListBoxOutline,
    mdiNotebookMultiple,
    mdiToolboxOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dropdown, Tab, Tabs, Trigger, TriggerWrapper } from '../ui/dropdown';

export const DropdownNav = () => {
    const { data: profileResponse } = useMe();
    const role = profileResponse?.data?.role;

    if (role === "partner") {
        return <PartnerDropdownNav />;
    }

    if (role === "admin") {
        return <AdminDropdownNav />;
    }

    return null;
}

export const AdminDropdownNav = () => {
    const pathname = usePathname();
    return (
        <div className="flex-1 flex justify-center items-center h-full">
            <Dropdown>
                <TriggerWrapper>
                    <Trigger
                        icon={mdiToolboxOutline}
                        href="/admin/testing-devices"
                        hasSubNav={false}
                        selected={pathname === "/admin/testing-devices"}
                    >
                        Quản lý thiết bị thí nghiệm
                    </Trigger>
                    <Trigger
                        icon={mdiFlask}
                        href="/admin/laboratory-work"
                        hasSubNav={false}
                        selected={pathname === "/admin/laboratory-work"}
                    >
                        Công việc thí nghiệm
                    </Trigger>
                    <Trigger
                        icon={mdiBriefcaseArrowLeftRightOutline}
                        href="/admin/work-exchange"
                        hasSubNav={false}
                        selected={pathname === "/admin/work-exchange"}
                    >
                        Trao đổi công việc
                    </Trigger>
                    <Trigger
                        icon={mdiAccountCogOutline}
                        hasSubNav={true}
                        selected={pathname?.startsWith("/admin") && !["/admin/testing-devices", "/admin/laboratory-work", "/admin/work-exchange"].includes(pathname)}
                    >
                        Admin
                    </Trigger>
                </TriggerWrapper>
                <Tabs>
                    <Tab className="hidden">None</Tab>
                    <Tab className="hidden">None</Tab>
                    <Tab className="hidden">None</Tab>
                    <Tab className="w-[530px]">
                        <AdminMenuContent />
                    </Tab>
                </Tabs>
            </Dropdown>
        </div>
    )
}

export const PartnerDropdownNav = () => {
    const pathname = usePathname();

    return (
        <div className="flex-1 flex justify-center items-center h-full">
            <Dropdown>
                <TriggerWrapper>
                    <Trigger
                        icon={mdiToolboxOutline}
                        href="/partner/testing-devices"
                        hasSubNav={false}
                        selected={pathname === "/partner/testing-devices"}
                    >
                        Quản lý thiết bị thí nghiệm
                    </Trigger>
                    <Trigger
                        icon={mdiFlask}
                        href="/partner/laboratory-work"
                        hasSubNav={false}
                        selected={pathname === "/partner/laboratory-work"}
                    >
                        Công việc thí nghiệm
                    </Trigger>
                    <Trigger
                        icon={mdiBriefcaseArrowLeftRightOutline}
                        href="/partner/work-exchange"
                        hasSubNav={false}
                        selected={pathname === "/partner/work-exchange"}
                    >
                        Trao đổi công việc
                    </Trigger>
                    <Trigger
                        icon={mdiDotsHorizontalCircleOutline}
                        hasSubNav={true}
                        selected={pathname?.startsWith("/partner") && !["/partner/testing-devices", "/partner/laboratory-work", "/partner/work-exchange"].includes(pathname)}
                    >
                        Xem thêm
                    </Trigger>
                </TriggerWrapper>
                <Tabs>
                    <Tab className="hidden">None</Tab>
                    <Tab className="hidden">None</Tab>
                    <Tab className="hidden">None</Tab>
                    <Tab className="w-[530px]">
                        <PartnerMenuContent />
                    </Tab>
                </Tabs>
            </Dropdown>
        </div>
    );
};

const AdminMenuContent = () => (
    <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
            <AdminLink icon={mdiHandshake} title="Quản lý công ty" href="/admin/partners" />
            <AdminLink icon={mdiAccountGroup} title="Quản lý nhân sự" href="/admin/employees" />
            <AdminLink icon={mdiToolboxOutline} title="Quản lý dụng cụ" href="/admin/equipment" />
            <AdminLink icon={mdiNotebookMultiple} title="Nhật ký thi công" href="/admin/construction-log" />
            <AdminLink icon={mdiNotebookMultiple} title="Phương án thi công" href="/admin/construction-plan" />
            <AdminLink icon={mdiFlash} title="Quản lý cấp điện áp" href="/admin/voltage-levels" />
            <AdminLink icon={mdiExpansionCard} title="Quản lý ngăn lộ" href="/admin/bays" />
            <AdminLink icon={mdiListBoxOutline} title="Quản lý cấu hình thí nghiệm" href="/admin/testing-configs" />
        </div>
    </div>
)

const PartnerMenuContent = () => (
    <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
            <AdminLink icon={mdiFlash} title="Quản lý cấp điện áp" href="/partner/voltage-levels" />
            <AdminLink icon={mdiExpansionCard} title="Quản lý ngăn lộ" href="/partner/bays" />
            <AdminLink icon={mdiNotebookMultiple} title="Nhật ký thi công" href="/partner/construction-log" />
            <AdminLink icon={mdiNotebookMultiple} title="Phương án thi công" href="/partner/construction-plan" />
        </div>
    </div>
)

const AdminLink = ({ icon, title, href }: { icon: string, title: string, href: string }) => (
    <Link href={href} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all group">
        <div className="w-8 h-8 rounded-lg bg-darkBorderV1 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
            <Icon path={icon} size={0.8} className="text-neutral-400 group-hover:text-accent transition-colors" />
        </div>
        <span className="text-neutral-400 text-sm font-semibold group-hover:text-accent transition-colors">{title}</span>
    </Link>
)
