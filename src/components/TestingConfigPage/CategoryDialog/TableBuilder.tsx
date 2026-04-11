"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { QuantityInput } from "@/components/ui/quantity-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SymbolInput } from "@/components/ui/symbol-input";
import { useTableBuilderStore } from "@/stores/useTableBuilderStore";
import { mdiCallMerge, mdiCallSplit, mdiRefresh } from "@mdi/js";
import Icon from "@mdi/react";
import React, { useEffect, useState } from 'react';

export interface ITableCell {
    id: string;
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
    isMergedOut: boolean;
    type: "label" | "input";
    value: string;
}

export interface IMergeTableConfig {
    rows: number;
    cols: number;
    cells: ITableCell[][];
}

interface TableBuilderProps {
    storageKey: string;
    value?: IMergeTableConfig;
    onChange: (config: IMergeTableConfig) => void;
}
export const TableBuilder: React.FC<TableBuilderProps> = ({ storageKey, value, onChange }) => {
    const [rows, setRows] = useState(value?.rows || 3);
    const [cols, setCols] = useState(value?.cols || 3);
    const [grid, setGrid] = useState<ITableCell[][]>([]);

    const [selectionStart, setSelectionStart] = useState<[number, number] | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<[number, number] | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

    const { tableConfigs, setTableConfig } = useTableBuilderStore();

    useEffect(() => {
        const persistedConfig = tableConfigs[storageKey];

        if (persistedConfig && persistedConfig.cells && persistedConfig.cells.length > 0) {
            setRows(persistedConfig.rows);
            setCols(persistedConfig.cols);
            setGrid(persistedConfig.cells);
            if (!value || !value.cells || value.cells.length === 0) {
                onChange(persistedConfig);
            }
        } else if (value && value.cells && value.cells.length > 0) {
            setRows(value.rows);
            setCols(value.cols);
            setGrid(value.cells);
        } else {
            // Default: create new grid
            const newGrid: ITableCell[][] = [];
            for (let r = 0; r < rows; r++) {
                const rowArr: ITableCell[] = [];
                for (let c = 0; c < cols; c++) {
                    rowArr.push({
                        id: `r${r}-c${c}`,
                        row: r,
                        col: c,
                        rowSpan: 1,
                        colSpan: 1,
                        isMergedOut: false,
                        type: "input",
                        value: ""
                    });
                }
                newGrid.push(rowArr);
            }
            setGrid(newGrid);
        }
    }, [storageKey]); // Re-run if storageKey changes

    const handleGridChange = (newGrid: ITableCell[][]) => {
        setGrid(newGrid);
        const newConfig = { rows, cols, cells: newGrid };
        onChange(newConfig);
        setTableConfig(storageKey, newConfig);
    };

    const updateDimensions = (newRows: number, newCols: number) => {
        const nextGrid: ITableCell[][] = [];
        for (let r = 0; r < newRows; r++) {
            const rowArr: ITableCell[] = [];
            for (let c = 0; c < newCols; c++) {
                if (grid[r] && grid[r][c]) {
                    rowArr.push({ ...grid[r][c] }); // Keep existing cell
                } else {
                    rowArr.push({
                        id: `r${r}-c${c}`,
                        row: r,
                        col: c,
                        rowSpan: 1,
                        colSpan: 1,
                        isMergedOut: false,
                        type: "input",
                        value: ""
                    });
                }
            }
            nextGrid.push(rowArr);
        }

        // Ensure bounds validation for merged cells extending out
        for (let r = 0; r < newRows; r++) {
            for (let c = 0; c < newCols; c++) {
                let cell = nextGrid[r][c];
                if (cell && !cell.isMergedOut) {
                    if (r + cell.rowSpan > newRows) {
                        cell.rowSpan = newRows - r;
                    }
                    if (c + cell.colSpan > newCols) {
                        cell.colSpan = newCols - c;
                    }
                }
            }
        }
        setRows(newRows);
        setCols(newCols);

        const newConfig = { rows: newRows, cols: newCols, cells: nextGrid };
        setGrid(nextGrid);
        onChange(newConfig);
        setTableConfig(storageKey, newConfig);
    };
    const handleReset = () => {
        setIsConfirmResetOpen(true);
    };

    const confirmReset = () => {
        const defaultRows = 3;
        const defaultCols = 3;
        const newGrid: ITableCell[][] = [];
        for (let r = 0; r < defaultRows; r++) {
            const rowArr: ITableCell[] = [];
            for (let c = 0; c < defaultCols; c++) {
                rowArr.push({
                    id: `r${r}-c${c}`,
                    row: r,
                    col: c,
                    rowSpan: 1,
                    colSpan: 1,
                    isMergedOut: false,
                    type: "input",
                    value: ""
                });
            }
            newGrid.push(rowArr);
        }
        setRows(defaultRows);
        setCols(defaultCols);
        setGrid(newGrid);
        const newConfig = { rows: defaultRows, cols: defaultCols, cells: newGrid };
        onChange(newConfig);
        setTableConfig(storageKey, newConfig);
        setSelectionStart(null);
        setSelectionEnd(null);
        setIsConfirmResetOpen(false);
    };
    // Selection handlers
    const handleMouseDown = (r: number, c: number) => {
        setSelectionStart([r, c]);
        setSelectionEnd([r, c]);
        setIsDragging(true);
    };

    const handleMouseEnter = (r: number, c: number) => {
        if (isDragging) {
            setSelectionEnd([r, c]);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const getSelectedBoundingBox = () => {
        if (!selectionStart || !selectionEnd) return null;
        return {
            minRow: Math.min(selectionStart[0], selectionEnd[0]),
            maxRow: Math.max(selectionStart[0], selectionEnd[0]),
            minCol: Math.min(selectionStart[1], selectionEnd[1]),
            maxCol: Math.max(selectionStart[1], selectionEnd[1])
        };
    };

    const isCellSelected = (r: number, c: number) => {
        if (!selectionStart || !selectionEnd) return false;
        const minRow = Math.min(selectionStart[0], selectionEnd[0]);
        const maxRow = Math.max(selectionStart[0], selectionEnd[0]);
        const minCol = Math.min(selectionStart[1], selectionEnd[1]);
        const maxCol = Math.max(selectionStart[1], selectionEnd[1]);
        return r >= minRow && r <= maxRow && c >= minCol && c <= maxCol;
    };

    const mergeSelected = () => {
        const box = getSelectedBoundingBox();
        if (!box) return;

        const { minRow, maxRow, minCol, maxCol } = box;
        const newGrid = [...grid.map(row => [...row])];

        const rowSpan = maxRow - minRow + 1;
        const colSpan = maxCol - minCol + 1;

        if (rowSpan <= 1 && colSpan <= 1) return;

        // Setup top-left cell as root
        const rootCell = newGrid[minRow][minCol];
        rootCell.rowSpan = rowSpan;
        rootCell.colSpan = colSpan;
        rootCell.isMergedOut = false;

        // Mark all other cells in the range as merged out
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (r === minRow && c === minCol) continue;
                newGrid[r][c].isMergedOut = true;
                newGrid[r][c].rowSpan = 1;
                newGrid[r][c].colSpan = 1;
            }
        }

        handleGridChange(newGrid);
        setSelectionStart([minRow, minCol]);
        setSelectionEnd([minRow, minCol]);
    };

    const unmergeSelected = () => {
        const box = getSelectedBoundingBox();
        if (!box) return;

        const newGrid = [...grid.map(row => [...row])];
        let restoredCount = 0;

        for (let r = box.minRow; r <= box.maxRow; r++) {
            for (let c = box.minCol; c <= box.maxCol; c++) {
                const cell = newGrid[r][c];
                // If it's a merged root, restore its children
                if (!cell.isMergedOut && (cell.rowSpan > 1 || cell.colSpan > 1)) {
                    const originalRowSpan = cell.rowSpan;
                    const originalColSpan = cell.colSpan;

                    for (let cr = r; cr < r + originalRowSpan; cr++) {
                        for (let cc = c; cc < c + originalColSpan; cc++) {
                            if (newGrid[cr] && newGrid[cr][cc]) {
                                newGrid[cr][cc].isMergedOut = false;
                                newGrid[cr][cc].rowSpan = 1;
                                newGrid[cr][cc].colSpan = 1;
                                restoredCount++;
                            }
                        }
                    }
                }
            }
        }

        const totalVisible = newGrid.reduce((sum, row) =>
            sum + row.filter(cell => !cell.isMergedOut).length, 0
        );
        handleGridChange(newGrid);
    };

    const canMerge = () => {
        const box = getSelectedBoundingBox();
        if (!box) return false;
        return (box.maxRow > box.minRow) || (box.maxCol > box.minCol);
    };

    const canUnmerge = () => {
        const box = getSelectedBoundingBox();
        if (!box) return false;
        for (let r = box.minRow; r <= box.maxRow; r++) {
            for (let c = box.minCol; c <= box.maxCol; c++) {
                const cell = grid[r][c];
                if (!cell.isMergedOut && (cell.rowSpan > 1 || cell.colSpan > 1)) {
                    return true;
                }
            }
        }
        return false;
    };

    const getPrimarySelectedCell = () => {
        const box = getSelectedBoundingBox();
        if (!box) return null;
        return grid[box.minRow][box.minCol];
    };

    const updateSelectedCellProp = (field: keyof ITableCell, val: any) => {
        const box = getSelectedBoundingBox();
        if (!box) return;
        const newGrid = [...grid.map(row => [...row])];
        const cell = newGrid[box.minRow][box.minCol];
        (cell as any)[field] = val;

        if (field === 'value') {
            if (val && val.length > 0) {
                cell.type = "label";
            } else {
                cell.type = "input";
            }
        }

        handleGridChange(newGrid);
    };

    const pCell = getPrimarySelectedCell();

    return (
        <Popover open={!isDragging && (canMerge() || canUnmerge())}>
            <div onMouseUp={handleMouseUp}>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-md border border-darkBorderV1 shadow-sm mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Label>Số dòng:</Label>
                            <QuantityInput
                                min={1}
                                value={rows}
                                onChange={(val) => updateDimensions(val, cols)}
                                className="w-[122px]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label>Số cột:</Label>
                            <QuantityInput
                                min={1}
                                value={cols}
                                onChange={(val) => updateDimensions(rows, val)}
                                className="w-[122px]"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={mergeSelected}
                            disabled={!canMerge()}
                        >
                            <Icon path={mdiCallMerge} size={0.8} />
                            Gộp ô (Merge)
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={unmergeSelected}
                            disabled={!canUnmerge()}
                        >
                            <Icon path={mdiCallSplit} size={0.8} />
                            Bỏ gộp (Unmerge)
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleReset}
                        >
                            <Icon path={mdiRefresh} size={0.8} />
                            Làm mới
                        </Button>
                    </div>
                </div>
                {/* Properties Panel */}
                {pCell && (
                    <div className="bg-darkBackgroundV1 border border-darkBorderV1 border-b-0 rounded-md p-4 rounded-b-none">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="flex items-center gap-2">
                                <Label>Loại ô:</Label>
                                <Select
                                    value={pCell.type}
                                    onValueChange={(v) => updateSelectedCellProp('type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="label">Văn bản cố định (Label)</SelectItem>
                                        <SelectItem value="input">Trường nhập dữ liệu (Input)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {pCell.type === "label" && (
                                <div className="flex items-center gap-2">
                                    <Label>Nội dung hiển thị:</Label>
                                    <SymbolInput
                                        value={pCell.value}
                                        onChange={(e) => updateSelectedCellProp('value', e.target.value)}
                                        placeholder="Nhập nội dung hiển thị..."

                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Grid display */}
                {/* Grid display */}
                <div className="relative overflow-auto border border-darkBorderV1 rounded-md bg-darkBackgroundV1 block custom-scrollbar rounded-t-none p-4">
                    <table className="border-collapse table-fixed shadow mx-auto" style={{ width: `${cols * 150}px`, minWidth: '100%' }}>
                        <colgroup>
                            {Array.from({ length: cols }).map((_, i) => (
                                <col key={i} style={{ width: '150px' }} />
                            ))}
                        </colgroup>
                        <tbody>
                            {(() => {
                                const box = getSelectedBoundingBox();
                                return grid.map((rowArr, rIndex) => (
                                    <tr key={`r-${rIndex}`}>
                                        {rowArr.map((cell, cIndex) => {
                                            if (cell.isMergedOut) return null;
                                            const selected = isCellSelected(rIndex, cIndex);

                                            return (
                                                <td
                                                    key={cell.id}
                                                    rowSpan={cell.rowSpan}
                                                    colSpan={cell.colSpan}
                                                    onMouseDown={() => handleMouseDown(rIndex, cIndex)}
                                                    onMouseEnter={() => handleMouseEnter(rIndex, cIndex)}
                                                    className={`
                                                relative border border-darkBorderV1
                                                min-w-[150px]
                                                ${selected ? 'bg-primary/20 ring-1 ring-inset ring-primary z-10' : 'bg-transparent'}
                                                ${cell.type === "label" ? 'text-center' : ''}
                                                select-none cursor-cell transition-colors duration-200
                                                group p-1.5
                                            `}
                                                    style={{ height: '48px' }}
                                                >
                                                    {box && rIndex === box.minRow && cIndex === box.minCol ? (
                                                        <PopoverAnchor className="absolute top-0 right-0 w-full h-full pointer-events-none" />
                                                    ) : null}
                                                    <div className="w-full h-full flex flex-col justify-center items-center pointer-events-none">
                                                        {cell.type === "label" && cell.value.trim() !== "" ? (
                                                            <span className="text-sm font-semibold text-accent max-w-[90%] truncate">{cell.value}</span>
                                                        ) : (
                                                            <Badge variant="neutral" className="opacity-60">
                                                                Trường nhập
                                                            </Badge>
                                                        )}

                                                        {/* Tooltip-like hints */}
                                                        {(cell.rowSpan > 1 || cell.colSpan > 1) && (
                                                            <Badge variant="neutral" className="absolute top-1 right-1">
                                                                {cell.colSpan}x{cell.rowSpan}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            })()}
                        </tbody>
                    </table>

                    {/* Floating Selection Tooltip/Popover Content */}
                    <PopoverContent
                        side="top"
                        align="center"
                        className="w-fit !p-2 !bg-darkCardV1 border-darkBorderV1 shadow-xl z-[1001]"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    mergeSelected();
                                }}
                                disabled={!canMerge()}
                                className="w-[160px] justify-start gap-2 h-9"
                            >
                                <Icon path={mdiCallMerge} size={0.8} />
                                Gộp ô (Merge)
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    unmergeSelected();
                                }}
                                disabled={!canUnmerge()}
                                className="w-[160px] justify-start gap-2 h-9"
                            >
                                <Icon path={mdiCallSplit} size={0.8} />
                                Bỏ gộp (Unmerge)
                            </Button>
                        </div>
                    </PopoverContent>
                </div>

                {/* Confirm Reset Dialog */}
                <ConfirmDialog
                    isOpen={isConfirmResetOpen}
                    onClose={() => setIsConfirmResetOpen(false)}
                    onConfirm={confirmReset}
                    title="Xác nhận làm mới?"
                    description="Hành động này sẽ xóa toàn bộ nội dung và cấu trúc bảng hiện tại. Bạn có chắc chắn muốn bắt đầu lại không?"
                    confirmText="Đồng ý, làm mới"
                    cancelText="Hủy bỏ"
                    variant="warning"
                />
            </div>
        </Popover>
    );
};
