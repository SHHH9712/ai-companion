import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface BotAvatarProps {
    src: string
}

export const BotAvatar = ({
    src
}: BotAvatarProps) => {
    return (
        <div>
            <Avatar className="h-12 w-12">
                <AvatarImage src={src} />
                <AvatarFallback>BOT</AvatarFallback>
            </Avatar>
        </div>
    )
}