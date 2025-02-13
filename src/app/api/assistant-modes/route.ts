import {NextResponse} from "next/server";
import prisma, {Prisma} from "@/lib/prisma";
import {RAGDocumentParser, RAGVisionParser} from "@/lib/health-data/parser/rag";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AssistantMode extends Prisma.AssistantModeGetPayload<{
    select: { id: true, name: true, description: true, systemPrompt: true }
}> {
}

export interface AssistantModeListResponse {
    assistantModes: AssistantMode[]
}

export async function GET() {
    const assistantModes = await prisma.assistantMode.findMany({
        orderBy: {id: 'asc'},
    });

    // Add RAG model to assistant modes
    const ragDocumentParser = new RAGDocumentParser();
    const ragVisionParser = new RAGVisionParser();

    const ragAssistantMode: AssistantMode = {
        id: 'rag',
        name: 'RAG Model',
        description: 'Retrieval-Augmented Generation model for discussions based on specific medical literature.',
        systemPrompt: 'Use the RAG model to provide responses based on specific medical literature.'
    };

    return NextResponse.json<AssistantModeListResponse>({
        assistantModes: [...assistantModes, ragAssistantMode]
    });
}
