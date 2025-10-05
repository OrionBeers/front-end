import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormLabel, FormMessage } from "@/components/ui/form";
import type { UserProfile } from "@/types/user";
import type { ProfileSchema } from "@/lib/profile.schema";
import { useForm } from "react-hook-form";

interface ProfileHeaderProps {
  profile: UserProfile;
  isEditing: boolean;
  form: ReturnType<typeof useForm<ProfileSchema>>;
}

export const ProfileHeader = ({
  profile,
  isEditing,
  form,
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
      {/* Name field with validation */}
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <div className='space-y-2'>
            <FormLabel htmlFor='name'>Name</FormLabel>
            <Input
              id='name'
              {...field}
              readOnly={!isEditing}
            />
            <FormMessage />
          </div>
        )}
      />

      {/* Email field */}
      <div className='space-y-2'>
        <Label>Email</Label>
        <Input value={profile.email} readOnly className='bg-muted' disabled />
      </div>
    </div>
  </div>
);