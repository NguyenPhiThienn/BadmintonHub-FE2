"use client";

import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isFirstRender = useRef(true);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear existing content to avoid double toolbar in React 18 Strict Mode
        containerRef.current.innerHTML = "";
        const editorDiv = document.createElement("div");
        containerRef.current.appendChild(editorDiv);

        const quill = new Quill(editorDiv, {
            theme: "snow",
            placeholder: placeholder || "Nhập nội dung...",
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["clean"],
                ],
            },
        });

        quillRef.current = quill;

        // Set initial value
        if (value) {
            quill.clipboard.dangerouslyPasteHTML(value);
        }

        quill.on("text-change", () => {
            const html = quill.root.innerHTML;
            if (html === "<p><br></p>") {
                onChangeRef.current("");
            } else {
                onChangeRef.current(html);
            }
        });

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
            quillRef.current = null;
        };
    }, []);

    // Handle external value changes
    useEffect(() => {
        if (quillRef.current && value !== quillRef.current.root.innerHTML) {
            // Only update if it's not the first render to avoid double setting
            // or if the value is significantly different (e.g. from outside)
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }

            // To prevent cursor jumping, we only set if necessary
            const currentHTML = quillRef.current.root.innerHTML;
            if (value !== currentHTML && !(value === "" && currentHTML === "<p><br></p>")) {
                quillRef.current.clipboard.dangerouslyPasteHTML(value || "");
            }
        }
    }, [value]);

    return (
        <div className={`rich-text-editor-container ${className || ""}`}>
            <style jsx global>{`
                .rich-text-editor-container .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-color: #233738 !important;
                    border-color: #333 !important;
                }
                /* Apply requested color to the snow theme toolbar */
                .rich-text-editor-container .ql-snow.ql-toolbar {
                    background-color: #233738 !important;
                }
                .rich-text-editor-container .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    background-color: transparent;
                    border-color: #333 !important;
                    min-height: 130px;
                    max-height: 130px;
                    overflow-y: auto;
                    font-family: inherit;
                }
                .rich-text-editor-container .ql-container::-webkit-scrollbar {
                    width: 4px;
                }
                .rich-text-editor-container .ql-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .rich-text-editor-container .ql-container::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
                .rich-text-editor-container .ql-container::-webkit-scrollbar-thumb:hover {
                    background: #444;
                }
                .rich-text-editor-container .ql-editor {
                    font-size: 0.875rem;
                    line-height: 1.5;
                    color: #d4d4d4;
                    min-height: 120px;
                }
                .rich-text-editor-container .ql-editor p {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .rich-text-editor-container .ql-editor.ql-blank::before {
                    color: #737373;
                    font-style: normal;
                }
                .rich-text-editor-container .ql-snow.ql-toolbar button {
                    color: #a3a3a3;
                }
                .rich-text-editor-container .ql-snow.ql-toolbar button:hover,
                .rich-text-editor-container .ql-snow.ql-toolbar button.ql-active {
                    color: #41C651;
                }
                .rich-text-editor-container .ql-snow.ql-toolbar button svg .ql-stroke {
                    stroke: currentColor;
                }
                .rich-text-editor-container .ql-snow.ql-toolbar button svg .ql-fill {
                    fill: currentColor;
                }
                .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker {
                    color: #fff;
                }
                .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label:hover,
                .rich-text-editor-container .ql-snow.ql-toolbar .ql-picker-label.ql-active {
                    color: #41C651;
                }
                .rich-text-editor-container .ql-snow .ql-picker-options {
                    background-color: #233738 !important;
                    border-color: #333 !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
                }
                .rich-text-editor-container .ql-snow .ql-picker-item {
                    color: #d4d4d4 !important;
                }
                .rich-text-editor-container .ql-snow .ql-picker-item:hover,
                .rich-text-editor-container .ql-snow .ql-picker-item.ql-selected {
                    color: #41C651 !important;
                    background-color: rgba(65, 198, 81, 0.1) !important;
                }
            `}</style>
            <div ref={containerRef} />
        </div>
    );
}
