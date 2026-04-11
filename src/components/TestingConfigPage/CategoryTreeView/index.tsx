"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeleteTestCategory } from "@/hooks/useTesting";
import { ITestCategory } from "@/interface/testing";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mdiDrag, mdiFileDocumentOutline, mdiFolderOpen, mdiImage, mdiPlus, mdiSquareEditOutline, mdiTable, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";
import { CategoryDialog } from "../CategoryDialog";
interface CategoryTreeViewProps {
    category: ITestCategory;
    deviceTypeId: string;
    level?: number;
    indexString?: string;
}

export const CategoryTreeView = ({ category, deviceTypeId, level = 0, indexString }: CategoryTreeViewProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"edit" | "add-child">("edit");

    const deleteMutation = useDeleteTestCategory();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category._id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: isDragging ? "relative" : undefined,
        zIndex: isDragging ? 50 : undefined,
    };

    const handleEdit = () => {
        setDialogMode("edit");
        setIsDialogOpen(true);
    };

    const handleAddChild = () => {
        setDialogMode("add-child");
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        return new Promise((resolve, reject) => {
            deleteMutation.mutate(category._id, {
                onSuccess: () => resolve(true),
                onError: (err) => reject(err),
            });
        });
    };

    const getIcon = () => {
        if (level === 0 || category.contentType === "GROUP" || (category.children && category.children.length > 0)) {
            return mdiFolderOpen;
        }
        switch (category.contentType) {
            case "TABLE": return mdiTable;
            case "MERGE_TABLE": return mdiTable;
            case "TEXT": return mdiFileDocumentOutline;
            case "IMAGE": return mdiImage;
            default: return mdiFileDocumentOutline;
        }
    };

    const getIconColor = () => {
        if (category.contentType === "GROUP" || level === 0 || (category.children && category.children.length > 0)) return "text-white";
        return "text-neutral-400";
    };

    return (
        <div className="relative" ref={setNodeRef} style={style}>
            {/* Horizontal Line Connector (for children) */}
            {level > 0 && (
                <div className="absolute -left-6 top-[20px] w-6 h-[2px] bg-darkBorderV1" />
            )}

            <div className={`
                group flex items-center justify-between py-2 px-3 rounded-md transition-all
                border  ${level !== 0 ? "bg-darkBorderV1 border-accent/10" : "bg-darkBackgroundV1 border-darkBorderV1"}
            `}>
                <div className="flex items-center gap-3">


                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                {...attributes}
                                {...listeners}
                                className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-300 transition-colors "
                            >
                                <Icon path={mdiDrag} size={1} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Kéo & giữ, sau đó thả để sắp xếp</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Circular Node Icon */}
                    <div className={`
                        relative flex-shrink-0 w-9 h-9 border rounded-full flex items-center justify-center transition-all
                        ${level === 0 ? "bg-accent border-darkBorderV1" : "bg-darkBackgroundV1 border-darkCardV1"}
                    `}>
                        <Icon
                            path={getIcon()}
                            size={0.8}
                            className={getIconColor()}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-sm transition-colors ${level === 0 ? "font-semibold text-accent" : "font-medium text-neutral-300"}`}>
                            {indexString ? `${indexString}. ` : ""}{category.name}
                        </span>
                        <Badge variant="neutral">
                            {category.contentType}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                    {(category.contentType === "GROUP" || level === 0 || (category.children && (category.children?.length ?? 0) > 0)) && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={handleAddChild}
                                >
                                    <Icon path={mdiPlus} size={0.8} />
                                    <span>Thêm hạng mục con</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Thêm hạng mục con</TooltipContent>
                        </Tooltip>
                    )}

                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    onClick={handleEdit}
                                >
                                    <Icon path={mdiSquareEditOutline} size={0.8} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cập nhật</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Vertical Line Connector & Recursive Children */}
            {category.children && (category.children?.length ?? 0) > 0 && (
                <div className="relative ml-[19px] border-l-2 border-darkBorderV1 pl-6 space-y-1 mt-1 mb-1">
                    <SortableContext items={category.children.map(c => c._id)} strategy={verticalListSortingStrategy}>
                        {category.children?.map((child: ITestCategory, index: number) => (
                            <CategoryTreeView
                                key={child._id}
                                category={child}
                                deviceTypeId={deviceTypeId}
                                level={level + 1}
                                indexString={`${indexString ? indexString + "." : ""}${index + 1}`}
                            />
                        ))}
                    </SortableContext>
                </div>
            )}

            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                deviceTypeId={deviceTypeId}
                parentId={dialogMode === "add-child" ? category._id : category.parentId}
                category={dialogMode === "edit" ? category : undefined}
                parentCategoryName={dialogMode === "add-child" ? category.name : undefined}
            />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={deleteMutation.isPending}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Xóa hạng mục: ${category.name}`}
                description="Bạn có chắc chắn muốn xóa hạng mục này và tất cả các hạng mục con của nó không?"
                confirmText="Xác nhận xóa"
                successMessage="Xóa hạng mục thí nghiệm thành công"
                errorMessage="Xóa hạng mục thí nghiệm thất bại"
            />
        </div>
    );
};
