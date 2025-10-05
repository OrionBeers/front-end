import { useAuth } from "@/lib/auth.provider";
import axiosInstance from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationPickerDialog from "@/components/map/LocationPickerDialog";
import MapView from "@/components/map/MapView";
import type { Location } from "@/types/location";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/types/user";
import { PlusIcon } from "lucide-react";

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
        const { data } = await axiosInstance.get("/user/profile");
        setProfile(data);
        setEditName(data.name);
      } catch (error) {
        console.warn("API not available:", error);
        // Use Firebase user data as fallback
        // TODO: delete after connceting with backend
        const fallbackProfile: UserProfile = {
          _id: user.uid,
          email: user.email || "",
          name: user.displayName || "User",
          avatar: user.photoURL || "",
          id_google: user.uid,
          historical_data: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        setEditName(fallbackProfile.name);
        toast.info("Using local data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;

    const updateData: Partial<UserProfile> = { name: editName };
    if (editLocations.length > 0) {
      // Merge with existing locations if any
      updateData.locations = [...(profile.locations || []), ...editLocations];
    }
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
    }
  };

  const locationToDisplay = (loc: Location | undefined) => {
    if (!loc) return null;
    return {
      id: loc.id || "current",
      country: loc.country || "Unknown",
      region: loc.region || "Unknown",
      lat: loc.lat,
      lng: loc.lng,
      displayName: loc.displayName || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`,
    };
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

  const displayLocations = (profile.locations || []).map(locationToDisplay);

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>
          {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit</Button>}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            {isEditing ? (
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            ) : (
              <div className="text-lg font-medium">{profile.name}</div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="text-lg text-muted-foreground">{profile.email}</div>
          </div>

          {/* Location (multiple support) */}
          <div className="space-y-2">
            <Label>Location</Label>
            {isEditing ? (
              <>
                <div className="space-y-2">
                  {editLocations.length > 0 && (
                    <div>
                      {editLocations.map((loc, idx) => (
                        <Card key={idx} className="mb-1 shadow-none border border-muted-foreground/10">
                          <CardContent className="flex flex-col gap-0.5 px-4 py-1">
                            <div className="flex items-center justify-between">
                              <div>
                                {loc.displayName && (
                                  <div className="text-sm font-semibold mb-0.5">{loc.displayName}</div>
                                )}
                                <div className="text-xs mb-0.5">{`${loc.region}, ${loc.country}`}</div>
                                <div className="text-xs text-muted-foreground">Lat: {loc.lat}, Lng: {loc.lng}</div>
                              </div>
                              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setEditLocations(editLocations.filter((_, i) => i !== idx))}>Remove</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setShowLocationPicker(true)} className="w-full">
                    Add Location
                  </Button>
                </div>
              </>
            ) : Array.isArray(profile.locations) && profile.locations.length > 0 ? (
              <div className="space-y-2">
                {profile.locations.map((loc, idx) => {
                  const displayLoc = locationToDisplay(loc);
                  if (!displayLoc) return null;
                  return (
                    <div key={idx} className="mb-4">
                      {/* Farm name at the top */}
                      {displayLoc.displayName && (
                        <div className="text-lg font-bold mb-1">{displayLoc.displayName}</div>
                      )}
                      {/* Location info below */}
                      <div className="text-md mb-1">{`${displayLoc.region}, ${displayLoc.country}`}</div>
                      <div className="text-sm text-muted-foreground">Lat: {displayLoc.lat}, Lng: {displayLoc.lng}</div>
                    </div>
                  );
                })}
              </div>
            ) : displayLocations.length > 0 ? (
              <div className="space-y-2">
                {displayLocations.filter(Boolean).map((loc, idx) => (
                  loc ? (
                    <div key={idx} className="mb-4">
                      {/* Farm name at the top */}
                      {loc.displayName && (
                        <div className="text-lg font-bold mb-1">{loc.displayName}</div>
                      )}
                      {/* Location info below */}
                      <div className="text-md mb-1">{`${loc.region}, ${loc.country}`}</div>
                      <div className="text-sm text-muted-foreground">Lat: {loc.lat}, Lng: {loc.lng}</div>
                    </div>
                  ) : null
                ))}
                <div className="border rounded-lg overflow-hidden" style={{ height: "300px" }}>
                  <MapView locations={displayLocations.filter(Boolean) as Location[]} onMapClick={() => {}} clickable={false} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Not set</span>
                <Button onClick={() => { setIsEditing(true); setShowLocationPicker(true); }}  className="rounded-full w-8 h-8 flex items-center justify-center">
                  <PlusIcon className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex gap-4 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
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
