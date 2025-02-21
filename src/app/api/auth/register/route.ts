import {NextResponse} from "next/server";
import {hash} from "bcryptjs";
import prisma from "@/lib/prisma";
import assistantModeSeed from "../../../../../prisma/data/assistant-mode.json";
import llmProviderSeed from "../../../../../prisma/data/llm-provider.json";

export async function POST(request: Request) {
    try {
        const {username, password} = await request.json();
        if (!username || !password) {
            return NextResponse.json({message: "Username and password are required"}, {status: 400});
        }

        // Hash the password
        const hashedPassword = await hash(password, 10);

        // Save the user to the database
        await prisma.$transaction(async (prisma) => {

            // Create a new user
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    hasOnboarded: false,
                }
            })

            // Create a assistant mode
            await prisma.assistantMode.createMany({
                data: assistantModeSeed.map((mode) => ({
                    ...mode,
                    authorId: user.id
                })),
            });

            // Create a llm
            await prisma.lLMProvider.createMany({
                data: llmProviderSeed.map((provider) => ({
                    ...provider,
                    authorId: user.id
                })),
            });
        })

        return NextResponse.json({message: "success"}, {status: 201});
    } catch (e) {
        console.error(e);
        return NextResponse.json({message: "An error occurred"}, {status: 400});
    }
}
