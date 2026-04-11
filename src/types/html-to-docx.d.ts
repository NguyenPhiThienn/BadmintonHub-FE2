declare module 'html-to-docx' {
  interface Margins {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    header?: number;
    footer?: number;
    gutter?: number;
  }

  interface TableRow {
    cantSplit?: boolean;
  }

  interface TableOptions {
    row?: TableRow;
  }

  interface HTMLtoDOCXOptions {
    table?: TableOptions;
    footer?: boolean;
    pageNumber?: boolean;
    lang?: string;
    margins?: Margins;
    font?: string;
    fontSize?: number;
    complexScriptFontSize?: number;
    orientation?: 'portrait' | 'landscape';
    creator?: string;
    title?: string;
    subject?: string;
    description?: string;
    lastModifiedBy?: string;
    revision?: number;
    createdAt?: Date;
    modifiedAt?: Date;
    headerType?: string;
    header?: boolean;
    decodeUnicode?: boolean;
    lineNumber?: boolean;
    lineNumberOptions?: Record<string, unknown>;
  }

  function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString: string | null,
    options?: HTMLtoDOCXOptions,
    footerHTMLString?: string | null
  ): Promise<Blob | Buffer>;

  export default HTMLtoDOCX;
}
