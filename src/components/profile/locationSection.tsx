import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import type { Location } from "@/types/location";
import { LocationItem } from "./locationItem";

interface LocationSectionProps {
  locations?: Location[];
  isEditing: boolean;
  editLocations: Location[];
  onAddLocation: () => void;
  onRemoveLocation: (index: number) => void;
  onStartEditing: () => void;
}

export const LocationSection = ({
  locations = [],
  isEditing,
  editLocations,
  onAddLocation,
  onRemoveLocation,
  onStartEditing
}: LocationSectionProps) => (
  <div className="space-y-2">
    <Label>Location</Label>
    {isEditing ? (
      // Edit mode
          <div className="flex items-center gap-2 relative">
        {editLocations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {editLocations.map((loc, idx) => (
              <LocationItem
                key={idx}
                location={loc}
                showRemove
                onRemove={() => onRemoveLocation(idx)}
              />
            ))}
          </div>
        )}
        <Button 
            onClick={onAddLocation}  
            className="rounded-full w-8 h-8 flex items-center justify-center absolute top-0 right-0"
        >
            <Plus className="h-5 w-5" />
        </Button>
        </div>
    //   </div>
    ) : locations.length > 0 ? (
      // View mode - has locations
      <div className="space-y-2">
        {locations.map((loc, idx) => (
          <LocationItem key={idx} location={loc} />
        ))}
      </div>
    ) : (
      // View mode - no locations
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Not set</span>
        <Button 
          onClick={onStartEditing}  
          className="rounded-full w-8 h-8 flex items-center justify-center"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    )}
  </div>
);