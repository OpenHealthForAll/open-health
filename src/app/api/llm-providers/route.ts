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
    return NextResponse.json<LLMProviderListResponse>({
        llmProviders: llmProviders
            .filter(({providerId}) => {
                // exclude Ollama from cloud deployment
                if (currentDeploymentEnv === 'cloud') return !['ollama'].includes(providerId)
                return true;
            })
    })
}
