"use client";
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WorkspacePage from "@/components/WorkExchangePage/WorkspacePage";

export default function WorkspaceRoute({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    return (
        <DashboardLayout>
            <WorkspacePage planId={id} />
        </DashboardLayout>
    );
}
