"use client";

import { useProModal } from "@/hooks/use-pro-model";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export const ProModal = () => {
    const proModal = useProModal();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, [])

    const router = useRouter();

    const onSubscribe = async () => {
        try {
            setLoading(true);
            const response = await axios.get("api/stripe")

            window.location.href = response.data.url;



        } catch(error) {
            toast({
                variant: "destructive",
                description:"Something went wrong",
            })
            
        } finally {
            setLoading(false);
        }
    }

    return(
        <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
            <DialogContent>
                <DialogHeader className="space-y-4">
                    <DialogTitle className="text-center">Upgrade to Pro</DialogTitle>
                    <DialogDescription className="text-center space-y-2">
                        Upgrade to <span className="text-sky-500 mx-1 font-medium">Pro Plan</span> to be able to create <span className="text-sky-500 mx-1 font-medium">your own AI chats</span>
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="flex justify-between">
                    <p className="text-2xl font-medium">
                        $0.
                        <span className="text-sm font-normal">99</span>
                    </p>
                    <Button variant="premium" onClick={onSubscribe} disabled={loading}>
                        Subscribe
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}