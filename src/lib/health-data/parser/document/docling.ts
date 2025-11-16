import {
    BaseDocumentParser,
    DocumentModelOptions,
    DocumentOCROptions,
    DocumentParseOptions,
    DocumentParseResult,
    DocumentParserModel,
    OCRParseResult
} from "@/lib/health-data/parser/document/base-document";
import fetch from 'node-fetch'
import FormData from 'form-data'
import {currentDeploymentEnv} from "@/lib/current-deployment-env";

const DOCLING_URL = process.env.DOCLING_URL || 'http://docling-serve:5001';
const REQUEST_TIMEOUT_MS = 300000; // 5 minutes timeout for failure detection on multiple serial uploads

export class DoclingDocumentParser extends BaseDocumentParser {
    get apiKeyRequired(): boolean {
        return false;
    }

    get enabled(): boolean {
        return currentDeploymentEnv === 'local';
    }

    get name(): string {
        return "Docling";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async models(options?: DocumentModelOptions): Promise<DocumentParserModel[]> {
        return [
            {id: 'document-parse', name: 'Document Parse'}
        ];
    }

    private createFormData(fileBuffer: Buffer, filename: string, options: {
        forceOcr?: boolean;
        toFormat?: 'json' | 'md';
    } = {}): FormData {
        const formData = new FormData();
        formData.append('ocr_engine', 'easyocr');
        formData.append('pdf_backend', 'dlparse_v2');
        formData.append('from_formats', 'pdf');
        formData.append('from_formats', 'docx');
        formData.append('from_formats', 'image');
        formData.append('force_ocr', options.forceOcr ? 'true' : 'false');
        formData.append('image_export_mode', 'placeholder');
        formData.append('ocr_lang', 'en');
        formData.append('table_mode', 'fast');
        formData.append('files', fileBuffer, {filename: filename});
        formData.append('abort_on_error', 'false');
        formData.append('to_formats', options.toFormat || 'json');
        formData.append('return_as_file', 'false');
        formData.append('do_ocr', options.forceOcr ? 'true' : 'false');
        return formData;
    }

    async ocr(options: DocumentOCROptions): Promise<OCRParseResult> {
        try {
            console.log('[Docling OCR] Starting OCR for file:', options.input);

            // Fetch the file from the URL
            const fileResponse = await fetch(options.input);
            if (!fileResponse.ok) {
                throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
            }
            const fileBuffer = await fileResponse.buffer();
            console.log('[Docling OCR] File fetched, size:', fileBuffer.length, 'bytes');

            // Extract filename from URL
            const urlPath = new URL(options.input).pathname;
            const filename = urlPath.split('/').pop() || 'document.pdf';
            console.log('[Docling OCR] Using filename:', filename);

            const formData = this.createFormData(fileBuffer, filename, {
                forceOcr: true,
                toFormat: 'json'
            });

            console.log('[Docling OCR] Sending request to', DOCLING_URL);

            const response = await Promise.race([
                fetch(`${DOCLING_URL}/v1alpha/convert/file`, {
                    method: 'POST',
                    body: formData
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Docling request timeout after ${REQUEST_TIMEOUT_MS / 1000} seconds`)), REQUEST_TIMEOUT_MS)
                )
            ]) as Response;

            console.log('[Docling OCR] Response received:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Docling OCR] Error response:', errorText);
                throw new Error(`Docling service error: ${response.status} ${response.statusText} - ${errorText}`)
            }

            const data = await response.json()
            const {document} = data
            const {json_content} = document

            const convertedJsonContent = this.convertJsonContent(json_content)
            console.log('[Docling OCR] OCR completed successfully');

            return {ocr: convertedJsonContent};
        } catch (error) {
            console.error('[Docling OCR] Error:', error)
            throw new Error(`Failed to perform OCR with Docling: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async parse(options: DocumentParseOptions): Promise<DocumentParseResult> {
        try {
            console.log('[Docling Parse] Starting parse for file:', options.input);

            // Fetch the file from the URL
            const fileResponse = await fetch(options.input);
            if (!fileResponse.ok) {
                throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
            }
            const fileBuffer = await fileResponse.buffer();
            console.log('[Docling Parse] File fetched, size:', fileBuffer.length, 'bytes');

            // Extract filename from URL
            const urlPath = new URL(options.input).pathname;
            const filename = urlPath.split('/').pop() || 'document.pdf';
            console.log('[Docling Parse] Using filename:', filename);

            // Optimization: Try without OCR first for faster processing
            // If the PDF has selectable text, this will be much faster
            const formData = this.createFormData(fileBuffer, filename, {
                forceOcr: false,
                toFormat: 'md'
            });

            console.log('[Docling Parse] Sending request to', DOCLING_URL);

            const response = await Promise.race([
                fetch(`${DOCLING_URL}/v1alpha/convert/file`, {
                    method: 'POST',
                    body: formData
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error(`Docling request timeout after ${REQUEST_TIMEOUT_MS / 1000} seconds`)), REQUEST_TIMEOUT_MS)
                )
            ]) as Response;

            console.log('[Docling Parse] Response received:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Docling Parse] Error response:', errorText);
                throw new Error(`Docling service error: ${response.status} ${response.statusText} - ${errorText}`)
            }

            const {document} = await response.json()
            const {md_content} = document
            console.log('[Docling Parse] Parse completed successfully');
            return {document: {content: {markdown: md_content}}};
        } catch (error) {
            console.error('[Docling Parse] Error:', error)
            throw new Error(`Failed to parse document with Docling: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    private convertCoordinates(bbox: { l: number; t: number; r: number; b: number }, pageHeight: number) {
        if (!bbox) return null;

        return {
            vertices: [
                {
                    x: Math.round(bbox.l),
                    y: Math.round(pageHeight - bbox.t)
                },
                {
                    x: Math.round(bbox.r),
                    y: Math.round(pageHeight - bbox.t)
                },
                {
                    x: Math.round(bbox.r),
                    y: Math.round(pageHeight - bbox.b)
                },
                {
                    x: Math.round(bbox.l),
                    y: Math.round(pageHeight - bbox.b)
                }
            ]
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private convertJsonContent(data: any) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = {
            metadata: {pages: []},
            pages: [],
            stored: false
        };

        // Process each page
        for (const [pageNum, value] of Object.entries(data.pages)) {
            const pageInfo = value as { size: { width: number, height: number } }
            const pageHeight = pageInfo.size.height;
            const pageWidth = pageInfo.size.width;

            // Add page metadata
            result.metadata.pages.push({
                height: pageHeight,
                page: parseInt(pageNum),
                width: pageWidth
            });

            // Initialize page object
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pageObject: any = {
                height: pageHeight,
                id: parseInt(pageNum) - 1,
                text: "",
                width: pageWidth,
                words: []
            };

            // Process text elements and create full text content
            let wordId = 0;
            let fullText = "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.texts.forEach((text: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text.prov.forEach((prov: any) => {
                    if (prov.page_no.toString() === pageNum) {
                        pageObject.words.push({
                            boundingBox: this.convertCoordinates(prov.bbox, pageHeight),
                            confidence: 0.98,
                            id: wordId++,
                            text: text.text
                        });
                        fullText += text.text + " ";
                    }
                });
            });

            // Set full text content
            pageObject.text = fullText.trim();
            result.pages.push(pageObject);

            // Set overall document text
            result.text = fullText.trim();
        }

        return result;
    }
}
