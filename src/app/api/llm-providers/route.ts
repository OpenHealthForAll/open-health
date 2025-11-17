import prisma, {Prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {currentDeploymentEnv} from "@/lib/current-deployment-env";

export interface LLMProvider extends Prisma.LLMProviderGetPayload<{
    select: {
        id: true,
        providerId: true,
        name: true,
        apiKey: true,
        apiURL: true,
    }
}> {
    id: string
    apiKeyRequired?: boolean
}

export interface LLMProviderListResponse {
    llmProviders: LLMProvider[]
}

export async function GET() {
    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const llmProviders = await prisma.lLMProvider.findMany({
        where: {authorId: session.user.id},
        orderBy: {order: 'asc'}
    })

    // Helper function to determine if API key is required
    const isApiKeyRequired = (providerId: string): boolean => {
        // Check if API key is available in environment variables
        const envApiKeys: Record<string, string | undefined> = {
            'openai': process.env.OPENAI_API_KEY,
            'anthropic': process.env.ANTHROPIC_API_KEY,
            'google': process.env.GOOGLE_API_KEY,
        };

        // If API key is available in environment, it's not required from user
        if (envApiKeys[providerId]) {
            return false;
        }

        // Ollama doesn't require an API key
        if (providerId === 'ollama') {
            return false;
        }

        // For other providers, API key is required if not in environment
        return true;
    };

    return NextResponse.json<LLMProviderListResponse>({
        llmProviders: llmProviders
            .filter(({providerId}) => {
                // exclude Ollama from cloud deployment
                if (currentDeploymentEnv === 'cloud') return !['ollama'].includes(providerId)
                return true;
            })
            .map((provider) => ({
                ...provider,
                apiKeyRequired: isApiKeyRequired(provider.providerId)
            }))
    })
}
