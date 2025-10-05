import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Location } from "@/types/location";
import { Plus } from "lucide-react";
import { LocationItem } from "./locationItem";

interface LocationSectionProps {
  isEditing: boolean;
  editLocations: Location[];
  onAddLocation: () => void;
  onRemoveLocation: (index: number) => void;
}

export const LocationSection = ({
  isEditing,
  editLocations,
  onAddLocation,
  onRemoveLocation,
}: LocationSectionProps) => (
  <div className='space-y-2'>
    <Label>Location</Label>

    <div className='flex items-center gap-2 relative'>
      {editLocations.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {editLocations.map((loc, idx) => (
            <LocationItem
              key={idx}
              location={loc}
              showRemove={isEditing}
              onRemove={() => onRemoveLocation(idx)}
            />
          ))}
        </div>
      ) : (
        <span className='text-muted-foreground'>Not set</span>
      )}

      <Button
        onClick={onAddLocation}
        className='rounded-full w-8 h-8 flex items-center justify-center absolute top-0 right-0'
      >
        <Plus className='h-5 w-5' />
      </Button>
    </div>
  </div>
);