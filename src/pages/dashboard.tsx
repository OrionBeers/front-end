/* eslint-disable react-hooks/exhaustive-deps */
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
import { useIsMobile } from "@/hooks/use-mobile";
import api from "@/lib/api.axios";
import { useAuth } from "@/lib/auth.provider";
import { formatDate } from "@/lib/formatData";
// import { listenToHistory } from "@/lib/realtimeDatabase";
import type {
  CalendarData,
  DashboardRequestDetails,
  DashboardRequests,
} from "@/types/dashboard";
import { AnimatePresence, motion } from "framer-motion";
import { Loader, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [requests, setRequests] = useState<DashboardRequests[]>([]);
  const [newSearch, setNewSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<DashboardRequestDetails>(
    {} as DashboardRequestDetails
  );
  const [selectedDate, setSelectedDate] = useState<CalendarData | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingMessage, _setLoadingMessage] = useState("Search started...");

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

  const fetchLocations = async () => {
    const { data } = await api.get(`/locations?id_user=${user._id}`);
    console.log("Fetched locations:", data);
    if (!data.length) {
      setShowOnboarding(true);
      return;
    }
    return data;
  };

  useEffect(() => {
    fetchRequests();
    fetchLocations();
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
          fetchLocations={fetchLocations}
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
              fetchLocations={fetchLocations}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className='max-w-[100%] flex flex-wrap items-center justify-center gap-5 transition-all'>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={"calendar-card"}
            className='w-full md:w-auto'
            initial={{ x: -20 }}
            animate={{
              x: !isMobile && selectedDate && !isLoadingCalendar ? -50 : 0,
            }}
            exit={{ x: -20 }}
            transition={{ duration: 0.6 }}
            style={{
              zIndex:1
            }}
          >
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
          </motion.div>

          {selectedDate && !isLoadingCalendar && (
            // slide from the middle to the right on desktop and from middle to the bottom on mobile
            <motion.div
              key={"details-card"}
              exit={{
                opacity: 0,
                x: isMobile ? 0 : -20,
                y: isMobile ? -20 : 0,
              }}
              initial={{
                opacity: 0,
                x: isMobile ? 0 : -20,
                y: isMobile ? -20 : 0,
              }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                zIndex: 0
              }}
            >
              <DetailsCard selectedDate={selectedDate} onClose={() => setSelectedDate(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <LocationPickerDialog
        open={showOnboarding}
        setOpen={setShowOnboarding}
      />
    </div>
  );
};

export default Dashboard;
