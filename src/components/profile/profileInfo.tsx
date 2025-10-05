import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/types/user";

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditing: boolean;
  editName: string;
  onNameChange: (name: string) => void;
}

export const ProfileHeader = ({ 
  profile,
  isEditing,
  editName,
  onNameChange
}: ProfileHeaderProps) => (
  <>
    {/* Avatar */}
    <div className="flex justify-center">
      <Avatar className="h-32 w-32">
        <AvatarImage src={profile.avatar} alt={profile.name} />
        <AvatarFallback>{profile.name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>

    {/* Name field */}
    <div className="space-y-2">
      <Label>Name</Label>
      {isEditing ? (
        <Input value={editName} onChange={(e) => onNameChange(e.target.value)} />
      ) : (
        <div className="text-lg font-medium">{profile.name}</div>
      )}
    </div>

    {/* Email field */}
    <div className="space-y-2">
      <Label>Email</Label>
      <div className="text-lg text-muted-foreground">{profile.email}</div>
    </div>
  </>
);