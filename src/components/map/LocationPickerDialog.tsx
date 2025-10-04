import axios from "axios";
import { useEffect, useState } from "react";
import type { Location } from "../../types/location";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
  const [countryQuery, setCountryQuery] = useState("");
  const [regionQuery, setRegionQuery] = useState("");
  const [latitudeQuery, setLatitudeQuery] = useState("");
  const [longitudeQuery, setLongitudeQuery] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [skipCoordinateUpdate, setSkipCoordinateUpdate] = useState(false);
  const [skipSearchUpdate, setSkipSearchUpdate] = useState(false);
  const [farmName, setFarmName] = useState("");

  // Auto-search when country or region changes
  useEffect(() => {
    // Skip if country/region were updated from map click or coordinate input
    if (skipSearchUpdate) {
      setSkipSearchUpdate(false);
      return;
    }

    const delayDebounce = setTimeout(() => {
      if (countryQuery.trim() || regionQuery.trim()) {
        searchAndSelectLocation();
      }
    }, 800); // 800ms delay for debouncing

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryQuery, regionQuery]);

  // Auto-update map when coordinates change
  useEffect(() => {
    // Skip if coordinates were updated from map click
    if (skipCoordinateUpdate) {
      setSkipCoordinateUpdate(false);
      return;
    }

    const delayDebounce = setTimeout(() => {
      const lat = parseFloat(latitudeQuery);
      const lng = parseFloat(longitudeQuery);

      // Check if the parsed coordinates match the current location (to avoid re-triggering)
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

        // Only call handleCoordinatesChange if the coordinates have actually changed
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
  const searchAndSelectLocation = async () => {
    if (!countryQuery.trim() && !regionQuery.trim()) return;

    const query = regionQuery
      ? `${regionQuery}, ${countryQuery}`
      : countryQuery;

    try {
      const response = await osmClient.get("/search", {
        params: {
          format: "json",
          q: query,
          limit: 1,
          "accept-language": "en",
        },
      });
      const data = response.data;

      if (data.length > 0) {
        const result = data[0];
        const location: Location = {
          id: Date.now().toString(),
          country:
            result.address?.country ||
            result.display_name.split(",").pop()?.trim() ||
            "Unknown",
          region:
            result.address?.state ||
            result.address?.city ||
            result.address?.town ||
            result.address?.village ||
            result.display_name.split(",")[0],
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
        };

        setSelectedLocations([location]);
        onLocationSelect(location);

        // Update coordinate fields and skip the coordinate useEffect
        setSkipCoordinateUpdate(true);
        setLatitudeQuery(location.lat.toFixed(6));
        setLongitudeQuery(location.lng.toFixed(6));
      } else {
        // No results found, clear the pin
        setSelectedLocations([]);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

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
        displayName: data.display_name,
      };

      setSelectedLocations([location]);
      onLocationSelect(location);

      // Update country and region fields and skip both search and coordinate updates
      setSkipCoordinateUpdate(true);
      setSkipSearchUpdate(true);
      setCountryQuery(location.country);
      setRegionQuery(location.region);
      setLatitudeQuery(location.lat.toFixed(6));
      setLongitudeQuery(location.lng.toFixed(6));
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      const location: Location = {
        id: Date.now().toString(),
        country: "Unknown",
        region: "Unknown",
        lat: lat,
        lng: lng,
        displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };
      setSelectedLocations([location]);
      onLocationSelect(location);
      setSkipCoordinateUpdate(true);
      setSkipSearchUpdate(true);
      setCountryQuery("Unknown");
      setRegionQuery("Unknown");
      setLatitudeQuery(location.lat.toFixed(6));
      setLongitudeQuery(location.lng.toFixed(6));
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
        displayName: data.display_name,
      };

      // Replace with only one location and notify parent (ONLY ONCE)
      setSelectedLocations([location]);
      onLocationSelect(location);

      // Update all fields and skip both search and coordinate useEffects
      setSkipCoordinateUpdate(true);
      setSkipSearchUpdate(true);
      setCountryQuery(location.country);
      setRegionQuery(location.region);
      setLatitudeQuery(location.lat.toFixed(6));
      setLongitudeQuery(location.lng.toFixed(6));
    } catch (error) {
      console.error("Reverse geocoding error:", error);

      // Even if reverse geocoding fails, add the location with coordinates
      const location: Location = {
        id: Date.now().toString(),
        country: "Unknown",
        region: "Unknown",
        lat: lat,
        lng: lng,
        displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };

      // Replace with only one location and notify parent (ONLY ONCE)
      setSelectedLocations([location]);
      onLocationSelect(location);

      // Update all fields and skip both search and coordinate useEffects
      setSkipCoordinateUpdate(true);
      setSkipSearchUpdate(true);
      setCountryQuery("Unknown");
      setRegionQuery("Unknown");
      setLatitudeQuery(lat.toFixed(6));
      setLongitudeQuery(lng.toFixed(6));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='w-[100%] max-w-[90vw] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Picked your Location</DialogTitle>
          <DialogDescription>
            Enter country/region, coordinates, or latitude/longitude on the map
            to select your location
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <Input
            name="farmName"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            placeholder="Farm name"
          />
          {/* Search Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='country'>Country</Label>
              <Input
                id='country'
                placeholder='e.g. Canada, USA, France...'
                value={countryQuery}
                onChange={(e) => setCountryQuery(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='region'>Region</Label>
              <Input
                id='region'
                placeholder='e.g. Vancouver, New York, Paris...'
                value={regionQuery}
                onChange={(e) => setRegionQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Map Display */}
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

          {/* Coordinates Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='latitude'>Latitude</Label>
              <Input
                id='latitude'
                placeholder='e.g. 35.6762'
                value={latitudeQuery}
                onChange={(e) => setLatitudeQuery(e.target.value)}
                type='number'
                step='any'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='longitude'>Longitude</Label>
              <Input
                id='longitude'
                placeholder='e.g. 139.6503'
                value={longitudeQuery}
                onChange={(e) => setLongitudeQuery(e.target.value)}
                type='number'
                step='any'
              />
            </div>
          </div>

          {/* Save Button */}
          <div className='flex justify-end'>
            <Button
              onClick={() => setOpen(false)}
              disabled={selectedLocations.length === 0}
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
