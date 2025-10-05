import LocationPickerDialog from "@/components/map/LocationPickerDialog";
import { LocationSection } from "@/components/profile/locationSection";
import { ProfileHeader } from "@/components/profile/profileInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import api from "@/lib/api.axios";
import { useAuth } from "@/lib/auth.provider";
import ProfileSchema, {
  type ProfileSchema as ProfileFormSchema,
} from "@/lib/profile.schema";
import type { Location } from "@/types/location";
import type { UserProfile } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const defaultProfile: UserProfile = {
  _id: "",
  email: "",
  name: "User",
  avatar: "",
  id_google: "",
  historical_data: [],
  created_at: "",
  updated_at: "",
  locations: [],
};

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editLocations, setEditLocations] = useState<Location[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const form = useForm<ProfileFormSchema>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(ProfileSchema),
    mode: "onChange",
  });

  const fetchLocations = async () => {
    const { data } = await api.get(`/locations?id_user=${user._id}`);
    console.log("Fetched locations:", data);
    if (!data.length) {
      return [];
    }
    return data;
  };

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const data = await fetchLocations();
        const { data: profile } = await api.get("/users", {
          params: { email: user.email, id_user: user._id },
        });
        const fetchedProfile = {
          ...profile,
          avatar: user.avatar || "",
          locations: data,
        };
        setProfile(fetchedProfile);
        form.reset({ name: profile.name });
        setEditLocations(data);
      } catch (error) {
        console.warn("API not available:", error);
        setProfile(null);
        // TODO: delete after backend is ready
        setProfile(defaultProfile);
        form.reset({ name: defaultProfile.name });
        toast.error("Failed to fetch profile data");
      } finally {
        setIsLoading(false);
      }
    };

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
      email: profile.email,
    };

    try {
      const { data: updatedProfile } = await api.patch("/users", updateData);
      setProfile(updatedProfile);
      toast.success("Profile updated!");
    } catch (error) {
      console.warn("API not available:", error);
      setProfile({ ...profile, ...updateData });
      toast.error("Failed to update profile", {
        description: (error as Error)?.message,
      });
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
    form.reset({ name: profile?.name || "" });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset({ name: profile?.name || "" });
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
