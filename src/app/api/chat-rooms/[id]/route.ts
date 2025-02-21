import prisma from "@/lib/prisma";
import {NextRequest, NextResponse} from "next/server";
import {ChatRoom} from "@/app/api/chat-rooms/route";

export interface ChatRoomPatchRequest {
    assistantModeId: string
}

export interface ChatRoomPatchResponse {
    chatRoom: ChatRoom
}

export interface ChatRoomGetResponse {
    chatRoom: ChatRoom
}

export async function GET(
    req: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params
    const chatRoom = await prisma.chatRoom.findUnique({
        where: {id},
        select: {
            id: true,
            name: true,
            assistantMode: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    systemPrompt: true
                }
            },
            llmProviderId: true,
            llmProviderModelId: true,
            createdAt: true,
            lastActivityAt: true
        }
    });

    if (!chatRoom) return NextResponse.json({error: 'Chat room not found'}, {status: 404})

    return NextResponse.json<ChatRoomGetResponse>({chatRoom})
}

export async function PATCH(
    req: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    const {id} = await params
    const body: ChatRoomPatchRequest = await req.json()

    const chatRoom = await prisma.chatRoom.update({
        where: {id},
        data: body,
        select: {
            id: true,
            name: true,
            assistantMode: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    systemPrompt: true
                }
            },
            llmProviderId: true,
            llmProviderModelId: true,
            createdAt: true,
            lastActivityAt: true
        }
    });

    return NextResponse.json<ChatRoomPatchResponse>({
        chatRoom
    })
}

export async function DELETE(request: Request, {params}: {
    params: Promise<{ id: string }>
}) {
    const {id} = await params;

    await prisma.chatRoom.delete({
        where: {id}
    });

    return new NextResponse(null, {status: 204});
}
