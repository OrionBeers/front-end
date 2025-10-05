import api from "@/lib/api.axios";
import { useAuth } from "@/lib/auth.provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import locationSchema, { type LocationSchema } from "../../lib/location.schema";
import type { CreateLocation } from "../../types/location";
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
import { onLoadUser, saveUserToLocalStorage } from "@/assets/scripts/auth";
import type { UserAuthResponse } from "@/types/user";

interface LocationPickerDialogProps {
  open: boolean;
  setOpen: (val: boolean) => void;
}

export default function LocationPickerDialog({
  open,
  setOpen,
}: LocationPickerDialogProps) {
  const { user } = useAuth();
  const [selectedLocations, setSelectedLocations] = useState<CreateLocation[]>(
    []
  );
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
  const handleLocationUpdate = (latitude: number, longitude: number) => {
    const location: CreateLocation = {
      latitude: latitude,
      longitude: longitude,
      display_name:
        farmName || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    };

    setSelectedLocations([location]);
    setSkipCoordinateUpdate(true);
    form.setValue("latitude", location.latitude.toFixed(6), {
      shouldValidate: true,
    });
    form.setValue("longitude", location.longitude.toFixed(6), {
      shouldValidate: true,
    });
  };

  const handleSaveLocation = async (data: LocationSchema) => {
    try {
      const params = {
        display_name: data.farmName,
        latitude: data.latitude,
        longitude: data.longitude,
        id_user: user._id,
      };
      await api.post("/locations", params);
      toast.success("Location saved successfully");
      if (user.is_onboarding) {
        await api.patch(`/users?id_user=${user._id}`, {
          is_onboarding: false,
          id_user: user._id,
          email: user.email,
        });
        const updatedUser = await onLoadUser()
        saveUserToLocalStorage(updatedUser! as UserAuthResponse)
      }
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save location");
      console.error("Failed to save location:", error);
    }
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
            ? parseFloat(selectedLocations[0].latitude.toFixed(6))
            : null;
        const currentLng =
          selectedLocations.length > 0
            ? parseFloat(selectedLocations[0].longitude.toFixed(6))
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                type='button'
                disabled={
                  selectedLocations.length === 0 ||
                  !farmName.trim() ||
                  !latitudeQuery ||
                  !longitudeQuery
                }
                size='lg'
                className='hover:opacity-90 transition-opacity'
                onClick={form.handleSubmit(handleSaveLocation)}
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
