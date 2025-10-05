import LocationPickerDialog from "@/components/map/LocationPickerDialog";
import { LocationSection } from "@/components/profile/locationSection";
import { ProfileHeader } from "@/components/profile/profileInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import authAxios from "@/lib/auth.axios";
import { useAuth } from "@/lib/auth.provider";
import type { Location } from "@/types/location";
import type { UserProfile } from "@/types/user";
import { useEffect, useState } from "react";
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
  const [editName, setEditName] = useState("");
  const [editLocations, setEditLocations] = useState<Location[]>(
    () => profile?.locations || []
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        // const { data } = await axiosInstance.get("/locations");
        const data = [
          {
            displayName: "New York, USA",
            lat: 40.7128,
            lng: -74.006,
          },
        ] as Location[]; // TODO: remove after backend is ready
        const { data: profile } = await authAxios.get("/users", {
          params: { email: user.email },
        });
        setProfile({
          ...profile,
          avatar: user.photoURL || "",
          locations: data,
        });
        setEditName(profile.name);
      } catch (error) {
        console.warn("API not available:", error);
        setProfile(null);
        setEditName("");
        // TODO: delete after backend is ready
        setProfile(defaultProfile);
        toast.error("Failed to fetch profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (
      profile?.locations?.some((it) =>
        editLocations.every((el) => el.lat !== it.lat && el.lng !== it.lng)
      )
    ) {
      setEditLocations(profile?.locations || []);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    const updateData: Partial<UserProfile> = {
      name: editName,
      email: profile.email,
      // edit locations separate (it's a different endpoint)
      // locations: editLocations,
    };

    try {
      const { data } = await authAxios.patch("/users", updateData);
      setProfile(data);
      toast.success("Profile updated!");
    } catch (error) {
      console.warn("API not available:", error);
      setProfile({ ...profile, ...updateData });
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

  const handleRemoveLocation = (index: number) => {
    // create logic to remove location when api is ready
    setEditLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartEditing = () => {
    setEditName(profile?.name || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(profile?.name || "");
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
          <ProfileHeader
            profile={profile}
            isEditing={isEditing}
            editName={editName}
            onNameChange={setEditName}
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
              <Button variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <LocationPickerDialog
        open={showLocationPicker}
        setOpen={setShowLocationPicker}
        onLocationSelect={(loc) => {
          setEditLocations((prev) => [...prev, loc]);
        }}
      />
    </div>
  );
};

export default Profile;
