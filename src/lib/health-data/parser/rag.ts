import {BaseDocumentParser, DocumentParseOptions, DocumentParseResult, DocumentParserModel, OCRParseResult} from "@/lib/health-data/parser/document/base-document";
import {BaseVisionParser, VisionParseOptions, VisionParserModel} from "@/lib/health-data/parser/vision/base-vision";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {HealthCheckupType} from "@/lib/health-data/parser/schema";
import {MessagePayload} from "@/lib/health-data/parser/prompt";
import {processBatchWithConcurrency} from "@/lib/health-data/parser/util";

export class RAGDocumentParser extends BaseDocumentParser {
    get name(): string {
        return 'RAGDocumentParser';
    }

    get apiKeyRequired(): boolean {
        return true;
    }

    async models(): Promise<DocumentParserModel[]> {
        return [
            {id: 'rag-document-parse', name: 'RAG Document Parse'}
        ];
    }

    async ocr(options: DocumentParseOptions): Promise<OCRParseResult> {
        // Implement OCR logic for RAG
        return {ocr: {}};
    }

    async parse(options: DocumentParseOptions): Promise<DocumentParseResult> {
        // Implement document parsing logic for RAG
        return {document: {}};
    }
}

export class RAGVisionParser extends BaseVisionParser {
    get name(): string {
        return 'RAGVisionParser';
    }

    async models(): Promise<VisionParserModel[]> {
        return [
            {id: 'rag-vision-parse', name: 'RAG Vision Parse'}
        ];
    }

    async parse(options: VisionParseOptions): Promise<HealthCheckupType> {
        const llm = new ChatPromptTemplate({model: options.model.id, apiKey: options.apiKey});
        const messages = options.messages || ChatPromptTemplate.fromMessages([]);
        const chain = messages.pipe(llm.withStructuredOutput(HealthCheckupType, {
            method: 'functionCalling',
        }));
        return await chain.withRetry({stopAfterAttempt: 3}).invoke(options.input);
    }
}

export async function parseHealthDataWithRAG(options: { file: string, visionParser: VisionParserOptions, documentParser: DocumentParserOptions }) {
    const {file, visionParser, documentParser} = options;

    // prepare images
    const imagePaths = await documentToImages({file});

    // prepare ocr results
    const ocrResults = await documentOCR({
        document: file,
        documentParser: documentParser
    });

    // prepare parse results
    await processBatchWithConcurrency(
        imagePaths,
        async (path) => documentParse({document: path, documentParser: documentParser}),
        3
    );

    // Merge the results
    const baseInferenceOptions = {imagePaths, visionParser, documentParser};
    const [
        {finalHealthCheckup: resultTotal, mergedTestResultPage: resultTotalPages},
        {finalHealthCheckup: resultText, mergedTestResultPage: resultTextPages},
        {finalHealthCheckup: resultImage, mergedTestResultPage: resultImagePages}
    ] = await Promise.all([
        inference({...baseInferenceOptions, excludeImage: false, excludeText: false}),
        inference({...baseInferenceOptions, excludeImage: false, excludeText: true}),
        inference({...baseInferenceOptions, excludeImage: true, excludeText: false}),
    ]);

    const resultDictTotal = resultTotal.test_result;
    const resultDictText = resultText.test_result;
    const resultDictImage = resultImage.test_result;

    const mergedTestResult: { [key: string]: any } = {};
    const mergedPageResult: { [key: string]: { page: number } | null } = {};

    for (const key of HealthCheckupSchema.shape.test_result.keyof().options) {
        const valueTotal =
            resultDictTotal.hasOwnProperty(key) &&
            resultDictTotal[key] !== null &&
            resultDictTotal[key]!.value !== null
                ? resultDictTotal[key]
                : null;
        const pageTotal = valueTotal !== null ? resultTotalPages[key] : null;

        const valueText =
            resultDictText.hasOwnProperty(key) &&
            resultDictText[key] !== null &&
            resultDictText[key]!.value !== null
                ? resultDictText[key]
                : null;
        const pageText = valueText !== null ? resultTextPages[key] : null;

        const valueImage =
            resultDictImage.hasOwnProperty(key) &&
            resultDictImage[key] !== null &&
            resultDictImage[key]!.value !== null
                ? resultDictImage[key]
                : null;
        const pageImage = valueImage !== null ? resultImagePages[key] : null;

        if (valueTotal === null) {
            if (valueText !== null) {
                mergedTestResult[key] = valueText;
                mergedPageResult[key] = pageText;
            } else if (valueImage !== null) {
                mergedTestResult[key] = valueImage;
                mergedPageResult[key] = pageImage;
            } else {
                mergedTestResult[key] = valueText;
                mergedPageResult[key] = pageText;
            }
        } else {
            mergedTestResult[key] = valueTotal;
            mergedPageResult[key] = pageTotal;
        }
    }

    // remove all null values in mergedTestResult
    for (const key in mergedTestResult) {
        if (mergedTestResult[key] === null) {
            delete mergedTestResult[key];
        }
    }

    const healthCheckup = HealthCheckupSchema.parse({
        ...resultTotal,
        test_result: mergedTestResult
    });

    return {data: [healthCheckup], pages: [mergedPageResult], ocrResults: [ocrResults]};
}
