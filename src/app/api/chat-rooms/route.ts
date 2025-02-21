import prisma, {Prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {auth} from "@/auth";

export interface ChatRoom extends Prisma.ChatRoomGetPayload<{
    select: {
        id: true,
        name: true,
        assistantMode: { select: { id: true, name: true, description: true, systemPrompt: true } },
        llmProviderId: true,
        llmProviderModelId: true,
        createdAt: true,
        lastActivityAt: true,
    }
}> {
    id: string
}

export interface ChatRoomListResponse {
    chatRooms: ChatRoom[]
}

export interface ChatRoomCreateResponse extends ChatRoom {
    id: string
}

export async function GET() {
    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const chatRooms = await prisma.chatRoom.findMany({
        select: {
            id: true,
            name: true,
            llmProviderId: true,
            llmProviderModelId: true,
            assistantMode: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    systemPrompt: true
                }
            },
            createdAt: true,
            lastActivityAt: true,
        },
        where: {authorId: session.user.id},
        orderBy: {lastActivityAt: 'desc'},
    })
    return NextResponse.json<ChatRoomListResponse>({
        chatRooms
    })
}

export async function POST() {
    const session = await auth()
    const user = session?.user
    if (!session || !user) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const {id} = await prisma.$transaction(async (prisma) => {
        // Get the last used chat room to get its assistant mode
        const lastChatRoom = await prisma.chatRoom.findFirst({
            where: {authorId: user.id},
            orderBy: {updatedAt: 'desc'},
            select: {assistantModeId: true}
        });

        // If we have a last chat room, use its assistant mode, otherwise find the first one
        const assistantModeId = lastChatRoom?.assistantModeId || (await prisma.assistantMode.findFirstOrThrow({
            where: {authorId: user.id}
        })).id;

        return prisma.chatRoom.create({
            data: {
                authorId: user.id,
                name: 'New Chat',
                assistantModeId: assistantModeId,
                llmProviderId: (await prisma.lLMProvider.findFirstOrThrow({where: {authorId: user.id}})).id,
            },
        });
    });

    const chatRoom = await prisma.chatRoom.findUniqueOrThrow({
        where: {id: id},
        select: {
            id: true,
            name: true,
            llmProviderId: true,
            llmProviderModelId: true,
            assistantMode: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    systemPrompt: true
                }
            },
            createdAt: true,
            lastActivityAt: true
        }
    })
    return NextResponse.json<ChatRoomCreateResponse>(chatRoom);
}
