import {PrismaClient} from '@prisma/client'
import {hash} from 'bcryptjs'
import assistantModeSeed from './data/assistant-mode.json'
import llmProviderSeed from './data/llm-provider.json'

const prisma = new PrismaClient()

async function main() {
    // Create a default user for testing
    const hashedPassword = await hash('password', 10)

    const user = await prisma.user.upsert({
        where: { username: 'demo' },
        update: {},
        create: {
            username: 'demo',
            password: hashedPassword,
            hasOnboarded: true,
        }
    })

    console.log(`Created/updated user: ${user.username}`)

    // Create assistant modes
    for (const mode of assistantModeSeed) {
        await prisma.assistantMode.upsert({
            where: { id: `${user.id}-${mode.name}` },
            update: {},
            create: {
                id: `${user.id}-${mode.name}`,
                ...mode,
                authorId: user.id
            }
        })
    }

    console.log(`Created/updated ${assistantModeSeed.length} assistant modes`)

    // Create LLM providers
    for (const provider of llmProviderSeed) {
        await prisma.lLMProvider.upsert({
            where: { id: `${user.id}-${provider.providerId}` },
            update: {},
            create: {
                id: `${user.id}-${provider.providerId}`,
                ...provider,
                authorId: user.id
            }
        })
    }

    console.log(`Created/updated ${llmProviderSeed.length} LLM providers`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
