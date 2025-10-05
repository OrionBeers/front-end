import StatusCalendar from "@/components/dashboard/calendar";
import CalendarSkeleton from "@/components/dashboard/calendar/skelton";
import DetailsCard from "@/components/dashboard/details";
import DashboardTitle from "@/components/dashboard/title";
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
import api from "@/lib/api.axios";
import { useAuth } from "@/lib/auth.provider";
import { formatDate } from "@/lib/formatData";
// import { listenToHistory } from "@/lib/realtimeDatabase";
import type {
  CalendarData,
  DashboardRequestDetails,
  DashboardRequests,
} from "@/types/dashboard";
import { Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();
  const [requests, setRequests] = useState<DashboardRequests[]>([]);
  const [newSearch, setNewSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<DashboardRequestDetails>(
    {} as DashboardRequestDetails
  );
  const [selectedDate, setSelectedDate] = useState<CalendarData | null>(null);

  const [loadingMessage, _setLoadingMessage] = useState("Search started...");

  useEffect(() => {
    // update logic to display if user doesn't have a location saved in the db
    setShowOnboarding(true);
  }, []);

  const fetchCrop = async (history_id: string) => {
    setIsLoadingCalendar(true);
    const { data } = await api.get(
      `/dashboard?id_user=${user._id}&history_id=${history_id}`
    );
    setSelectedCrop(data[0] || ({} as DashboardRequests));
    setIsLoadingCalendar(false);
  };

  const fetchRequests = async () => {
    const { data } = await api.get(`/dashboard?id_user=${user._id}`);
    setRequests(data || []);
    if (data.length) await fetchCrop(data[0]?._id);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // useEffect(() => {
  //   // NOTE: this is sample of real-time updates using Firebase Realtime Database
  //   console.log("Setting up real-time listener...");
  //   listenToHistory({
  //     idUser:user._id,
  //     idRequest:requests[0]?._id || "",
  //     onUpdate: (data) => {
  //       console.log("Real-time data update:", data);
  //     },
  //   });
  // },[])

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full w-full'>
        <Loader className='animate-spin size-10 text-ui-accent' />
      </div>
    );
  }

  if (requests.length === 0 && !isLoading) {
    return (
      <Card className='px-5 max-w-[700px] mx-auto'>
        <CardHeader>
          <CardTitle>Start a search</CardTitle>
          <CardDescription>
            Find the best planting and harvesting times for your crops
          </CardDescription>
        </CardHeader>
        <SearchForm
          onSearch={() => {
            setIsLoading(true);
            fetchRequests();
          }}
        />
      </Card>
    );
  }

  return (
    <div>
      <div className='flex justify-between'>
        <DashboardTitle
          requests={requests}
          fetchCrop={fetchCrop}
          selectedCrop={selectedCrop}
        />
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
          <DialogContent className='max-w-[700px]'>
            <DialogTitle>New Search</DialogTitle>
            <SearchForm
              onSearch={() => {
                setNewSearch(false);
                setIsLoading(true);
                fetchRequests();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className='max-w-[100%]'>
        {isLoadingCalendar ? (
          <CalendarSkeleton loadingMessage={loadingMessage} />
        ) : (
          <StatusCalendar
            list={selectedCrop.calendar ?? {}}
            onDaySelect={(date) => {
              const month = date
                .toLocaleDateString("pt-BR", { month: "long" })
                // .toLocaleDateString("en-US", { month: "long" })
                .toLowerCase();
              const info = selectedCrop.calendar[
                month as keyof typeof selectedCrop
              ]?.find((item) => {
                const itemDate = new Date(formatDate(item.date));
                return itemDate.toDateString() === date.toDateString();
              });
              setSelectedDate(info ?? null);
            }}
            activeStartDate={new Date(selectedCrop.date_range?.start_date)}
          />
        )}
        {selectedDate && !isLoadingCalendar && (
          <DetailsCard selectedDate={selectedDate} />
        )}
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
