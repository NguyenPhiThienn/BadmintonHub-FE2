"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useTestCategoryTree, useTestJobDetails } from "@/hooks/useTesting";
import { ITestCategory, ITestingDevice } from "@/interface/testing";
import { mdiArrowLeft, mdiFilePdfBox, mdiLoading } from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { CapLucTemplate } from "./templates/CapLucTemplate";
import { CauChiTuRoiTemplate } from "./templates/CauChiTuRoiTemplate";
import { ChongSetVanTemplate } from "./templates/ChongSetVanTemplate";
import { DaoCachLyTemplate1P } from "./templates/DaoCachLyTemplate1P";
import { DaoCachLyTemplate3P } from "./templates/DaoCachLyTemplate3P";
import { MayBienApTemplate } from "./templates/MayBienApTemplate";
import { MayBienDienApKieuTuTemplate } from "./templates/MayBienDienApKieuTuTemplate";
import { MayBienDongDienTemplate } from "./templates/MayBienDongDienTemplate";
import { MayCatTemplate } from "./templates/MayCatTemplate";
import { RoleBaoVeKhoangCachTemplate } from "./templates/RoleBaoVeKhoangCachTemplate";
import { RoleBaoVeQuaDongTemplate } from "./templates/RoleBaoVeQuaDongTemplate";
import { RoleBaoVeSoLechDuongDayTemplate } from "./templates/RoleBaoVeSoLechDuongDayTemplate";
import { RoleBaoVeSoLechMayBienApTemplate } from "./templates/RoleBaoVeSoLechMayBienApTemplate";
import { RoleBaoVeSoLechThanhCaiMucNganTemplate } from "./templates/RoleBaoVeSoLechThanhCaiMucNganTemplate";
import { RoleBaoVeSoLechThanhCaiTemplate } from "./templates/RoleBaoVeSoLechThanhCaiTemplate";
import { RoleBaoVeTemplate } from "./templates/RoleBaoVeTemplate";
import { ThietBiDemSetTemplate } from "./templates/ThietBiDemSetTemplate";

const REPORT_CSS = `
    .a4-page, .a4-page * {
        font-family: 'Tinos', 'Times New Roman', Times, serif !important;
    }
    .a4-page {
        background: white;
        width: 210mm;
        min-height: 297mm;
        padding: 5mm 10mm 8mm 15mm;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        position: relative;
    }
    @media print {
        .a4-page {
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
        }
        /* Ensure each physical page has a consistent look */
        body {
            padding: 0 !important;
            margin: 0 !important;
        }
        @page {
            size: A4;
            margin: 15mm 10mm 8mm 15mm;
        }
    }
    table td, table th {
        border: 0.5pt solid black;
        padding: 4px 8px;
        border-collapse: collapse;
        word-break: break-word;
    }
    tr {
        page-break-inside: avoid;
        break-inside: avoid;
    }
    .break-inside-avoid {
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 4mm;
    }
    .break-after-page {
        page-break-after: always;
        break-after: page;
    }
    img { max-width: 100%; height: auto; }
    .print-only { display: block !important; }
    .no-print { display: none !important; }
    .border-none, .border-none td, .border-none tr { border: none !important; }
`;

const getTemplateTitle = (name: string) => {
    const n = name.toLowerCase();
    if (n.toLowerCase().includes("dcl-1p")) return "BIÊN BẢN THÍ NGHIỆM DAO CÁCH LY";
    if (n.toLowerCase().includes("dcl-3p")) return "BIÊN BẢN THÍ NGHIỆM DAO CÁCH LY";
    if (n.toLowerCase().includes("csv") || n.toLowerCase().includes("chống sét van")) return "BIÊN BẢN THÍ NGHIỆM CHỐNG SÉT VAN";
    if (n.toLowerCase().includes("tu") || n.toLowerCase().includes("máy biến điện áp")) return "BIÊN BẢN THÍ NGHIỆM MÁY BIẾN ĐIỆN ÁP";
    if (n.toLowerCase().includes("ti") || n.toLowerCase().includes("máy biến dòng")) return "BIÊN BẢN THÍ NGHIỆM MÁY BIẾN DÒNG ĐIỆN";
    if (n.toLowerCase().includes("mc") || n.toLowerCase().includes("máy cắt")) return "BIÊN BẢN THÍ NGHIỆM MÁY CẮT SF6";
    if (n.toLowerCase().includes("so lệch mba")) return "BIÊN BẢN THÍ NGHIỆM BẢO VỆ SO LỆCH MÁY BIẾN ÁP";
    if (n.toLowerCase().includes("mba") || n.toLowerCase().includes("máy biến áp")) return "BIÊN BẢN THÍ NGHIỆM MÁY BIẾN ÁP";
    if (n.toLowerCase().includes("cáp lực")) return "BIÊN BẢN THÍ NGHIỆM CÁP LỰC CAO THẾ";
    if (n.toLowerCase().includes("rlbvkc") || n.toLowerCase().includes("khoảng cách") || n.toLowerCase().includes("distance")) return "BIÊN BẢN THÍ NGHIỆM BẢO VỆ KHOẢNG CÁCH";
    if (n.toLowerCase().includes("quá dòng")) return "BIÊN BẢN THÍ NGHIỆM BẢO VỆ QUÁ DÒNG";
    if (n.toLowerCase().includes("mức ngăn")) return "BIÊN BẢN THÍ NGHIỆM BẢO VỆ SO LỆCH THANH CÁI MỨC NGĂN";
    if (n.toLowerCase().includes("khoảng cách")) return "BIÊN BẢN THÍ NGHIỆM BẢO VỆ KHOẢNG CÁCH";
    if (n.toLowerCase().includes("thanh cái") && !n.toLowerCase().includes("BU")) return "BIÊN BẢN THÍ NGHIỆM BẢO VỆ SO LỆCH THANH CÁI";
    if (n.toLowerCase().includes("máy biến áp")) return "BIÊN BẢN THÍ NGHIỆM MÁY BIẾN ÁP";
    if (n.normalize("NFC").toLowerCase().includes("so lệch đường dây".normalize("NFC"))) return "BIÊN BẢN THÍ NGHIỆM BẢO VỆ SO LỆCH ĐƯỜNG DÂY";
    if (n.includes("CC") || n.includes("Cầu chì tự rơi")) return "BIÊN BẢN THÍ NGHIỆM CẦU CHÌ TỰ RƠI";
    if (n.toLowerCase().includes("rlbv") || n.toLowerCase().includes("rơle") || n.toLowerCase().includes("rơ le") || n.toLowerCase().includes("relay") || n.toLowerCase().includes("rlgsmc")) return "BIÊN BẢN THÍ NGHIỆM RƠ LE BẢO VỆ";
    if (n.toLowerCase().includes("tổng hợp")) return "BIÊN BẢN THÍ NGHIỆM TỔNG HỢP MẠCH NGĂN LỘ";
    if (n.toLowerCase().includes("gscldn") || n.toLowerCase().includes("giám sát chất lượng")) return "BIÊN BẢN THÍ NGHIỆM GIÁM SÁT CHẤT LƯỢNG ĐIỆN NĂNG";
    if (n.toLowerCase().includes("cbl") || n.toLowerCase().includes("cáp lực")) return "BIÊN BẢN THÍ NGHIỆM CÁP LỰC";
    if (n.toLowerCase().includes("cc") || n.toLowerCase().includes("cầu chì")) return "BIÊN BẢN THÍ NGHIỆM CẦU CHÌ TỰ RƠI";
    if (n.toLowerCase().includes("tbds") || n.toLowerCase().includes("đếm sét")) return "BIÊN BẢN THÍ NGHIỆM BỘ ĐẾM CHỐNG SÉT VAN";
    return "BIÊN BẢN THÍ NGHIỆM";
};

export default function LaboratoryWorkPreviewPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [isExporting, setIsExporting] = useState(false);

    const { data: jobResponse, isLoading: isJobLoading } = useTestJobDetails(id);
    const job = jobResponse?.data;
    const device = job?.deviceId as ITestingDevice | undefined;

    const deviceTypeId = typeof device?.deviceTypeId === "string"
        ? device.deviceTypeId
        : (device?.deviceTypeId as any)?._id || "";

    const deviceTypeName = typeof device?.deviceTypeId === "object"
        ? (device.deviceTypeId as any)?.name || ""
        : "";

    useEffect(() => {
        if (deviceTypeName) {
            const oldTitle = document.title;
            const metaTitle = getTemplateTitle(deviceTypeName);
            document.title = metaTitle;
            return () => { document.title = oldTitle; };
        }
    }, [deviceTypeName]);

    const { data: categoriesResponse, isLoading: isCategoriesLoading } = useTestCategoryTree(deviceTypeId);
    const categories = categoriesResponse?.data || [];
    const isLoading = isJobLoading || isCategoriesLoading;

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center bg-darkBackgroundV1 text-neutral-400 italic py-20">
                    Đang chuẩn bị bản xem trước...
                </div>
            </DashboardLayout>
        );
    }

    if (!job) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center bg-darkBackgroundV1 text-neutral-400 italic py-20">
                    Không tìm thấy dữ liệu biên bản.
                </div>
            </DashboardLayout>
        );
    }

    const renderCellContent = (text: any) => {
        if (!text || typeof text !== 'string') return text;

        const lastOpenParen = text.lastIndexOf('(');
        if (lastOpenParen < 0) return <span className="text-[13pt]">{text}</span>;

        const vnPart = text.substring(0, lastOpenParen).trim();
        const engPart = text.substring(lastOpenParen + 1).split(')')[0].trim();

        return (
            <div className="flex flex-col items-center leading-tight py-0.5">
                <span className="text-[13pt]">{vnPart}</span>
                <span className="text-[11pt] italic font-normal">({engPart})</span>
            </div>
        );
    };

    const renderResults = (category: ITestCategory, index?: string | number) => {
        const result = job?.testResults?.[category._id];
        const isSkipped = result?.isSkipped;

        let value = result?.value;
        if (!value && category.contentType === "MERGE_TABLE") {
            const allResults = job?.testResults || {};
            const foundKey = Object.keys(allResults).find(k => allResults[k]?.value?.["r2-c1"] || allResults[k]?.value?.["r2_c1"]);
            if (foundKey) {
                value = allResults[foundKey].value;
            }
        }

        const lastOpenParen = category.name.lastIndexOf('(');
        const vnName = lastOpenParen >= 0 ? category.name.substring(0, lastOpenParen).trim() : category.name;
        const engName = lastOpenParen >= 0 ? category.name.substring(lastOpenParen + 1).replace(')', '').trim() : "";

        return (
            <div key={category._id}>
                <div className="font-semibold text-[13pt] flex items-center flex-wrap gap-x-2">
                    {index && <span>{index}. </span>}
                    <span>{vnName}</span>
                    {engName && <span className="italic font-normal text-[11pt]">({engName})</span>}
                </div>

                {isSkipped ? (
                    <div className="mt-1 text-[13pt] font-normal text-black italic">
                        Không thực hiện
                    </div>
                ) : (
                    <>
                        {(category.contentType === "TEXT" || category.contentType === "NUMBER" || category.contentType === "DROPDOWN") && value && (
                            <div className="mt-1 text-[13pt] font-normal text-black">
                                {value}
                            </div>
                        )}

                        {category.contentType === "IMAGE" && value && (
                            <div className="mt-2">
                                {Array.isArray(value) ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {value.map((url: string, i: number) => (
                                            <img key={i} src={url} className="max-w-full h-auto rounded border border-black" alt="Result" />
                                        ))}
                                    </div>
                                ) : (
                                    <img src={value} className="max-w-[400px] h-auto rounded border border-black" alt="Result" />
                                )}
                            </div>
                        )}

                        {category.contentType === "TABLE" && value && Array.isArray(value) && value.length > 0 && (
                            <table className="w-full mt-2 border-collapse border border-black text-center table-fixed font-normal">
                                <thead className="bg-white">
                                    <tr>
                                        {Array.isArray(category.config) ? (
                                            category.config.map((col: any, i: number) => (
                                                <th key={i} className="border border-black p-1 text-[13pt] font-normal">
                                                    {renderCellContent(col.name || col.Name)}
                                                    {(col.unit || col.Unit) && <span className="font-normal italic text-[11pt]"> ({col.unit || col.Unit})</span>}
                                                </th>
                                            ))
                                        ) : (
                                            value[0] && Object.keys(value[0]).map((key, i) => (
                                                <th key={i} className="border border-black p-1 font-semibold text-[13pt]">
                                                    {renderCellContent(key)}
                                                </th>
                                            ))
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {value.map((row: any, rIdx: number) => (
                                        <tr key={rIdx}>
                                            {Array.isArray(category.config) ? (
                                                category.config.map((col: any, cIdx: number) => {
                                                    const cName = col.name || col.Name;
                                                    return <td key={cIdx} className="border border-black p-1 text-[13pt] font-normal">{renderCellContent(row[cName])}</td>;
                                                })
                                            ) : (
                                                row && Object.keys(row).map((key, cIdx) => (
                                                    <td key={cIdx} className="border border-black p-1 text-[13pt] font-normal">{renderCellContent(row[key])}</td>
                                                ))
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {category.contentType === "MERGE_TABLE" && category.config && (
                            <table className="w-full mt-2 border-collapse border border-black text-center table-fixed bg-white font-normal">
                                <tbody>
                                    {(Array.isArray((category.config as any).cells) ?
                                        ((category.config as any).cells.length === 1 && Array.isArray((category.config as any).cells[0]) && Array.isArray((category.config as any).cells[0][0])
                                            ? (category.config as any).cells[0]
                                            : (category.config as any).cells) : []
                                    ).map((rowCells: any[], rIdx: number) => (
                                        <tr key={rIdx}>
                                            {Array.isArray(rowCells) && rowCells.map((cell: any) => {
                                                if (cell.isMergedOut) return null;
                                                const dataValue = value?.[cell.id] || value?.[cell.id.replace(/-/g, '_')] || value?.[cell.id.replace(/_/g, '-')];
                                                const cellValue = dataValue !== undefined && dataValue !== ""
                                                    ? dataValue
                                                    : (cell.type === "label" ? cell.value : "");

                                                return (
                                                    <td
                                                        key={cell.id}
                                                        rowSpan={cell.rowSpan}
                                                        colSpan={cell.colSpan}
                                                        className="border border-black p-1 min-h-[30px] overflow-hidden break-words text-black font-normal text-[13pt]"
                                                        style={{ whiteSpace: "pre-wrap" }}
                                                    >
                                                        {renderCellContent(cellValue)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {category.children && category.children.length > 0 && (
                    <div className="pl-4">
                        {category.children.map((child, idx) => renderResults(child, index ? `${index}.${idx + 1}` : `${idx + 1}`))}
                    </div>
                )}
            </div>
        );
    };

    const handleDownloadPdf = async () => {
        setIsExporting(true);
        const toastId = toast.loading("Đang chuẩn bị dữ liệu và xuất PDF...");
        try {
            const container = document.getElementById("report-preview-container");
            if (!container) {
                toast.update(toastId, { render: "Không tìm thấy dữ liệu biên bản.", type: "error", isLoading: false, autoClose: 3000 });
                return;
            }

            const getAllStyles = () => {
                let styles = "";
                try {
                    for (let i = 0; i < document.styleSheets.length; i++) {
                        const sheet = document.styleSheets[i];
                        try {
                            const rules = sheet.cssRules || [];
                            for (let j = 0; j < rules.length; j++) {
                                styles += rules[j].cssText + "\n";
                            }
                        } catch (e) {
                            console.warn("Could not read stylesheet rules from:", sheet.href, e);
                        }
                    }
                } catch (e) {
                    console.error("Error reading stylesheets:", e);
                }
                return styles;
            };

            const pageStyles = getAllStyles() + "\n" + REPORT_CSS;

            const origin = window.location.origin;
            const htmlContent = container.innerHTML.replaceAll('src="/', `src="${origin}/`);

            const headerTemplate = `
                <div style="font-size: 13pt; font-family: 'Times New Roman', serif; width: 100%; display: flex; justify-content: flex-end; padding: 2mm 5mm 0 0; -webkit-print-color-adjust: exact;">
                    <span style="color: #979797;">Số biên bản: ${job.reportNumber || ""}</span>
                </div>
            `;

            const footerTemplate = `
                <div style="font-size: 12pt; font-family: 'Times New Roman', serif; width: 100%; text-align: center; font-style: italic; padding: 0 0 5mm 0; -webkit-print-color-adjust: exact;">
                    Trang <span class="pageNumber"></span>/<span class="totalPages"></span>
                </div>
            `;

            const response = await fetch("/api/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    htmlContent,
                    cssContent: pageStyles,
                    headerTemplate,
                    footerTemplate
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Lỗi không xác định" }));
                toast.update(toastId, { render: "Lỗi xuất PDF: " + (errorData.error || response.statusText), type: "error", isLoading: false, autoClose: 3000 });
                return;
            }

            const blob = await response.blob();
            const templateTitle = getTemplateTitle(deviceTypeName);
            const dateStr = format(new Date(), "ddMMyyyy");
            const operatingName = (device as any)?.operatingName || "";
            const fileName = `${operatingName}-${templateTitle}-EAS${dateStr}.pdf`;

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(link.href);

            toast.update(toastId, { render: "Xuất PDF thành công!", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            toast.update(toastId, { render: "Có lỗi khi xuất PDF (Puppeteer): " + (error as any)?.message, type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setIsExporting(false);
        }
    };

    const renderTemplate = () => {
        const props = { job, device, categories, renderResults };
        const n = deviceTypeName.toLowerCase();
        if (n.includes("dcl-1p")) return <DaoCachLyTemplate1P {...props} />;
        if (n.includes("dcl-3p")) return <DaoCachLyTemplate3P {...props} />;
        if (n.normalize("NFC").includes("cc") || n.normalize("NFC").includes("cầu chì tự rơi")) {
            return <CauChiTuRoiTemplate {...props} />;
        }
        if (n.includes("quá dòng")) {
            return <RoleBaoVeQuaDongTemplate {...props} />;
        }
        if (n.includes("mức ngăn")) {
            return <RoleBaoVeSoLechThanhCaiMucNganTemplate {...props} />;
        }
        if (n.includes("thanh cái") && !n.includes("BU")) {
            return <RoleBaoVeSoLechThanhCaiTemplate {...props} />;
        }
        if (n.toLowerCase().includes("so lệch mba")) {
            return <RoleBaoVeSoLechMayBienApTemplate {...props} />;
        }
        if (n.toLowerCase().includes("khoảng cách")) {
            return <RoleBaoVeKhoangCachTemplate {...props} />;
        }
        if (n.toLowerCase().includes("cáp lực")) {
            return <CapLucTemplate {...props} />;
        }
        if (n.toLowerCase().includes("máy biến áp")) {
            return <MayBienApTemplate {...props} />;
        }
        if (n.normalize("NFC").includes("so lệch đường dây".normalize("NFC"))) {
            return <RoleBaoVeSoLechDuongDayTemplate {...props} />;
        }

        if (n.includes("csv") || n.includes("chống sét van")) return <ChongSetVanTemplate {...props} />;
        if (n.includes("tbds") || n.includes("đếm sét")) return <ThietBiDemSetTemplate {...props} />;
        if (n.includes("tu") || n.includes("máy biến điện áp")) return <MayBienDienApKieuTuTemplate {...props} />;
        if (n.includes("ti") || n.includes("máy biến dòng")) return <MayBienDongDienTemplate {...props} />;
        if (n.includes("mc") || n.includes("máy cắt")) return <MayCatTemplate {...props} />;
        if (n.includes("rlbv") || n.includes("rơle") || n.includes("rơ le") || n.includes("relay") || n.includes("rlgsmc") || n.includes("tổng hợp") || n.includes("gscldn") || n.includes("cbl") || n.includes("cc") || n.includes("tbds")) {
            return <RoleBaoVeTemplate {...props} />;
        }

        return <RoleBaoVeTemplate {...props} />;
    };

    return (
        <DashboardLayout>
            <div className="pb-10 print:p-0 print:bg-white overflow-x-hidden relative">
                <div className="sticky top-0 left-0 right-0 z-[999] print:hidden py-3 bg-darkBackgroundV1/80">
                    <div className="flex justify-between items-center">
                        <Button
                            onClick={() => router.back()}
                            variant="ghost"
                        >
                            <Icon path={mdiArrowLeft} size={0.8} /> Quay lại
                        </Button>
                        <Button
                            onClick={handleDownloadPdf}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <Icon path={mdiLoading} size={0.8} className="animate-spin" />
                            ) : (
                                <Icon path={mdiFilePdfBox} size={0.8} />
                            )}
                            {isExporting ? "Đang xuất PDF..." : "Tải xuống biên bản PDF"}
                        </Button>
                    </div>
                </div>

                {/* A4 Page Container */}
                <div id="report-preview-container" className="flex flex-col items-center gap-10 overflow-x-auto print:overflow-visible">
                    {renderTemplate()}
                </div>

                <style jsx global>{`
                ${REPORT_CSS}
                @media print {
                    body {
                        background: none !important;
                        padding: 0 !important;
                    }
                    .fixed {
                        display: none !important;
                    }
                    .a4-page {
                        margin: 0 !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
                    @page {
                        size: A4;
                        margin: 15mm 10mm 8mm 15mm;
                    }
                }
            `}</style>
            </div>
        </DashboardLayout>
    );
}
