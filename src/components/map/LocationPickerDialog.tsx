import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Location } from "../../types/location";
import locationSchema, { type LocationSchema } from "../../lib/location.schema";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Form, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import MapView from "./MapView";

// External API client for OpenStreetMap (no authentication needed)
const osmClient = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  timeout: 10000,
  headers: {
    "User-Agent": "LocationPickerApp/1.0",
  },
});

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
  // const [skipSearchUpdate, setSkipSearchUpdate] = useState(false);

  const form = useForm<LocationSchema>({
    defaultValues: {
      farmName: "",
      latitude: "",
      longitude: "",
      // country: "",
      // region: "",
    },
    resolver: zodResolver(locationSchema),
    mode: "onSubmit", // Only validate on submit
  });

  const latitudeQuery = form.watch("latitude");
  const longitudeQuery = form.watch("longitude");
  const farmName = form.watch("farmName");
  // const countryQuery = form.watch("country");
  // const regionQuery = form.watch("region");

  // Reset all states when dialog opens or closes
  useEffect(() => {
    if (open) {
      // Clear everything immediately when opening
      form.reset({
        farmName: "",
        latitude: "",
        longitude: "",
        // country: "",
        // region: "",
      }, {
        keepErrors: false,
        keepDirty: false,
        keepValues: false,
      });
      setSelectedLocations([]);
      setSkipCoordinateUpdate(false);
      // setSkipSearchUpdate(false);
    }
  }, [open, form]);

  // Auto-search when country or region changes
  // useEffect(() => {
  //   // Skip if country/region were updated from map click or coordinate input
  //   if (skipSearchUpdate) {
  //     setSkipSearchUpdate(false);
  //     return;
  //   }

  //   const delayDebounce = setTimeout(() => {
  //     if (countryQuery.trim() || regionQuery.trim()) {
  //       searchAndSelectLocation();
  //     }
  //   }, 800); // 800ms delay for debouncing

  //   return () => clearTimeout(delayDebounce);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [countryQuery, regionQuery]);

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
          handleCoordinatesChange(lat, lng);
        }
      }
    }, 800);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitudeQuery, longitudeQuery]);

  // Search and automatically select the first result
  // const searchAndSelectLocation = async () => {
  //   if (!countryQuery.trim() && !regionQuery.trim()) return;

  //   const query = regionQuery
  //     ? `${regionQuery}, ${countryQuery}`
  //     : countryQuery;

  //   try {
  //     const response = await osmClient.get("/search", {
  //       params: {
  //         format: "json",
  //         q: query,
  //         limit: 1,
  //         "accept-language": "en",
  //       },
  //     });
  //     const data = response.data;

  //     if (data.length > 0) {
  //       const result = data[0];
  //       const location: Location = {
  //         id: Date.now().toString(),
  //         country:
  //           result.address?.country ||
  //           result.display_name.split(",").pop()?.trim() ||
  //           "Unknown",
  //         region:
  //           result.address?.state ||
  //           result.address?.city ||
  //           result.address?.town ||
  //           result.address?.village ||
  //           result.display_name.split(",")[0],
  //         lat: parseFloat(result.lat),
  //         lng: parseFloat(result.lon),
  //         displayName: farmName || result.display_name,
  //       };

  //       setSelectedLocations([location]);

  //       // Update coordinate fields and skip the coordinate useEffect
  //       setSkipCoordinateUpdate(true);
  //       form.setValue("latitude", location.lat.toFixed(6), { shouldValidate: true });
  //       form.setValue("longitude", location.lng.toFixed(6), { shouldValidate: true });
  //     } else {
  //       // No results found, clear the pin
  //       setSelectedLocations([]);
  //     }
  //   } catch (error) {
  //     console.error("Search error:", error);
  //   }
  // };

  // Handle coordinates input change
  const handleCoordinatesChange = async (lat: number, lng: number) => {
    try {
      const response = await osmClient.get("/reverse", {
        params: {
          format: "json",
          lat: lat,
          lon: lng,
          "accept-language": "en",
        },
      });
      const data = response.data;

      const location: Location = {
        id: Date.now().toString(),
        country: data.address?.country || "Unknown",
        region:
          data.address?.state ||
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.display_name?.split(",")[0] ||
          "Unknown",
        lat: lat,
        lng: lng,
        displayName: farmName || data.display_name,
      };

      setSelectedLocations([location]);
      setSkipCoordinateUpdate(true);
      // setSkipSearchUpdate(true);
      // form.setValue("country", location.country);
      // form.setValue("region", location.region);
      form.setValue("latitude", location.lat.toFixed(6), { shouldValidate: true });
      form.setValue("longitude", location.lng.toFixed(6), { shouldValidate: true });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      const location: Location = {
        id: Date.now().toString(),
        country: "Unknown",
        region: "Unknown",
        lat: lat,
        lng: lng,
        displayName: farmName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
      setSelectedLocations([location]);
      setSkipCoordinateUpdate(true);
      // setSkipSearchUpdate(true);
      // form.setValue("country", "Unknown");
      // form.setValue("region", "Unknown");
      form.setValue("latitude", location.lat.toFixed(6), { shouldValidate: true });
      form.setValue("longitude", location.lng.toFixed(6), { shouldValidate: true });
    }
  };

  // Reverse geocoding when map is clicked
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const response = await osmClient.get("/reverse", {
        params: {
          format: "json",
          lat: lat,
          lon: lng,
          "accept-language": "en",
        },
      });
      const data = response.data;

      const location: Location = {
        id: Date.now().toString(),
        country: data.address?.country || "Unknown",
        region:
          data.address?.state ||
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.display_name?.split(",")[0] ||
          "Unknown",
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        displayName: farmName || data.display_name,
      };

      setSelectedLocations([location]);
      setSkipCoordinateUpdate(true);
      // setSkipSearchUpdate(true);
      // form.setValue("country", location.country);
      // form.setValue("region", location.region);
      form.setValue("latitude", location.lat.toFixed(6), { shouldValidate: true });
      form.setValue("longitude", location.lng.toFixed(6), { shouldValidate: true });
    } catch (error) {
      console.error("Reverse geocoding error:", error);

      const location: Location = {
        id: Date.now().toString(),
        country: "Unknown",
        region: "Unknown",
        lat: lat,
        lng: lng,
        displayName: farmName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };

      setSelectedLocations([location]);
      setSkipCoordinateUpdate(true);
      // setSkipSearchUpdate(true);
      // form.setValue("country", "Unknown");
      // form.setValue("region", "Unknown");
      form.setValue("latitude", lat.toFixed(6), { shouldValidate: true });
      form.setValue("longitude", lng.toFixed(6), { shouldValidate: true });
    }
  };

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

        <div className='space-y-6'>
          <Form {...form}>
            <form className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='farmName'>Farm name</Label>
                <FormField
                  control={form.control}
                  name='farmName'
                  render={({ field }) => (
                    <div>
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
                  <Label htmlFor='latitude'>Latitude</Label>
                  <FormField
                    control={form.control}
                    name='latitude'
                    render={({ field }) => (
                      <div>
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
                  <Label htmlFor='longitude'>Longitude</Label>
                  <FormField
                    control={form.control}
                    name='longitude'
                    render={({ field }) => (
                      <div>
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

              {/* Search Section */}
              {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='country'>Country</Label>
                  <FormField
                    control={form.control}
                    name='country'
                    render={({ field }) => (
                      <div>
                        <Input
                          id='country'
                          placeholder='e.g. Canada, USA, France...'
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='region'>Region</Label>
                  <FormField
                    control={form.control}
                    name='region'
                    render={({ field }) => (
                      <div>
                        <Input
                          id='region'
                          placeholder='e.g. Vancouver, New York, Paris...'
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
              </div> */}
            </form>
          </Form>

          <div
            className='border rounded-lg overflow-hidden'
            style={{ height: "400px" }}
          >
            <MapView
              locations={selectedLocations}
              onMapClick={handleMapClick}
              clickable={true}
            />
          </div>

          <div className='flex justify-end'>
            <Button
              onClick={handleSaveLocation}
              disabled={selectedLocations.length === 0 || !farmName.trim() || !latitudeQuery || !longitudeQuery}
              size='lg'
              className='hover:opacity-90 transition-opacity'
            >
              Save Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}