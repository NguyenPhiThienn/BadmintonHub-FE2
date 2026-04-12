import { ITestCategory, ITestingDevice, ITestJob } from "@/interface/testing";
import { formatDateOnly } from "@/lib/format";
import { format } from "date-fns";
interface TemplateProps {
  job: ITestJob;
  device: ITestingDevice | undefined;
  categories: ITestCategory[];
  renderResults: (category: ITestCategory, index?: string | number) => JSX.Element | null;
}
export const RoleBaoVeSoLechThanhCaiTemplate = ({ job, device, categories, renderResults }: TemplateProps) => {
  const results = job.testResults || {};
  const BORDER = "1px solid black";
  const isCategoryTested = (cat: any): boolean => {
    const result = results[cat._id];
    if (result && result.isSkipped === false) return true;
    if (cat.children?.length > 0) {
      return cat.children.some((child: any) => isCategoryTested(child));
    }
    return false;
  };
  return (
    <div className="flex flex-col gap-10 bg-white text-black print:gap-0">
      {/* PAGE 1 */}
      <div className="a4-page shadow-2xl print:shadow-none print:m-0 break-after-page relative" style={{ fontFamily: "'Tinos', 'Times New Roman', Times, serif" }}>
        <div className="p-1 flex-1 flex flex-col box-border" style={{ border: BORDER }}>
          <div className="flex-1 flex flex-col box-border">
            <div className="overflow-hidden" style={{ border: BORDER, borderBottom: 0 }}>
              <div className="flex border-b-2 border-b-black">
                <div className="w-[120px] p-2 flex items-center justify-center">
                  <img src="/images/logo.png" className="w-[100px] h-auto object-contain" alt="Logo" />
                </div>
                <div className="flex-1 p-3 text-center flex flex-col justify-center bg-white border-l border-l-black">
                  <div className="text-[12pt] font-semibold text-[#2D508E] leading-tight mb-0.5">CÔNG TY TNHH GIẢI PHÁP TỰ ĐỘNG ĐIỆN</div>
                  <div className="text-[12pt] font-semibold text-[#FF0000] leading-tight mb-1">ELECTRIC AUTOMATION SOLUTION</div>
                  <div className="text-[13pt] leading-tight text-black">
                    <div>452 Tôn Đức Thắng – Phường Hòa Khánh – TP. Đà Nẵng</div>
                    <div>Website: giaiphaptudongdien.com – Email: giaiphaptudongdien@gmail.com</div>
                  </div>
                </div>
              </div>

              {/* Title Row */}
              <div className="p-3 text-center bg-white">
                <div className="text-[14pt] font-semibold text-[#0070BF] uppercase leading-tight">
                  BIÊN BẢN THÍ NGHIỆM BẢO VỆ SO LỆCH THANH CÁI
                </div>
                <div className="text-[14pt] font-semibold text-[#C05711] italic leading-tight mt-0.5">
                  (Busbar differential protection Test Report)
                </div>
              </div>
            </div>

            {/* Technical Info Table */}
            <div>
              <table className="w-full text-[13pt] border-collapse tech-info-table pointer-events-none" style={{ tableLayout: "fixed" }}>
                <tbody>
                  <tr>
                    <td colSpan={2} className="px-2 py-0">
                      Tên dự án <span className="italic text-[11pt]">(Project)</span>: <span>{job.projectName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-2 py-0">
                      Vị trí lắp đặt <span className="italic text-[11pt]">(Site)</span>: <span>{device?.site || ""}</span>
                    </td>
                  </tr>
                  <tr className="min-h-[35px]">
                    <td className="px-2 py-0 align-top" style={{ width: "50%" }}>
                      Tên thiết bị <span className="italic text-[11pt]">(Model)</span>: <span>{device?.operatingName || ""}</span>
                    </td>
                    <td className="px-2 py-0 align-top" style={{ width: "50%", borderLeft: 0 }}>
                      <div className="flex flex-col">
                        <div className="whitespace-nowrap mr-1">
                          Số chế tạo <span className="italic text-[11pt]">(Serial Nº)</span>:
                        </div>
                        <div className="flex-1">
                          {(() => {
                            if (!device?.serialJson) return "";
                            try {
                              const parsed = typeof device.serialJson === "string" ? JSON.parse(device.serialJson) : device.serialJson;
                              if (!parsed || !parsed.data) return device.serialJson;

                              const keys = Object.keys(parsed.data);
                              const rowIndices = new Set<number>();
                              const colIndices = new Set<number>();
                              keys.forEach((k) => {
                                const m = k.match(/serial_(\d+)[-_](\d+)/);
                                if (m) {
                                  rowIndices.add(parseInt(m[1]));
                                  colIndices.add(parseInt(m[2]));
                                }
                              });

                              if (rowIndices.size === 0) return device.serialJson;
                              const maxRow = Math.max(...Array.from(rowIndices));
                              const maxCol = Math.max(...Array.from(colIndices));

                              return (
                                <table className="w-full !border-none border-collapse" style={{ border: "none" }}>
                                  <tbody>
                                    {Array.from({ length: maxRow }).map((_, rIdx) => {
                                      const r = rIdx + 1;
                                      const hasRowData = Array.from({ length: maxCol }).some((_, cIdx) => {
                                        const c = cIdx + 1;
                                        return !!(parsed.data[`serial_${r}_${c}`] || parsed.data[`serial_${r}-${c}`]);
                                      });
                                      if (!hasRowData) return null;
                                      return (
                                        <tr key={r} style={{ border: "none" }}>
                                          {Array.from({ length: maxCol }).map((_, cIdx) => {
                                            const c = cIdx + 1;
                                            const val = parsed.data[`serial_${r}_${c}`] || parsed.data[`serial_${r}-${c}`] || "";
                                            return (
                                              <td
                                                key={c}
                                                className="p-0 pr-2 !border-none text-[13pt] font-normal leading-tight"
                                                style={{ border: "none", padding: "0 4px 2px 0" }}
                                              >
                                                {val}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              );
                            } catch {
                              return device.serialJson;
                            }
                          })()}
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-0" style={{ width: "50%" }}>
                      Hãng sản xuất <span className="italic text-[11pt]">(Manufacturer)</span>: <span>{device?.manufacturer || ""}</span>
                    </td>
                    <td className="px-2 py-0" style={{ width: "50%", borderLeft: 0 }}>
                      Kiểu <span className="italic text-[11pt]">(Type)</span>: <span>{device?.deviceModel || ""}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-2 py-0">
                      Đối tượng bảo vệ <span className="italic text-[11pt]">(Protection Object)</span>: <span>{(device as any)?.protectionObject || ""}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-2 py-0">
                      Thiết bị thí nghiệm <span className="italic text-[11pt]">(Test equipment)</span>: <span>{job.testingTools || ""}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-0" style={{ width: "50%" }}>
                      Nơi thí nghiệm <span className="italic text-[11pt]">(Location test)</span>: <span>{(device as any)?.testLocation || ""}</span>
                    </td>
                    <td className="px-2 py-0" style={{ width: "50%", borderLeft: 0 }}>
                      Ngày thí nghiệm <span className="italic text-[11pt]">(Test date)</span>: <span>{job.testDate ? formatDateOnly(job.testDate) : ""}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-2 py-0">
                      Lý do thí nghiệm <span className="italic text-[11pt]">(Purpose of test)</span>: <span>{job.purpose || ""}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-2 py-0" style={{ borderBottom: 0 }}>
                      Phiếu chỉnh định <span className="italic text-[11pt]">(Setting Order)</span>: <span>{(device as any)?.settingOrder || ""}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <style jsx>{`
              .tech-info-table > tbody > tr > td {
                border: ${BORDER};
              }
              .tech-info-table > tbody > tr:last-child > td {
                border-bottom: 0 !important;
              }
            `}</style>

            {/* Items Table */}
            <table className="w-full border-collapse text-[13pt]">
              <thead>
                <tr className="leading-tight text-center">
                  <th colSpan={2} className="py-0 px-2 text-left font-semibold" style={{ borderLeft: BORDER, borderRight: BORDER, borderBottom: BORDER, borderTop: BORDER }}>
                    Các hạng mục đã thí nghiệm <span className="italic">(Tested items):</span>
                  </th>
                  <th className="w-[130px] font-normal text-center py-0 px-2" style={{ borderLeft: BORDER, borderRight: BORDER, borderBottom: BORDER, borderTop: BORDER }}>
                    <div>Đánh giá</div>
                    <div className="italic font-normal text-[11pt]">(Estimate)</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat: any, i: number) => {
                  const isTested = isCategoryTested(cat);
                  const nameParts = cat.name.split('(');
                  const vnName = nameParts[0].trim();
                  const engName = nameParts[1]?.replace(')', '').trim();

                  return (
                    <tr key={cat._id} className="min-h-[30px]">
                      <td className="px-2 py-0 text-left font-normal leading-tight" style={{ border: BORDER }}>
                        {i + 1}. {vnName} {engName && <span className="italic text-[11pt]">({engName})</span>}
                      </td>
                      <td className="py-1 px-2 text-center w-[40px]" style={{ border: BORDER }}>
                        {isTested ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : ""}
                      </td>
                      <td className="py-0 px-2 text-center font-normal w-[130px] text-[13pt]" style={{ border: BORDER }}>
                        {isTested ? "Đạt" : ""}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Remark & Conclusion Section */}
            <div>
              <div className="py-0 px-2 text-left font-semibold border border-black border-t-0">
                <span className="font-semibold">GHI CHÚ</span> <span className="italic text-[11pt] font-normal">(Remark):</span> <span className="font-normal text-[13pt]">{job.notes || "/"}</span>
              </div>
              <div className="py-0 px-2 text-left border border-black border-t-0">
                <div className="leading-tight">
                  <span className="font-semibold uppercase">KẾT LUẬN</span> <span className="italic font-normal text-[11pt] ">(Conclusion):</span>{" "}
                  <span className="font-normal text-[13pt]">
                    {(() => {
                      const text = job.conclusion || "Các hạng mục đã thí nghiệm đạt yêu cầu kỹ thuật.";
                      const parts = text.split("(");
                      if (parts.length < 2) return text;
                      const vn = parts[0].trim();
                      const en = parts[1].split(")")[0].trim();
                      return (
                        <>
                          {vn} <span className="italic text-[11pt] font-normal">({en})</span>
                        </>
                      );
                    })()}
                  </span>
                </div>
              </div>
            </div>
            {/* Signatures Area */}
            <div className="mt-auto">
              <div className="text-right italic text-[13pt] pr-4">
                Đà Nẵng, ngày {job.testDate ? format(new Date(job.testDate), "dd") : "--"} tháng {job.testDate ? format(new Date(job.testDate), "MM") : "--"} năm {job.testDate ? format(new Date(job.testDate), "yyyy") : "----"}
              </div>

              <div className="flex justify-between px-4 text-center pb-10">
                {/* Testers */}
                <div className="w-1/3 flex flex-col items-center">
                  <div className="font-semibold text-[#0070BF] text-[13pt]">Người thí nghiệm</div>
                  <div className="italic text-[11pt] mb-1">(Testers)</div>
                  <div className="h-16 flex items-center justify-center">
                    {job.testerId?.digitalSignature ? (
                      <img src={job.testerId.digitalSignature} className="h-16 w-auto object-contain print:block" alt="Signature" />
                    ) : <div className="h-16"></div>}
                  </div>
                  <div className="text-left font-normal pl-2 space-y-1 mt-2">
                    {job.testerName?.split(',').map((name: string, idx: number) => (
                      <div key={idx}>{idx + 1}. {name.trim()}</div>
                    ))}
                  </div>
                </div>

                {/* Approver */}
                <div className="w-1/3 flex flex-col items-center">
                  <div className="font-semibold text-[#0070BF] text-[13pt]">Người kiểm duyệt</div>
                  <div className="italic text-[11pt] mb-1">(Approver)</div>
                  <div className="h-16 flex items-center justify-center">
                    {job.approverId?.digitalSignature ? (
                      <img src={job.approverId.digitalSignature} className="h-16 w-auto object-contain print:block" alt="Signature" />
                    ) : <div className="h-16"></div>}
                  </div>
                  <div className="font-semibold text-[13pt] mt-2">{job.approverId?.fullName || job.approverName}</div>
                </div>

                {/* Director */}
                <div className="w-1/3 flex flex-col items-center">
                  <div className="font-semibold text-black text-[13pt]">GIÁM ĐỐC</div>
                  <div className="italic text-[11pt] mb-1">(Director)</div>
                  <div className="h-16 flex items-center justify-center">
                    {job.directorId?.digitalSignature ? (
                      <img src={job.directorId.digitalSignature} className="h-16 w-auto object-contain print:block" alt="Signature" />
                    ) : <div className="h-16"></div>}
                  </div>
                  <div className="font-semibold text-[13pt] mt-2">{job.directorId?.fullName || job.directorName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="print:hidden absolute bottom-4 left-0 right-0 text-center text-[11pt] italic">Trang 1/n</div>
      </div>

      {/* PAGE 2+ DETAILED RESULTS */}
      <div className="a4-page shadow-2xl print:shadow-none print:m-0" style={{ fontFamily: "'Tinos', 'Times New Roman', Times, serif" }}>
        <div className="flex-1 flex flex-col box-border">
          <div className="relative mb-4 px-1">
            <div className="text-center">
              <div className="text-[14pt] font-semibold uppercase leading-tight">KẾT QUẢ THÍ NGHIỆM</div>
              <div className="text-[11pt] italic font-normal">(TESTING RESULTS)</div>
            </div>
          </div>

          <div className="space-y-4 px-1">
            {categories.map((cat: any, i: number) => (
              <div key={cat._id} className="break-inside-avoid">
                {renderResults(cat, i + 1)}
              </div>
            ))}
          </div>
        </div>

        {/* Web Preview Only: Page Footer */}
        <div className="print:hidden absolute bottom-4 left-0 right-0 text-center text-[11pt] italic">Trang n/n</div>
      </div>
    </div>
  );
};
