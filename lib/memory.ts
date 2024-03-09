import { Redis } from "@upstash/redis"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { Pinecone } from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone";

export type CompanionKey = {
    companionName: string;
    modelName: string;
    userId: string;
}

export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;
    private vectorDBClient: Pinecone | undefined;

    public constructor() {
        this.history = Redis.fromEnv()
        this.vectorDBClient = undefined;
    }

    public async init() {
        if (typeof this.vectorDBClient == "undefined") {
            this.vectorDBClient = new Pinecone();
        }
    }

    public async vectorSearch(
        recentChatHistory: string,
        companionFileName: string
    ) {
        const pineconeClient = <Pinecone>this.vectorDBClient;

        const pineconeIndex = pineconeClient.Index(
            process.env.PINECONE_INDEX! || ""
        )

        const vectorStore = await PineconeStore.fromExistingIndex(
            new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY}),
            { pineconeIndex }
        )

        const similarDocs = await vectorStore
            .similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
            .catch((err) => {
                console.log("Failed to get vector search results", err);
            })
        return similarDocs
    }

    public static async getInstance(): Promise<MemoryManager> {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
            await MemoryManager.instance.init();
        }

        return MemoryManager.instance;
    }

    private generateRedisCompanionKey(companionKey: CompanionKey): string {
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
    }

    public async writeToHistory(text: string, companionKey: CompanionKey) {
        if (!companionKey || typeof companionKey == "undefined") {
            console.log("Companion key set incorrectly.");
            return ""
        }
        const key = this.generateRedisCompanionKey(companionKey);
        const result = await this.history.zadd(key, {
            score: Date.now(), 
            member: text,
        });

        return result;
    }

    public async readLatestHistory(companionKey: CompanionKey) : Promise<string> {
        if (!companionKey || typeof companionKey.userId === undefined) {
            console.log("Companion key set incorrectly.")
            return ""
        }

        const key = this.generateRedisCompanionKey(companionKey);
        let result = await this.history.zrange(key, 0, Date.now(), {
            byScore: true
        })

        result = result.slice(-30).reverse();
        const recentChats = result.reverse().join("\n");
        return recentChats;
    }

    public async seedChatHistory(
        seedContent: String,
        delimiter: string = "\n",
        companionKey: CompanionKey,
    ) {
        const key = this.generateRedisCompanionKey(companionKey);

        if (await this.history.exists(key)) {
            console.log("User already has chat history");
            return;
        }
        const content = seedContent.split(delimiter);
        let counter = 0;

        for(const line of content) {
            await this.history.zadd(key, { score: counter, member: line});
            counter += 1;
        }
    }
}