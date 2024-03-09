import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export const UserAvatar = () => {
    const { user } = useUser();

    return (
        <div>
            <Avatar className="h-12 w-12">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>USER</AvatarFallback>
            </Avatar>
        </div>
    )
}