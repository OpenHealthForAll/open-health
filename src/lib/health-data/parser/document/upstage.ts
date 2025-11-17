import {
    BaseDocumentParser,
    DocumentModelOptions,
    DocumentOCROptions,
    DocumentParseOptions,
    DocumentParseResult,
    DocumentParserModel,
    OCRParseResult
} from "@/lib/health-data/parser/document/base-document";
import FormData from "form-data";
import fetch from "node-fetch";
import {currentDeploymentEnv} from "@/lib/current-deployment-env";

export class UpstageDocumentParser extends BaseDocumentParser {

    get name(): string {
        return 'Upstage'
    }

    get apiKeyRequired(): boolean {
        // Only require API key if we're in local environment AND no key is provided in .env
        return currentDeploymentEnv === 'local' && !process.env.UPSTAGE_API_KEY
    }

    get enabled(): boolean {
        return true
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async models(options?: DocumentModelOptions): Promise<DocumentParserModel[]> {
        return [
            {id: 'document-parse', name: 'Document Parse'}
        ]
    }

    async ocr(options: DocumentOCROptions): Promise<OCRParseResult> {
        const fileResponse = await fetch(options.input);
        const fileBuffer = await fileResponse.buffer();

        const formData = new FormData();
        formData.append('document', fileBuffer, {filename: 'document'});
        formData.append("schema", "oac");
        formData.append("model", "ocr-2.2.1");

        // Use environment variable if available, otherwise use provided API key
        const apiKey = process.env.UPSTAGE_API_KEY || options.apiKey;
        if (!apiKey) {
            throw new Error('Upstage API key is required but not provided');
        }
        const response = await fetch('https://api.upstage.ai/v1/document-ai/ocr', {
            method: 'POST',
            body: formData,
            headers: {Authorization: `Bearer ${apiKey}`}
        });

        return {ocr: await response.json()}
    }

    async parse(options: DocumentParseOptions): Promise<DocumentParseResult> {
        const fileResponse = await fetch(options.input);
        const fileBuffer = await fileResponse.buffer();

        const formData = new FormData();
        formData.append('document', fileBuffer, {filename: 'document'});
        formData.append('ocr', 'force')
        formData.append('output_formats', JSON.stringify(["markdown"]))
        formData.append("coordinates", "true");
        formData.append("model", "document-parse");

        // Use environment variable if available, otherwise use provided API key
        const apiKey = process.env.UPSTAGE_API_KEY || options.apiKey;
        if (!apiKey) {
            throw new Error('Upstage API key is required but not provided');
        }
        const response = await fetch('https://api.upstage.ai/v1/document-ai/document-parse', {
            method: 'POST',
            body: formData,
            headers: {Authorization: `Bearer ${apiKey}`}
        })

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upstage API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const responseData = await response.json();

        // Extract markdown content from Upstage response
        // Upstage returns: { "document": { "pages": [...], "metadata": {...} } }
        // We need to extract the markdown content
        let markdown = '';
        if (responseData.document?.pages) {
            markdown = responseData.document.pages
                .map((page: Record<string, unknown>) => (page.content as string) || '')
                .join('\n');
        }

        return {document: {content: {markdown}}}
    }
}
