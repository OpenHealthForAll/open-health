import {BaseVisionParser, VisionParseOptions, VisionParserModel} from "@/lib/health-data/parser/vision/base-vision";
import {ChatGoogleGenerativeAI} from "@langchain/google-genai";
import {HealthCheckupSchema} from "@/lib/health-data/parser/schema";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {z} from "zod";
import {processBatchWithConcurrency} from "@/lib/health-data/parser/util";
import {currentDeploymentEnv} from "@/lib/current-deployment-env";

type ZodTypeAny = z.ZodTypeAny;
type ZodRawShape = { [k: string]: ZodTypeAny };

export class GoogleVisionParser extends BaseVisionParser {

    get name(): string {
        return "Google";
    }

    get apiKeyRequired(): boolean {
        return currentDeploymentEnv === 'local'
    }

    get enabled(): boolean {
        return true
    }

    async models(): Promise<VisionParserModel[]> {
        return [
            {id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash'},
            {id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 2.0 Flash-Lite'},
            {id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash'},
            {id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B'},
            {id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro'},
        ]
    }

    async parse(options: VisionParseOptions) {
        const llm = new ChatGoogleGenerativeAI({
            model: options.model.id,
            apiKey: currentDeploymentEnv === 'cloud' ? process.env.GOOGLE_API_KEY : options.apiKey,
        });
        const messages = options.messages || ChatPromptTemplate.fromMessages([]);

        // parse the date and name
        const DateNameSchema = this.removeNullable(z.object({
            date: HealthCheckupSchema.shape.date,
            name: HealthCheckupSchema.shape.name
        }));
        const {
            date,
            name
        } = await messages.pipe(llm.withStructuredOutput(DateNameSchema, {method: 'functionCalling'}).withConfig({
            runName: 'health-data-parser',
            metadata: {input: options.input}
        }))
            .withRetry({stopAfterAttempt: 3})
            .invoke(options.input)

        // parse the test results in chunks of 33 keys
        const chunkedKeys = this.chunkArray(Object.keys(HealthCheckupSchema.shape.test_result.shape), 33);
        const chunks = await this.requestChunks(chunkedKeys);
        const results = await processBatchWithConcurrency(
            chunks,
            async (chunk) => {
                return messages.pipe(llm.withStructuredOutput(chunk, {method: 'functionCalling'}))
                    .withRetry({stopAfterAttempt: 3})
                    .invoke(options.input);
            },
            5
        )

        return HealthCheckupSchema.parse({date, name, test_result: this.mergeResults(results)})
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    private async requestChunks(chunks: string[][]) {
        const testResultSchema = HealthCheckupSchema.shape.test_result;
        return await Promise.all(chunks.map(async (chunk) => {
            return z.object(
                chunk.reduce((acc, key) => {
                    acc[key] = this.removeNullable(testResultSchema.shape[key as keyof typeof testResultSchema.shape])
                    return acc;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }, {} as Record<string, any>)
            );
        }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mergeResults(results: any[]) {
        return results.reduce((acc, result) => {
            for (const [key, value] of Object.entries(result)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (Object.keys(value as any).length === 0) {
                    delete result[key];
                } else if (result[key] && result[key].value === '') {
                    delete result[key];
                }
            }
            return {...acc, ...result};
        }, {});
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private removeNullable<T extends ZodTypeAny>(schema: T): any {
        // Handle nullable types
        if (schema instanceof z.ZodNullable) {
            return this.removeNullable(schema.unwrap());
        }

        // Handle object types
        if (schema instanceof z.ZodObject) {
            const shape = schema.shape as ZodRawShape;
            const newShape: ZodRawShape = {};

            for (const [key, value] of Object.entries(shape)) {
                newShape[key] = this.removeNullable(value);
            }

            return z.object(newShape) as z.ZodType<z.infer<T>>;
        }

        // Handle array types
        if (schema instanceof z.ZodArray) {
            return z.array(this.removeNullable(schema.element)) as z.ZodType<z.infer<T>>;
        }

        // Handle optional types
        if (schema instanceof z.ZodOptional) {
            return z.optional(this.removeNullable(schema.unwrap())) as z.ZodType<z.infer<T>>;
        }

        // Handle union types
        if (schema instanceof z.ZodUnion) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return z.union(schema.options.map((option: any) =>
                this.removeNullable(option)
            )) as z.ZodType<z.infer<T>>;
        }

        // Handle intersection types
        if (schema instanceof z.ZodIntersection) {
            return z.intersection(
                this.removeNullable(schema._def.left),
                this.removeNullable(schema._def.right)
            ) as z.ZodType<z.infer<T>>;
        }

        // Return other types as is
        return schema as z.ZodType<z.infer<T>>;
    }
}
