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
  onNameChange,
}: ProfileHeaderProps) => (
  <div className='flex items-center gap-6 mb-6'>
    {/* Avatar */}
    <div className='flex justify-center'>
      <Avatar className='h-32 w-32'>
        <AvatarImage src={profile.avatar} alt={profile.name} />
        <AvatarFallback>{profile.name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>

    <div className='grow flex flex-col gap-4 w-full'>
      {/* Name field */}
      <div className='space-y-2'>
        <Label>Name</Label>
        <Input
          value={editName}
          onChange={(e) => onNameChange(e.target.value)}
          readOnly={!isEditing}
        />
      </div>

      {/* Email field */}
      <div className='space-y-2'>
        <Label>Email</Label>
        <Input value={profile.email} readOnly className='bg-muted' disabled />
      </div>
    </div>
  </div>
);
