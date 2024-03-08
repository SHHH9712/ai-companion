import { Categories } from "@/components/categories";
import { Companions } from "@/components/companions";
import { SearchInput } from "@/components/search-input";
import prismadb from "@/lib/prismadb";
import { Root } from "postcss";
import { string } from "zod";

interface RootPageProps { 
    searchParams: { // searchParams is a convention in NEXT 13 server component for params quick access
        categoryId: string;
        name: string;
    }
}

export default async function RootPage({
    searchParams
}: RootPageProps) {
    const data = await prismadb.companion.findMany({
        where: {
            categoryId: searchParams.categoryId,
            name: {
                search: searchParams.name
            }
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: {
                    messages: true
                }
            }
        }
    })

    const categories = await prismadb.category.findMany();
    return (
        <div className="h-full p-4 space-y-2">
            <SearchInput />
            <Categories data={categories} />
            <Companions data={data} />
        </div>
    );
}