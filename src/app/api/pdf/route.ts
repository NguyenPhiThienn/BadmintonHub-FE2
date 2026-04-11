import chromium from "@sparticuz/chromium";
import { NextRequest, NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    let browser: any = null;
    try {
        const { htmlContent, cssContent, headerTemplate, footerTemplate } = await request.json();

        if (!htmlContent) {
            return NextResponse.json({ error: "htmlContent is required" }, { status: 400 });
        }

        const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === "production";

        if (isProduction) {
            browser = await puppeteerCore.launch({
                args: chromium.args,
                executablePath: await chromium.executablePath(),
                headless: true,
            });
        } else {
            const puppeteer = require("puppeteer");
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
        }

        const page = await browser.newPage();

        const fullHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <!--
                        Tinos is metrically compatible with Times New Roman (Google Fonts).
                        We embed it here because @sparticuz/chromium on Vercel/Lambda does NOT
                        have system fonts like Times New Roman installed.
                    -->
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        /* Map Times New Roman -> Tinos for Vercel/Lambda compatibility */
                        @font-face {
                            font-family: 'Times New Roman';
                            font-style: normal;
                            font-weight: 400;
                            src: local('Tinos'), local('Tinos-Regular');
                        }
                        * {
                            font-family: 'Tinos', 'Times New Roman', Times, serif, 'DejaVu Sans', Arial, sans-serif !important;
                        }
                        ${cssContent}
                        @page {
                            size: A4;
                            margin: 15mm 10mm 8mm 15mm;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        .a4-page {
                            box-shadow: none !important;
                            margin: 0 !important;
                            /* page-break-after: always; removed to allow natural flow if needed */
                            box-sizing: border-box;
                            position: relative;
                        }
                        table { border-collapse: collapse !important; }
                        td, th { border: 0.5pt solid black !important; }

                        /* Printing helpers */
                        .break-inside-avoid {
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .break-after-page {
                            page-break-after: always;
                            break-after: page;
                        }
                    </style>
                </head>
                <body>
                    <div style="width: 210mm; margin: 0 auto;">
                        ${htmlContent}
                    </div>
                </body>
            </html>
        `;

        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
        await page.setContent(fullHtml, { waitUntil: ["networkidle0", "load", "domcontentloaded"] });
        await new Promise(r => setTimeout(r, 1000));

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            displayHeaderFooter: !!(headerTemplate || footerTemplate),
            headerTemplate: headerTemplate || "<div></div>",
            footerTemplate: footerTemplate || "<div></div>",
            margin: {
                top: "15mm",
                bottom: "8mm",
                right: "10mm",
                left: "15mm"
            },
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment",
            },
        });
    } catch (error) {
        if (browser) await browser.close().catch(() => { });
        return NextResponse.json(
            { error: (error as any)?.message || "Unknown error during PDF generation" },
            { status: 500 }
        );
    }
}
