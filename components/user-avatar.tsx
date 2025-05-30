
import { Avatar, AvatarImage , AvatarFallback} from "./ui/avatar";
import { useUser } from "@clerk/nextjs";

export const UserAvatar = () => {
    const { user } = useUser();
    return (
        <Avatar className="h-8 w-8">
            <AvatarImage className="p-1" src={user?.imageUrl} />
            <AvatarFallback>
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
            </AvatarFallback>
        </Avatar>
    );
}