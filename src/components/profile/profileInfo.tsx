import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileSchema } from "@/lib/profile.schema";
import type { UserProfile } from "@/types/user";
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
  <div className='flex flex-col md:flex-row items-center gap-6 mb-6'>
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
          <FormItem className='space-y-2'>
            <FormLabel htmlFor='name'>Name</FormLabel>
            <FormControl>
              <Input id='name' {...field} readOnly={!isEditing} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Email field */}
      <FormField
        control={form.control}
        name='email'
        render={({ field }) => (
          <FormItem className='space-y-2'>
            <Label>Email</Label>
            <FormControl>
              <Input
                value={field.value}
                readOnly
                className='bg-muted'
                disabled
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  </div>
);
