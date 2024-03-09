import { Redis } from "@upstash/redis"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { Pinecone, PineconeClient } from "@pinecone-database/pinecone"
import { PineconeStore } from "langchain/vectorstores/pinecone";

export type CompanionKey = {
    companionName: string;
    modelName: string;
    userId: string;
}

export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;
    private vectorDBClient: PineconeClient;

    public constructor() {
        this.history = Redis.fromEnv()
        this.vectorDBClient = new PineconeClient();
    }

    public async init() {
        if (this.vectorDBClient instanceof PineconeClient) {
            await this.vectorDBClient.init({
                apiKey: process.env.PINECONE_API_KEY!,
                environment: process.env.PINECONE_ENVIRONMENT!,
            });
        }
    }

    public async vectorSearch(
        recentChatHistory: string,
        companionFileName: string
    ) {
        const pineconeClient = <PineconeClient>this.vectorDBClient;

        const pineconeIndex = pineconeClient.Index(
            process.env.PINECONE_INDEX! || ""
        )
    }
}