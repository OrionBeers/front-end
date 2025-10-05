import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Location } from "@/types/location";
import { Trash } from "lucide-react";

interface LocationItemProps {
  location: Location;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const LocationItem = ({
  location,
  onRemove,
  showRemove = false,
}: LocationItemProps) => {
  return (
    <Card className='mb-1 shadow-none border border-muted-foreground/10 w-[200px] py-3 relative'>
      <CardContent className='flex flex-col gap-0.5 px-4 py-1'>
        <div className='flex flex-row items-start justify-between'>
          <div className='flex flex-col'>
            {location.display_name && (
              <div className='text-sm font-semibold mb-0.5'>
                {location.display_name}
              </div>
            )}
            <div className='text-xs text-muted-foreground'>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          </div>
          {showRemove ? (
            <Button
              variant='ghost'
              size='icon'
              className='w-7 h-7 absolute top-1 right-1'
              onClick={onRemove}
            >
              <Trash />
              <span className='sr-only'>Remove</span>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
