import {BaseVisionParser, VisionParseOptions, VisionParserModel} from "@/lib/health-data/parser/vision/base-vision";
import {ChatOpenAI} from "@langchain/openai";
import {HealthCheckupSchema} from "@/lib/health-data/parser/schema";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {currentDeploymentEnv} from "@/lib/current-deployment-env";

export class OpenAIVisionParser extends BaseVisionParser {

    get name(): string {
        return "OpenAI";
    }

    get apiKeyRequired(): boolean {
        return currentDeploymentEnv === 'local'
    }

    get enabled(): boolean {
        return true
    }

    async models(): Promise<VisionParserModel[]> {
        if (currentDeploymentEnv === 'cloud') {
            return [
                {id: 'gpt-4o', name: 'gpt-4o'},
            ];
        }
        return [
            {id: 'gpt-4o-mini', name: 'gpt-4o-mini'},
            {id: 'gpt-4o', name: 'gpt-4o'},
            {id: 'o1', name: 'o1'},
            {id: 'o1-mini', name: 'o1-mini'},
        ];
    }

    async parse(options: VisionParseOptions) {
        const llm = new ChatOpenAI({
            model: options.model.id,
            apiKey: currentDeploymentEnv === 'cloud' ? process.env.OPENAI_API_KEY : options.apiKey
        })
        const messages = options.messages || ChatPromptTemplate.fromMessages([]);
        const chain = messages.pipe(llm.withStructuredOutput(HealthCheckupSchema, {
            method: 'functionCalling',
        }).withConfig({
            runName: 'health-data-parser',
            metadata: {input: options.input}
        }))
        return await chain.withRetry({stopAfterAttempt: 3}).invoke(options.input);
    }
}
