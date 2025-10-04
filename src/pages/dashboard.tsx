import LocationPickerDialog from "@/components/map/LocationPickerDialog";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // update logic to display if user doesn't have a location saved in the db
    setShowOnboarding(true);
  }, [])

  return (
    <div>
      {showOnboarding && (
        <LocationPickerDialog
          onLocationSelect={(location) => {
            console.log("Selected location:", location);
          }}
          open={showOnboarding}
          setOpen={setShowOnboarding}
        />
      )}
    </div>
  );
};

export default Dashboard;
