import type { Location } from "@/types/location";
import type { UserProfile } from "@/types/user";
import { useAuth } from "@/lib/auth.provider";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LocationPickerDialog from "@/components/map/LocationPickerDialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProfileHeader } from "@/components/profile/profileInfo";
import { LocationSection } from "@/components/profile/locationSection";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [editLocations, setEditLocations] = useState<Location[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get("/locations");
        const profile: UserProfile = {
            _id: user.uid,
            email: user.email || "",
            name: user.displayName || "User",
            avatar: user.photoURL || "",
            id_google: user.uid,
            historical_data: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            locations: data || [],
        };
        setProfile(profile);
        setEditName(profile.name);
      } catch (error) {
        console.warn("API not available:", error);
        setProfile(null);
        setEditName("");
        toast.error("Failed to fetch profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;

    const updateData: Partial<UserProfile> = { 
      name: editName,
      locations: editLocations
    };
    
    try {
      const { data } = await axiosInstance.patch("/user/profile", updateData);
      setProfile(data);
      toast.success("Profile updated!");
    } catch (error) {
      console.warn("API not available:", error);
      setProfile({ ...profile, ...updateData });
      toast.success("Profile updated locally");
    } finally {
      setIsEditing(false);
      setEditLocations([]);
    }
  };

  const handleAddLocation = () => {
    setShowLocationPicker(true);
  };

  const handleRemoveLocation = (index: number) => {
    setEditLocations(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartEditing = () => {
    setEditLocations(profile?.locations || []);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditLocations([]);
    setEditName(profile?.name || "");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <Card>
          <CardContent className="pt-6 text-center">Loading...</CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          {!isEditing && (
            <Button onClick={handleStartEditing}>Edit</Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <ProfileHeader
            profile={profile}
            isEditing={isEditing}
            editName={editName}
            onNameChange={setEditName}
          />
          
          <LocationSection
            locations={profile.locations}
            isEditing={isEditing}
            editLocations={editLocations}
            onAddLocation={handleAddLocation}
            onRemoveLocation={handleRemoveLocation}
            onStartEditing={handleStartEditing}
          />

          {/* Action buttons */}
          {isEditing && (
            <div className="flex gap-4 justify-end pt-4">
              <Button variant="outline" onClick={handleCancel}>
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