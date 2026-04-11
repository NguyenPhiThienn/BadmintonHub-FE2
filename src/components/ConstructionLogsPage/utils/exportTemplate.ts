import { IConstructionLog } from "@/interface/task";
import { format as formatFns, parseISO } from "date-fns";

export const downloadConstructionLogDoc = (htmlContent: string, projectName: string) => {
    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Nhat_Ky_Thi_Cong_${projectName || "Export"}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const generateConstructionLogHtml = (logData: IConstructionLog) => {
    const logDate = logData.logDate ? parseISO(logData.logDate) : new Date();
    const day = formatFns(logDate, "dd");
    const month = formatFns(logDate, "MM");
    const year = formatFns(logDate, "yyyy");

    const commanderName = typeof logData.commander === 'object' ? logData.commander.fullName : (logData.commander || "....................");
    const supervisorName = logData.supervisorName || logData.supervisor || "....................";
    const constructionName = logData.constructionName || "....................";
    const location = logData.location || logData.constructionSite || "....................";
    const investor = logData.investor || "....................";
    const supervisionUnit = logData.supervisionUnit || logData.supervisionConsultingUnit || "....................";
    const contractor = logData.constructionContractor || "CÔNG TY TNHH GIẢI PHÁP TỰ ĐỘNG ĐIỆN";

    const formatTime = (h: number) => {
        if (h === undefined || h === null) return "..h..";
        const hours = Math.floor(h);
        const minutes = (h % 1) * 60;
        return `${hours}h${minutes === 0 ? "00" : (minutes < 10 ? "0" + minutes : minutes)}`;
    };

    const morningStart = logData.workingHours?.morning?.start;
    const morningEnd = logData.workingHours?.morning?.end;
    const afternoonStart = logData.workingHours?.afternoon?.start;
    const afternoonEnd = logData.workingHours?.afternoon?.end;

    const weather = logData.weather || "....................";
    const temperature = logData.temperature ? `${logData.temperature}` : "........";
    const employeeCount = logData.employeeCount || "....................";
    const equipmentUsed = Array.isArray(logData.equipmentUsed) ? (logData.equipmentUsed as string[]).join(", ") : (logData.equipmentUsed || "....................");
    const cleanHtml = (html: string | undefined) => {
        if (!html) return "";
        // Remove Quill specific classes and inline styles that might cause black backgrounds in Word
        return html
            .replace(/class="ql-[^"]*"/g, "")
            .replace(/style="[^"]*"/g, "")
            .replace(/<p><br><\/p>/g, ""); // Remove empty lines at the end
    };

    const workDescription = cleanHtml(logData.workDescription) || "....................";
    const dailyWorkVolume = cleanHtml(logData.dailyWorkVolume) || "...............................................................................................................................................";
    const mainWorkItems = cleanHtml(logData.mainWorkItems) || "...............................................................................................................................................";
    const materialsHandoverB = cleanHtml(logData.materialsHandoverB) || "...............................................................................................................................................";
    const transitionalAcceptance = cleanHtml(logData.transitionalAcceptance) || ".............................................................";
    const supervisorNotes = cleanHtml(logData.supervisorNotes) || ".............................................................";
    const sEval = logData.supervisorEvaluation;

    const renderCheck = (condition: boolean) => condition ? "x" : "&nbsp;";
    const renderStatusCheck = (current: string | undefined, target: string) => current === target ? "x" : "&nbsp;";

    const nextDayWorkProposals = cleanHtml(sEval?.nextDayWorkProposals);
    const progressProposals = cleanHtml(sEval?.progressProposals);

    return `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="UTF-8">
    <style>
        @page Section1 {
            size: 21.0cm 29.7cm;
            margin: 1.5cm 2.0cm 1.5cm 2.5cm;
        }
        div.Section1 { page: Section1; }
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 2.25; }
        p, ul, ol, li { margin-top: 0; padding-top: 0; margin-bottom: 0; padding-bottom: 0; }
        ul, ol, li { line-height: 2.25; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .page-break { page-break-before: always; }
        .cover-border {
            border: 4.5pt double black;
            padding: 2.0cm 1.5cm;
            min-height: 26.5cm;
        }
    </style>
</head>
<body>
<div class="Section1">
    <div class="cover-border">
        <p style="text-align:center;"><strong><span style="font-size:13pt;">CỘNG H&Ograve;A X&Atilde; HỘI CHỦ NGHĨA VIỆT NAM</span></strong></p>
        <p style="text-align:center;"><strong><u><span style="font-size:13pt;">Độc lập &ndash;</span></u></strong><strong><u><span style="font-size:13pt;">&nbsp;&nbsp;</span></u></strong><strong><u><span style="font-size:13pt;">Tự do &ndash; Hạnh ph&uacute;c</span></u></strong></p>
        <p style="text-align:center;"><strong><span style="font-size:13pt;">&nbsp;</span></strong></p>
        <p style="text-align:center;"><strong><span style="font-size:13pt;">&nbsp;</span></strong></p>
        <p style="text-align:center;"><strong><span style="font-size:13pt;">S&Ocirc;̉ NH&Acirc;̣T KÝ THI C&Ocirc;NG</span></strong></p>
        <p style="text-align:center;"><strong><span style="font-size:13pt;">&nbsp;</span></strong></p>
        <table cellspacing="0" cellpadding="0" style="width:100%; margin-top:20pt; border-collapse:collapse;">
            <tbody>
                <tr>
                    <td style="width:120pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:right;"><strong><span style="font-size:13pt;">Hạng mục:</span></strong></p>
                    </td>
                    <td style="padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:justify;"><strong><span style="font-size:13pt;">${constructionName}</span></strong></p>
                    </td>
                </tr>
                <tr>
                    <td style="width:120pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:right;"><strong><span style="font-size:13pt;">Địa điểm:</span></strong></p>
                    </td>
                    <td style="padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p><strong><span style="font-size:13pt;">${location}</span></strong></p>
                    </td>
                </tr>
                <tr>
                    <td style="width:120pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:right;"><strong><span style="font-size:13pt;">Chủ đầu tư:</span></strong></p>
                    </td>
                    <td style="padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="widows:0; orphans:0;"><strong><span style="font-size:13pt;">${investor}</span></strong></p>
                    </td>
                </tr>
                <tr>
                    <td style="width:120pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:right;"><strong><span style="font-size:13pt;">Đơn vị giám sát:</span></strong></p>
                    </td>
                    <td style="padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:justify;"><strong><span style="font-size:13pt;">${supervisionUnit}</span></strong></p>
                    </td>
                </tr>
                <tr>
                    <td style="width:120pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:right;"><strong><span style="font-size:13pt;">B&ecirc;n thi c&ocirc;ng:</span></strong></p>
                    </td>
                    <td style="padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p><strong><span style="font-size:13pt;">${contractor}</span></strong></p>
                    </td>
                </tr>
            </tbody>
        </table>
        <p style="text-align:center;"><span style="font-size:13pt;">&nbsp;</span></p>
        <table cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%;">
            <tbody>
                <tr>
                    <td style="width:50%; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:center; widows:0; orphans:0;"><strong><span style="font-size:13pt;">${investor.toUpperCase()}</span></strong></p>
                        <p style="text-align:center;"><span style="font-size:13pt;">&nbsp;</span></p>
                    </td>
                    <td style="width:50%; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                        <p style="text-align:center; widows:0; orphans:0;"><strong><span style="font-size:13pt;">${contractor.toUpperCase()}</span></strong></p>
                    </td>
                </tr>
            </tbody>
        </table>
        <p style="text-align:center;"><span style="font-size:13pt;">&nbsp;</span></p>
        <p style="text-align:center;"><em><span style="font-size:13pt;">${location}, th&aacute;ng ${month} năm ${year}</span></em></p>
    </div>

    <p style="text-align:center; background-color:#ffffff;"><br style="page-break-before:always; clear:both;"></p>
    <p style="text-align:center;"><strong><span style="font-size:13pt;">NHỮNG TH&Ocirc;NG TIN CHUNG VỀ C&OCWONG TR&Igrave;NH</span></strong><span style="font-size:13pt;">&nbsp;</span></p>
    <p><strong>1. Hạng mục:</strong> ${constructionName}</p>
    <p><strong>2. Địa điểm:</strong> ${location}</p>
    <p style="widows:0; orphans:0;"><strong>3. Chủ đầu tư:&nbsp;</strong>${investor}</p>
    <p style="widows:0; orphans:0;"><strong>4. Đơn vị giám sát:&nbsp;</strong>${supervisionUnit}</p>
    <p><strong>5.</strong> <strong>B&ecirc;n thi c&ocirc;ng:&nbsp;</strong>${contractor}</p>
    <p><strong>6. C&aacute;c th&ocirc;ng tin kh&aacute;c:&nbsp;</strong></p>
    <p>Thời gian thi c&ocirc;ng:</p>
    <p>+ Bắt đầu từ ng&agrave;y: ........</p>
    <p>+ Kết th&uacute;c ng&agrave;y: ........</p>
    <p>- Họ v&agrave; t&ecirc;n người kiểm tra gi&aacute;m s&aacute;t c&ocirc;ng việc: <strong>${supervisorName}</strong>; Chữ k&yacute;:&hellip;&hellip;&hellip;&hellip;</p>
    <p>- Chức vụ: &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;</p>
    <p>- Họ v&agrave; t&ecirc;n người thi c&ocirc;ng: <strong>${commanderName}</strong>; Chữ k&yacute;:&hellip;&hellip;..</p>
    <p>- Chức vụ: &hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;&hellip;</p>
    <p><span style="font-size:13pt;">&nbsp;</span></p>
    <p><span style="font-size:13pt;">&nbsp;</span></p>
    <p><span style="font-size:13pt;">&nbsp;</span></p>
    <p><span style="font-size:13pt;">&nbsp;</span></p>
    <p style="text-align:center;"><br style="page-break-before:always; clear:both;"></p>
    <p style="text-align:center;"><strong><span style="font-size:13pt;">NHẬT K&Yacute; THI C&Ocirc;NG X&Acirc;Y DỰNG C&Ocirc;NG TR&Igrave;NH</span></strong></p>
    <p>1. Ng&agrave;y ${day} th&aacute;ng ${month} năm ${year};</p>
    <p>Ca sáng từ ${formatTime(morningStart)} đ&ecirc;́n ${formatTime(morningEnd)}</p>
    <p>Ca chi&ecirc;̀u từ ${formatTime(afternoonStart)} đ&ecirc;́n ${formatTime(afternoonEnd)}</p>
    <p>2. Người ghi nhật k&yacute;: <strong>${commanderName}</strong></p>
    <p>3. T&igrave;nh h&igrave;nh thời tiết: ${weather}; Nhiệt độ: ${temperature}°C</p>
    <p>4. Đơn vị giám sát: ${supervisionUnit}</p>
    <p>5. Lực lượng c&ocirc;ng nh&acirc;n x&acirc;y lắp: ${employeeCount}</p>
    <p>6. Liệt k&ecirc; m&aacute;y m&oacute;c thi c&ocirc;ng: ${equipmentUsed}</p>
    <p>7. C&ocirc;ng việc thực hiện trong ng&agrave;y:</p>
    <div style="line-height: 2.25;">${workDescription}</div>
    <p>&nbsp;</p>
    <p>8. Khối lượng thi c&ocirc;ng trong ng&agrave;y:</p>
    <div style="line-height: 2.25;">${dailyWorkVolume}</div>
    <p>9. Liệt k&ecirc; c&aacute;c hạng mục c&ocirc;ng việc ch&iacute;nh bắt đầu triển khai/hoặc ho&agrave;n th&agrave;nh đến ng&agrave;y ghi nhật k&yacute;:</p>
    <div style="line-height: 2.25;">${mainWorkItems}</div>
    <p>10. T&igrave;nh h&igrave;nh b&agrave;n giao vật tư cho b&ecirc;n B:</p>
    <div style="line-height: 2.25;">${materialsHandoverB}</div>
    <p>11. C&ocirc;ng t&aacute;c nghiệm thu chuyển giai đoạn thi c&ocirc;ng:</p>
    <div style="line-height: 2.25;">${transitionalAcceptance}</div>
    <p>12. C&aacute;c lưu &yacute; của gi&aacute;m s&aacute;t A đối với nh&agrave; thầu (nếu c&oacute;):</p>
    <div style="line-height: 2.25;">${supervisorNotes}</div>
    <p>13. Đ&aacute;nh gi&aacute; của gi&aacute;m s&aacute;t A:</p>
    <p>- Tiến độ c&ocirc;ng việc c&oacute; đ&aacute;p ứng tiến độ thỏa thuận: ${sEval?.isScheduleOnTrack ? "C&oacute;" : "Kh&ocirc;ng"}</p>
    <p>- Nh&agrave; thầu c&oacute; bố tr&iacute; đủ nh&acirc;n lực v&agrave; m&aacute;y m&oacute;c theo cam kết: ${sEval?.isSufficientLaborAndEquipment ? "C&oacute;" : "Kh&ocirc;ng"}</p>
    <p>- Chất lượng thi c&ocirc;ng c&oacute; đảm bảo/kh&ocirc;ng đảm bảo: ${sEval?.isConstructionQualityGood ? "Đảm bảo" : "Kh&ocirc;ng đảm bảo"}</p>
    <p>- Tình hình công tác an toàn lao động: </p>
    <table cellspacing="0" cellpadding="0" style="margin-left:48pt; border-collapse:collapse; line-height: 1;">
        <tr>
            <td style="width:12pt; height:12pt; border:1pt solid black; line-height: 1; font-size: 13pt; text-align: center;">${renderStatusCheck(sEval?.laborSafetyStatus, "Tốt")}</td>
            <td style="padding-left:5pt; padding-right:20pt; font-size:13pt;">Tốt</td>
            <td style="width:12pt; height:12pt; border:1pt solid black; line-height: 1; font-size: 13pt; text-align: center;">${renderStatusCheck(sEval?.laborSafetyStatus, "Bình thường")}</td>
            <td style="padding-left:5pt; padding-right:20pt; font-size:13pt;">Bình thường</td>
            <td style="width:12pt; height:12pt; border:1pt solid black; line-height: 1; font-size: 13pt; text-align: center;">${renderStatusCheck(sEval?.laborSafetyStatus, "Kém")}</td>
            <td style="padding-left:5pt; font-size:13pt;">Kém</td>
        </tr>
    </table>
    <p>- Tình hình công tác vệ sinh môi trường:</p>
    <table cellspacing="0" cellpadding="0" style="margin-left:48pt; border-collapse:collapse; line-height: 1;">
        <tr>
            <td style="width:12pt; height:12pt; border:1pt solid black; line-height: 1; font-size: 13pt; text-align: center;">${renderStatusCheck(sEval?.environmentalSanitationStatus, "Tốt")}</td>
            <td style="padding-left:5pt; padding-right:20pt; font-size:13pt;">Tốt</td>
            <td style="width:12pt; height:12pt; border:1pt solid black; line-height: 1; font-size: 13pt; text-align: center;">${renderStatusCheck(sEval?.environmentalSanitationStatus, "Bình thường")}</td>
            <td style="padding-left:5pt; padding-right:20pt; font-size:13pt;">Bình thường</td>
            <td style="width:12pt; height:12pt; border:1pt solid black; line-height: 1; font-size: 13pt; text-align: center;">${renderStatusCheck(sEval?.environmentalSanitationStatus, "Kém")}</td>
            <td style="padding-left:5pt; font-size:13pt;">Kém</td>
        </tr>
    </table>
    <p>- Những đề xuất c&ocirc;ng việc ng&agrave;y tới:</p>
    <div style="line-height: 2.25;">${nextDayWorkProposals || "............................................................."}</div>
    <p>- Những đề xuất để đảm bảo tiến độ:</p>
    <div style="line-height: 2.25;">${progressProposals || "............................................................."}</div>

    <table cellspacing="0" cellpadding="0" style="width:100%; border-collapse:collapse; margin-top: 20pt;">
        <tbody>
            <tr style="height:58.75pt;">
                <td style="width:50%; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="text-align:center; line-height:120%;"><strong>Gi&aacute;m s&aacute;t thi c&ocirc;ng của Chủ đầu tư</strong></p>
                    <p style="text-align:center; line-height:120%;"><em>(K&yacute;, ghi r&otilde; họ t&ecirc;n)</em></p>
                </td>
                <td style="width:50%; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="text-align:center; line-height:120%;"><strong>Kỹ thuật thi c&ocirc;ng trực tiếp của Nh&agrave; thầu</strong></p>
                    <p style="text-align:center; line-height:120%;"><em>(K&yacute;, ghi r&otilde; họ t&ecirc;n)</em></p>
                </td>
            </tr>
        </tbody>
    </table>
    <p style="text-align:center;"><span style="font-size:13pt;">&nbsp;</span></p>
    <div style="clear:both;">
        <p style="margin-top:6pt; margin-left:47.9pt; margin-bottom:6pt;"><span style="font-size:13pt;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
        <p style="margin-top:6pt; margin-left:47.9pt; margin-bottom:6pt;">&nbsp;</p>
    </div>
</div>
</body>
</html>`;
};
