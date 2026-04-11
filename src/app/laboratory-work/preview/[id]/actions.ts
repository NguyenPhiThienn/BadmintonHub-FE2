"use server";
import HTMLtoDOCX from "html-to-docx";
import puppeteer from "puppeteer";

export async function generateDocxAction(htmlContent: string) {
    try {
        const docxBuffer = await HTMLtoDOCX(htmlContent, null, {
            table: { row: { cantSplit: true } },
            footer: false,
            pageNumber: false,
            lang: "vi-VN",
            margins: {
                top: 850,
                right: 600,
                bottom: 1134,
                left: 850,
            },
        });

        return (docxBuffer as Buffer).toString("base64");
    } catch (error) {
        throw new Error("Failed to generate DOCX file on server.");
    }
}

export interface PdfResponse {
    success: boolean;
    data?: number[];
    error?: string;
}

export async function generatePdfAction(htmlContent: string, cssContent: string): Promise<PdfResponse> {
    let browser = null;
    try {
        const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === "production";

        if (isServerless) {
            const chromium = require("@sparticuz/chromium");
            const puppeteerCore = require("puppeteer-core");

            browser = await puppeteerCore.launch({
                args: [
                    ...chromium.args,
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
                // IMPORTANT: call executablePath() with NO arguments
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else {
            // Local development: use standard puppeteer (has bundled Chrome)
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            });
        }

        const page = await browser.newPage();

        const fullHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        ${cssContent}
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        .a4-page {
                            box-shadow: none !important;
                            margin: 0 !important;
                            page-break-after: always;
                            box-sizing: border-box;
                            position: relative;
                            overflow: hidden;
                        }
                        .a4-page:last-child {
                            page-break-after: auto;
                        }
                        table { border-collapse: collapse !important; }
                        td, th { border: 0.5pt solid black !important; }
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

        // Give Tailwind a moment to parse the classes
        await new Promise(r => setTimeout(r, 1000));

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            displayHeaderFooter: false,
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });

        await browser.close();
        return {
            success: true,
            data: Array.from(new Uint8Array(pdfBuffer as Buffer)),
        };
    } catch (error) {
        if (browser) await (browser as any).close();
        return {
            success: false,
            error: (error as any)?.message || "Unknown error during PDF generation",
        };
    }
}
