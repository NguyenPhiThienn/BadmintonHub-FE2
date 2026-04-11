"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SymbolInput } from "@/components/ui/symbol-input";
import { useCreateTestCategory, useUpdateTestCategory } from "@/hooks/useTesting";
import { ITestCategory, TestContentType } from "@/interface/testing";
import { useTableBuilderStore } from "@/stores/useTableBuilderStore";
import { mdiClose, mdiContentSave, mdiLoading, mdiPlus, mdiSitemap, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { IMergeTableConfig, TableBuilder } from "./TableBuilder";

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    deviceTypeId: string;
    parentId: string | null;
    category?: ITestCategory;
    parentCategoryName?: string;
}

interface CategoryFormData {
    name: string;
    standardValue: string;
    contentType: TestContentType;
    allowCharting: boolean;
    dropdownOptions: { text: string; value: string }[];
    tableColumns: { name: string; unit: string }[];
    mergeTableConfig?: IMergeTableConfig;
}



export const CategoryDialog = ({ isOpen, onClose, deviceTypeId, parentId, category, parentCategoryName }: CategoryDialogProps) => {
    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<CategoryFormData>({
        defaultValues: {
            name: "",
            standardValue: "",
            contentType: "TEXT" as TestContentType,
            allowCharting: false,
            dropdownOptions: [{ text: "", value: "" }],
            tableColumns: [{ name: "", unit: "" }],
            mergeTableConfig: { rows: 3, cols: 3, cells: [] }
        }
    });



    const { fields: dropdownFields, append: appendDropdown, remove: removeDropdown } = useFieldArray({
        control,
        name: "dropdownOptions"
    });

    const { fields: tableFields, append: appendTable, remove: removeTable } = useFieldArray({
        control,
        name: "tableColumns"
    });

    const contentType = watch("contentType");

    useEffect(() => {
        if (isOpen) {
            let parsedDropdown = [{ text: "", value: "" }];
            let parsedTable = [{ name: "", unit: "" }];
            let parsedMergeTable: IMergeTableConfig = { rows: 3, cols: 3, cells: [] };

            if (category?.config) {
                if (category.contentType === "DROPDOWN" && Array.isArray(category.config)) {
                    parsedDropdown = category.config.length ? category.config : parsedDropdown;
                } else if (category.contentType === "TABLE" && Array.isArray(category.config)) {
                    parsedTable = category.config.length ? category.config : parsedTable;
                } else if (category.contentType === "MERGE_TABLE" && category.config.cells) {
                    parsedMergeTable = category.config as IMergeTableConfig;
                }
            }

            reset({
                name: category?.name || "",
                standardValue: category?.standardValue || "",
                contentType: category?.contentType || "TEXT",
                allowCharting: category?.allowCharting || false,
                dropdownOptions: parsedDropdown,
                tableColumns: parsedTable,
                mergeTableConfig: parsedMergeTable
            });
        }
    }, [isOpen, category, reset]);

    const createMutation = useCreateTestCategory();
    const updateMutation = useUpdateTestCategory();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (data: CategoryFormData) => {
        let configData: any = null;
        if (data.contentType === "DROPDOWN") {
            configData = data.dropdownOptions.filter(o => o.text && o.value);
        } else if (data.contentType === "TABLE") {
            configData = data.tableColumns.filter(c => c.name);
        } else if (data.contentType === "MERGE_TABLE") {
            configData = data.mergeTableConfig;
        }

        const payload = {
            name: data.name,
            standardValue: data.standardValue,
            contentType: data.contentType,
            allowCharting: data.allowCharting,
            config: configData
        };

        if (category) {
            updateMutation.mutate({ id: category._id, data: payload }, {
                onSuccess: () => {
                    useTableBuilderStore.getState().clearTableConfig(category._id || 'temp');
                    onClose();
                }
            });
        } else {
            createMutation.mutate({ ...payload, deviceTypeId, parentId }, {
                onSuccess: () => {
                    useTableBuilderStore.getState().clearTableConfig('temp');
                    onClose();
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size={contentType === "MERGE_TABLE" ? "large" : "medium"}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-accent">
                        <Icon path={mdiSitemap} size={0.8} />
                        <span>
                            {category
                                ? "Cập nhật hạng mục"
                                : parentCategoryName
                                    ? `Thêm mới hạng mục con cho ${parentCategoryName}`
                                    : "Thêm mới hạng mục"}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="cat-name">Tên hạng mục <span className="text-red-500">*</span></Label>
                                <SymbolInput
                                    id="cat-name"
                                    {...register("name", { required: "Vui lòng nhập tên hạng mục" })}
                                    placeholder="Nhập tên hạng mục..."
                                />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="standard-value">Giá trị tiêu chuẩn (Gợi ý)</Label>
                                <SymbolInput
                                    id="standard-value"
                                    {...register("standardValue")}
                                    placeholder="VD: ≤ 0.5 Ω"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="content-type">Loại dữ liệu nhập</Label>
                                <Controller
                                    name="contentType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại dữ liệu" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TEXT">Văn bản (Text)</SelectItem>
                                                <SelectItem value="NUMBER">Số (Number)</SelectItem>
                                                <SelectItem value="DROPDOWN">Lựa chọn (Dropdown)</SelectItem>
                                                <SelectItem value="TABLE">Bảng (Table) - Nhiều dòng</SelectItem>
                                                <SelectItem value="MERGE_TABLE">Bảng (Table) - Gộp ô</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {contentType === "DROPDOWN" && (
                                <div className="bg-darkBackgroundV1 border border-dashed border-darkBorderV1 rounded-md p-4">
                                    <div className="space-y-3">
                                        <div className="text-sm font-semibold text-accent mb-2">Cấu hình Danh sách Lựa chọn:</div>
                                        <div className="space-y-2">
                                            {dropdownFields.map((field, index) => (
                                                <div key={field.id} className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <SymbolInput
                                                            {...register(`dropdownOptions.${index}.text`)}
                                                            placeholder="Nhãn hiển thị (Text)"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <SymbolInput
                                                            {...register(`dropdownOptions.${index}.value`)}
                                                            placeholder="Giá trị lưu (Value)"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeDropdown(index)}
                                                    >
                                                        <Icon path={mdiTrashCanOutline} size={0.8} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => appendDropdown({ text: "", value: "" })}
                                        >
                                            <Icon path={mdiPlus} size={0.8} />
                                            Thêm lựa chọn
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {contentType === "TABLE" && (
                                <div className="bg-darkBackgroundV1 border border-dashed border-darkBorderV1 rounded-md p-4">
                                    <div className="space-y-3">
                                        <div className="text-sm font-semibold text-accent mb-2">Cấu hình Cột của Bảng:</div>
                                        <div className="space-y-2 relative overflow-x-auto pb-2">
                                            {tableFields.map((field, index) => (
                                                <div key={field.id} className="flex items-center gap-2 min-w-[500px]">
                                                    <div className="flex-[1]">
                                                        <SymbolInput
                                                            {...register(`tableColumns.${index}.name`)}
                                                            placeholder="Tên cột hiển thị"
                                                        />
                                                    </div>
                                                    <div className="flex-[1]">
                                                        <SymbolInput
                                                            {...register(`tableColumns.${index}.unit`)}
                                                            placeholder="Đơn vị"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeTable(index)}
                                                    >
                                                        <Icon path={mdiTrashCanOutline} size={0.8} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => appendTable({ name: "", unit: "" })}
                                        >
                                            <Icon path={mdiPlus} size={0.8} />
                                            Thêm cột
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {contentType === "MERGE_TABLE" && (
                                <div className="bg-darkBackgroundV1 border border-dashed border-darkBorderV1 rounded-md p-4">
                                    <div className="space-y-3">
                                        <div className="text-sm font-semibold text-accent mb-2">Cấu hình Bảng (Gộp ô):</div>
                                        <Controller
                                            name="mergeTableConfig"
                                            control={control}
                                            render={({ field }) => (
                                                <TableBuilder
                                                    storageKey={category?._id || 'temp'}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-2 pt-2">
                                <Controller
                                    name="allowCharting"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            id="allow-charting"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor="allow-charting" className="font-normal cursor-pointer">Cho phép vẽ biểu đồ lịch sử?</Label>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <Button type="submit" form="category-form" disabled={isPending}>
                        {isPending ? (
                            <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                        ) : (
                            <Icon path={category ? mdiContentSave : mdiPlus} size={0.8} />
                        )}
                        {category ? "Lưu thay đổi" : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
