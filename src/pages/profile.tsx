/* eslint-disable react-hooks/exhaustive-deps */
import { saveUserToLocalStorage } from "@/assets/scripts/auth";
import LocationPickerDialog from "@/components/map/LocationPickerDialog";
import { LocationSection } from "@/components/profile/locationSection";
import { ProfileHeader } from "@/components/profile/profileInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import api from "@/lib/api.axios";
import { useAuth } from "@/lib/auth.provider";
import profileSchema, {
  type ProfileSchema as ProfileFormSchema,
} from "@/lib/profile.schema";
import type { Location } from "@/types/location";
import type { UserProfile } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editLocations, setEditLocations] = useState<Location[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const form = useForm<ProfileFormSchema>({
    defaultValues: {
      name: profile?.name,
      email: profile?.email,
    },
    resolver: zodResolver(profileSchema),
  });

  const fetchLocations = async () => {
    try {
      const { data } = await api.get(`/locations?id_user=${user._id}`);
      if (!data.length) {
        return [];
      }
      return data;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

  // Fetch profile on mount
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const data = await fetchLocations();
      const fetchedProfile = {
        ...user,
        locations: data,
      };
      setProfile(fetchedProfile);
      setEditLocations(data);
    } catch (error) {
      console.warn("API not available:", error);
      toast.error("Failed to fetch profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, form]);

  useEffect(() => {
    if (
      profile?.locations?.some((it) => {
        const exists = editLocations.find((loc) => loc._id === it._id);
        const changed = exists && JSON.stringify(exists) !== JSON.stringify(it);
        return !exists || changed;
      })
    ) {
      setEditLocations(profile?.locations || []);
    }
  }, [profile, editLocations]);

  const handleSave = async (data: ProfileFormSchema) => {
    if (!profile) return;

    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const updateData: Partial<UserProfile> = {
      name: data.name,
      email: data.email,
      is_onboarding: false,
    };

    try {
      const { data: updatedProfile } = await api.patch("/users", updateData);
      saveUserToLocalStorage(updatedProfile);
      setProfile(updatedProfile);
      toast.success("Profile updated!");
    } catch (error) {
      console.warn("API not available:", error);
      toast.error("Failed to update profile", {
        description: (error as Error)?.message,
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleAddLocation = () => {
    setShowLocationPicker(true);
  };

  const handleRemoveLocation = async (_id: string) => {
    try {
      const { data } = await api.delete(
        `/locations?id_location=${_id}&id_user=${user._id}`
      );
      await fetchLocations();
      setEditLocations(data);
      if (profile) setProfile({ ...profile, locations: data });
      toast.success("Location removed");
    } catch (e) {
      toast.error("Failed to remove location");
      console.log(e);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className='container mx-auto py-10 px-4 max-w-4xl'>
        <Card>
          <CardContent className='pt-6 text-center'>Loading...</CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className='container mx-auto py-10 px-4 max-w-4xl'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Profile</CardTitle>
          {!isEditing && <Button onClick={handleStartEditing}>Edit</Button>}
        </CardHeader>

        <CardContent className='space-y-6'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className='space-y-6'
            >
              <ProfileHeader
                profile={profile}
                isEditing={isEditing}
                form={form}
              />

              <LocationSection
                isEditing={isEditing}
                editLocations={editLocations}
                onAddLocation={handleAddLocation}
                onRemoveLocation={handleRemoveLocation}
              />

              {/* Action buttons */}
              {isEditing && (
                <div className='flex gap-4 justify-end pt-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Save</Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <LocationPickerDialog
        open={showLocationPicker}
        setOpen={setShowLocationPicker}
      />
    </div>
  );
};

export default Profile;
