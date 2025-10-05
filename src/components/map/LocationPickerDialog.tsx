import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import locationSchema, { type LocationSchema } from "../../lib/location.schema";
import type { Location } from "../../types/location";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Form, FormField, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import MapView from "./MapView";

interface LocationPickerDialogProps {
  onLocationSelect: (location: Location) => void;
  open: boolean;
  setOpen: (val: boolean) => void;
}

export default function LocationPickerDialog({
  onLocationSelect,
  open,
  setOpen,
}: LocationPickerDialogProps) {
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [skipCoordinateUpdate, setSkipCoordinateUpdate] = useState(false);

  const form = useForm<LocationSchema>({
    defaultValues: {
      farmName: "",
      latitude: "",
      longitude: "",
    },
    resolver: zodResolver(locationSchema),
    mode: "onSubmit", // Only validate on submit
  });

  const latitudeQuery = form.watch("latitude");
  const longitudeQuery = form.watch("longitude");
  const farmName = form.watch("farmName");

  // Reset all states when dialog opens or closes
  useEffect(() => {
    if (open) {
      // Clear everything immediately when opening
      form.reset(
        {
          farmName: "",
          latitude: "",
          longitude: "",
        },
        {
          keepErrors: false,
          keepDirty: false,
          keepValues: false,
        }
      );
      setSelectedLocations([]);
      setSkipCoordinateUpdate(false);
      // setSkipSearchUpdate(false);
    }
  }, [open, form]);

  // Handle location update (from coordinates input or map click)
  const handleLocationUpdate = (lat: number, lng: number) => {
    const location: Location = {
      id: Date.now().toString(),
      lat: lat,
      lng: lng,
      displayName: farmName || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    };

    setSelectedLocations([location]);
    setSkipCoordinateUpdate(true);
    form.setValue("latitude", location.lat.toFixed(6), {
      shouldValidate: true,
    });
    form.setValue("longitude", location.lng.toFixed(6), {
      shouldValidate: true,
    });
  };

  // Auto-update map when coordinates change
  useEffect(() => {
    if (skipCoordinateUpdate) {
      setSkipCoordinateUpdate(false);
      return;
    }

    if (!latitudeQuery || !longitudeQuery) {
      return;
    }

    const delayDebounce = setTimeout(() => {
      const lat = parseFloat(latitudeQuery);
      const lng = parseFloat(longitudeQuery);

      if (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        const currentLat =
          selectedLocations.length > 0
            ? parseFloat(selectedLocations[0].lat.toFixed(6))
            : null;
        const currentLng =
          selectedLocations.length > 0
            ? parseFloat(selectedLocations[0].lng.toFixed(6))
            : null;

        if (
          currentLat !== parseFloat(lat.toFixed(6)) ||
          currentLng !== parseFloat(lng.toFixed(6))
        ) {
          handleLocationUpdate(lat, lng);
        }
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitudeQuery, longitudeQuery]);

  const handleSaveLocation = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    if (selectedLocations.length > 0) {
      const locationToSave = {
        ...selectedLocations[0],
        displayName: farmName || selectedLocations[0].displayName,
      };
      onLocationSelect(locationToSave);
      setOpen(false);
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className='w-[100%] max-w-[90vw] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Pick your Location</DialogTitle>
          <DialogDescription className='flex items-center gap-2'>
            <small>
              You can add your farm by locating it on the map or by pasting the
              latitude and longitude of you farm directly in the inputs below.
            </small>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={form.handleSubmit(handleSaveLocation)}
          >
            <div className='space-y-2'>
              <FormField
                control={form.control}
                name='farmName'
                render={({ field }) => (
                  <div>
                    <FormLabel htmlFor='farmName' className='mb-2'>
                      Farm name
                    </FormLabel>
                    <Input
                      id='farmName'
                      placeholder='Farm name'
                      autoComplete='off'
                      {...field}
                    />
                    <FormMessage />
                  </div>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <FormField
                  control={form.control}
                  name='latitude'
                  render={({ field }) => (
                    <div>
                      <FormLabel htmlFor='latitude' className='mb-2'>
                        Latitude
                      </FormLabel>
                      <Input
                        id='latitude'
                        placeholder='e.g. 35.6762'
                        type='number'
                        step='any'
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  )}
                />
              </div>

              <div className='space-y-2'>
                <FormField
                  control={form.control}
                  name='longitude'
                  render={({ field }) => (
                    <div>
                      <FormLabel htmlFor='longitude' className='mb-2'>
                        Longitude
                      </FormLabel>
                      <Input
                        id='longitude'
                        placeholder='e.g. 139.6503'
                        type='number'
                        step='any'
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  )}
                />
              </div>
            </div>
            <div
              className='border rounded-lg overflow-hidden'
              style={{ height: "400px" }}
            >
              <MapView
                locations={selectedLocations}
                onMapClick={handleLocationUpdate}
                clickable={true}
              />
            </div>
            <div className='flex justify-end'>
              <Button
                onClick={handleSaveLocation}
                disabled={
                  selectedLocations.length === 0 ||
                  !farmName.trim() ||
                  !latitudeQuery ||
                  !longitudeQuery
                }
                size='lg'
                className='hover:opacity-90 transition-opacity'
              >
                Save Location
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
