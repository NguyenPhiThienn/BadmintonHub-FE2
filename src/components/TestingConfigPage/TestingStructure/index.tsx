"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReorderTestCategories, useTestCategoryTree } from "@/hooks/useTesting";
import { IDeviceType, ITestCategory } from "@/interface/testing";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { mdiLoading, mdiPlus, mdiSitemap } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { CategoryDialog } from "../CategoryDialog";
import { CategoryTreeView } from "../CategoryTreeView";
import { TemplateUpload } from "../TemplateUpload";

interface TestingStructureProps {
    deviceType: IDeviceType | null;
}

export const TestingStructure = ({ deviceType }: TestingStructureProps) => {
    const { data: treeResponse, isLoading } = useTestCategoryTree(deviceType?._id || "");
    const [localCategories, setLocalCategories] = useState<ITestCategory[]>([]);

    useEffect(() => {
        if (treeResponse?.data) {
            setLocalCategories(treeResponse.data);
        }
    }, [treeResponse?.data]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

    const reorderMutation = useReorderTestCategories();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const newTree: ITestCategory[] = JSON.parse(JSON.stringify(localCategories));
        let foundArray: ITestCategory[] | undefined = undefined;
        let activeIndex = -1;
        let overIndex = -1;

        const findAndReorder = (items: ITestCategory[]): boolean => {
            activeIndex = items.findIndex((i: ITestCategory) => i._id === active.id);
            overIndex = items.findIndex((i: ITestCategory) => i._id === over.id);

            if (activeIndex !== -1 && overIndex !== -1) {
                foundArray = items;
                return true;
            }

            for (const item of items) {
                if (item.children && item.children.length > 0) {
                    if (findAndReorder(item.children)) {
                        return true;
                    }
                }
            }
            return false;
        };

        if (findAndReorder(newTree) && foundArray) {
            const list = foundArray as ITestCategory[];
            const reorderedList = arrayMove(list, activeIndex, overIndex);
            list.splice(0, list.length, ...reorderedList);
            setLocalCategories(newTree); // Optimistic update

            const newIds = reorderedList.map((item: ITestCategory) => item._id);
            reorderMutation.mutate(newIds);
        }
    };

    const handleAddRoot = () => {
        setSelectedParentId(null);
        setIsDialogOpen(true);
    };

    if (!deviceType) {
        return (
            <Card className="h-full border border-dashed border-darkBorderV1 bg-darkCardV2 flex flex-col items-center justify-center p-8 text-neutral-400">
                <Icon path={mdiSitemap} size={2} className="mb-4 opacity-20" />
                <p>Vui lòng chọn một loại thiết bị để cấu hình</p>
            </Card>
        );
    }

    return (
        <Card className="h-full border border-darkBorderV1 bg-darkCardV2 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-darkBorderV1 bg-darkBackgroundV1 flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent font-semibold">
                    <Icon path={mdiSitemap} size={0.8} />
                    <span>Cấu trúc hạng mục: {deviceType.name}</span>
                </div>
                <Button onClick={handleAddRoot}>
                    <Icon path={mdiPlus} size={0.8} />
                    <span>Thêm hạng mục cha</span>
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-4 !pt-0">
                {/* Template Upload Section */}
                <TemplateUpload deviceType={deviceType} />

                {/* Tree View Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-accent font-semibold whitespace-nowrap">Cấu trúc chi tiết</h3>
                        <div className="flex-1 border-b border-dashed border-accent mr-1" />

                    </div>
                    {isLoading ? (
                        <div className="text-center text-neutral-400 text-base py-4 italic flex items-center justify-center gap-2">
                            <Icon path={mdiLoading} size={1} className="animate-spin" />
                            Đang tải...
                        </div>
                    ) : localCategories.length === 0 ? (
                        <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                            <Icon path={mdiSitemap} size={0.8} className="flex-shrink-0" />
                            Không có hạng mục thí nghiệm nào.
                        </div>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={localCategories.map(cat => cat._id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-3">
                                    {localCategories.map((cat: ITestCategory, index: number) => (
                                        <CategoryTreeView key={cat._id} category={cat} deviceTypeId={deviceType._id} indexString={`${index + 1}`} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                    <Button variant="outline" className="w-full" onClick={handleAddRoot}>
                        <Icon path={mdiPlus} size={0.8} />
                        <span>Thêm hạng mục cha</span>
                    </Button>
                </div>
            </div>

            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                deviceTypeId={deviceType._id}
                parentId={selectedParentId}
            />
        </Card>
    );
};
