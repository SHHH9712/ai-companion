"use client";

import axios from 'axios';
import * as z from "zod";
import { Category, Companion } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormMessage, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const PREAMBLE = `You are Alex Dumphy, a respected physics professor at UCLA. With years of research and teaching experience, you have a deep understanding of the physical universe, from the fundamental principles of classical mechanics to the complex theories of quantum mechanics and relativity. Your enthusiasm for sharing knowledge is matched only by your commitment to helping others grasp the beauty and intricacies of physics. Whether it's discussing theoretical concepts, practical applications, or the latest research, you're always eager to engage in thoughtful conversations. Your approach is not just to educate but to inspire curiosity and critical thinking`

const SEED_CHAT = `Human: How does physics impact our daily lives?
Alex Dumphy: Physics profoundly impacts our daily lives in countless ways, often without us even realizing it. From the technology we use, like smartphones and GPS, which rely on principles of quantum mechanics and relativity, to understanding climate change through thermodynamics and environmental physics. Physics helps us understand the world around us, from the smallest particles to the vastness of the cosmos. It drives innovation, improves our quality of life, and helps us solve some of the most complex challenges facing our world.

Human: What advice do you have for someone considering a career in physics?
Alex Dumphy: Pursuing a career in physics is both challenging and immensely rewarding. My first piece of advice is to stay curious. The field of physics is vast and always evolving, so a genuine passion for discovery and understanding is crucial. Secondly, don't be afraid of failure. Physics is about experimenting, questioning, and sometimes getting things wrong to ultimately get them right. Lastly, seek out mentors and collaborate with others. Physics thrives on shared ideas and diverse perspectives. Whether you're drawn to theoretical research, teaching, or applying physics in industry, there's a path for you. Keep exploring, and you'll find it.
`

interface CompanionFormProps {
    initialData: Companion | null;
    categories: Category[];
}

const formSchema = z.object({
    name: z.string().min(1, {message: "Name is required."}),
    description: z.string().min(1, {message: "Description is required."}),
    instructions: z.string().min(200, {message: "Instructions required > 200 characters."}),
    seed: z.string().min(200, {message: "Seed required > 200 characters."}),
    src: z.string().min(1, {message: "Image is required."}),
    categoryId: z.string().min(1, {message: "Category Id is required."}),
})

export const CompanionForm = ({
    initialData,
    categories
}: CompanionFormProps) => {

    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            instructions: "",
            seed: "",
            src: "",
            categoryId: undefined,
        }
    })

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (initialData) {
                // update existing
                await axios.patch(`/api/companion/${initialData.id}`, values)
            } else {
                // create new
                await axios.post(`/api/companion`, values)
            }
            toast({
                description:"success"
            })
            router.refresh(); //refresh all server component to load newest data to reflect change
            router.push("/");
        } catch(error) {
            toast({
                variant:"destructive",
                description:`${error} Something went wrong...`
            });
        }
    };

    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">
                                General Information
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                General information about your companion
                            </p>
                        </div>
                        <Separator className="bg-primary/10"/>
                    </div>
                    <FormField 
                        name="src"
                        render={({ field })=>(
                            <FormItem className="flex felx-col items-center justify-center space-y-4">
                                <FormControl>
                                    <ImageUpload 
                                        disabled={isLoading}
                                        onChange={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField 
                            name="name"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="someone"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        your AI's name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            name="description"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>
                                        Discription
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="CEO of blablabla"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Description of your AI companion.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            name="categoryId"
                            control={form.control}
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Category
                                    </FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue 
                                                    defaultValue={field.value}
                                                    placeholder="Select a category"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select a category for you AI.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">
                                Configuration
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Prompt configuration
                            </p>
                            <Separator  className="bg-primary/10"/>
                        </div>
                        <FormField 
                            name="instructions"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>
                                        Instructions
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="bg-background resize-none"
                                            rows={7}
                                            disabled={isLoading}
                                            placeholder={PREAMBLE}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Describe your AI chat in detail. Give it a small introduction.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            name="seed"
                            control={form.control}
                            render={({field}) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>
                                        Conversation Example
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="bg-background resize-none"
                                            rows={7}
                                            disabled={isLoading}
                                            placeholder={SEED_CHAT}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Describe your AI chat in detail. Give it a small introduction.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="w-full flex justify-center">
                        <Button size='lg' disabled={isLoading}>
                            {initialData ? "Edit your companion": "Create your companion"}
                            <Wand2 className="w-4 h-4 ml-2"/>
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}