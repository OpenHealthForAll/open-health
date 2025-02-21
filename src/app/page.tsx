import {redirect} from "next/navigation";
import prisma from "@/lib/prisma";
import {auth} from "@/auth";
import {currentDeploymentEnv} from "@/lib/current-deployment-env";

export const dynamic = "force-dynamic";

export default async function Page() {
    const session = await auth()
    if (!session || !session.user) redirect('/login');

    const [user, lastChatRoom] = await Promise.all([
        prisma.user.findUniqueOrThrow({
            select: {id: true, hasOnboarded: true},
            where: {id: session.user.id}
        }),
        prisma.chatRoom.findFirst({
            where: {authorId: session.user.id},
            orderBy: {updatedAt: 'desc'},
        })
    ])

    // If user has not onboarded, redirect to onboarding
    if (!user.hasOnboarded) {
        if (currentDeploymentEnv === 'cloud') {
            redirect('/onboarding');
        } else {
            await prisma.user.update({where: {id: session.user.id}, data: {hasOnboarded: true}})
        }
    }

    let chatRoom = lastChatRoom
    if (!lastChatRoom) {
        const assistantMode = await prisma.assistantMode.findFirstOrThrow({where: {authorId: session.user.id}})
        const llmProvider = await prisma.lLMProvider.findFirstOrThrow({where: {authorId: session.user.id}})
        chatRoom = await prisma.chatRoom.create({
            data: {
                name: 'Chat',
                assistantModeId: assistantMode.id,
                llmProviderId: llmProvider.id,
                authorId: session.user.id,
            }
        })
    }
    if (chatRoom) redirect(`/chat/${chatRoom.id}`);
}
