import {
    BaseVisionParser,
    VisionModelOptions,
    VisionParseOptions,
    VisionParserModel
} from "@/lib/health-data/parser/vision/base-vision";
import fetch from 'node-fetch'
import {HealthCheckupSchema, HealthCheckupType} from "@/lib/health-data/parser/schema";
import {ChatOllama} from "@langchain/ollama";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {currentDeploymentEnv} from "@/lib/current-deployment-env";

export class OllamaVisionParser extends BaseVisionParser {

    private _apiUrl: string = 'http://localhost:11434';

    get apiKeyRequired(): boolean {
        return false
    }

    get enabled(): boolean {
        return currentDeploymentEnv === 'local';
    }

    get apiUrlRequired(): boolean {
        return true;
    }

    get name(): string {
        return 'Ollama'
    }

    get apiUrl(): string {
        return this._apiUrl;
    }

    async models(options?: VisionModelOptions): Promise<VisionParserModel[]> {
        try {
            const apiUrl = options?.apiUrl || this._apiUrl
            const response = await fetch(`${apiUrl}/api/tags`)
            const {models} = await response.json()
            return models.map((m: { name: string, model: string }) => ({id: m.model, name: m.name}))
        } catch (e) {
            console.error(e)
            return []
        }
    }

    async parse(options: VisionParseOptions): Promise<HealthCheckupType> {
        const apiUrl = options.apiUrl || this._apiUrl
        const llm = new ChatOllama({model: options.model.id, baseUrl: apiUrl});
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
