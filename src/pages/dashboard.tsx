import LocationPickerDialog from "@/components/map/LocationPickerDialog";
import SearchForm from "@/components/searchForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [newSearch, setNewSearch] = useState(false);

  useEffect(() => {
    // update logic to display if user doesn't have a location saved in the db
    setShowOnboarding(true);
    setHistory([]);
  }, []);

  if (history.length === 0) {
    return (
      <Card className='px-5 max-w-[700px] mx-auto'>
        <CardHeader>
          <CardTitle>Start a search</CardTitle>
          <CardDescription>
            Find the best planting and harvesting times for your crops
          </CardDescription>
        </CardHeader>
        <SearchForm />
      </Card>
    );
  }

  return (
    <div>
      <div className='flex justify-end'>
        <Dialog open={newSearch} onOpenChange={setNewSearch}>
          <DialogTrigger asChild>
            <Button
              className='rounded-full'
              title='Create new search'
              onClick={() => setNewSearch(!newSearch)}
            >
              <Plus />
              <span className='sr-only'>Create new search</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[700px]">
            <DialogTitle>New Search</DialogTitle>
            <SearchForm onSearch={() => setNewSearch(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <LocationPickerDialog
        onLocationSelect={(location) => {
          console.log("Selected location:", location);
        }}
        open={showOnboarding}
        setOpen={setShowOnboarding}
      />
    </div>
  );
};

export default Dashboard;
