import WorkspacePage from "@/components/WorkExchangePage/WorkspacePage";

export default async function WorkspaceRoute({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <WorkspacePage planId={id} />;
}
