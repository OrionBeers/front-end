import StatusCalendar from "@/components/calendar";
import CalendarSkeleton from "@/components/calendar/skelton";
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
import type { DashboardRequests } from "@/types/dashboard";
// import { listenToHistory } from "@/lib/realtimeDatabase";
import { Plus, User } from "lucide-react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth()
  const [processing, setProcessing] = useState(false);
  const [requests, setRequests] = useState<DashboardRequests[]>([]);
  const [newSearch, setNewSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState<{
    temperature: number;
    moisture: number;
    sunlight: number;
    rainfall: number;
    windSpeed: number;
    humidity: number;
  } | null>(null);
  
  const [loadingMessage, _setLoadingMessage] = useState("Search started...");

  useEffect(() => {
    // update logic to display if user doesn't have a location saved in the db
    setShowOnboarding(true);
    
    // TODO: Simulate calendar data loading
    const timer = setTimeout(() => {
      setIsLoadingCalendar(false);
    }, 2000); // 2 seconds loading simulation
    
    return () => clearTimeout(timer);
  }, []);

  const fetchRequests = async () => {
    const { data } = await api.get(`/dashboard?id_user=${user._id}`)
    setRequests(data || []);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchRequests();
  } ,[])

  // useEffect(() => {
  //   // NOTE: this is sample of real-time updates using Firebase Realtime Database
  //   console.log("Setting up real-time listener...");
  //   listenToHistory({
  //     idUser:"68e227d4b6b525ab5a1fbd24",
  //     idRequest:"68e248a29e37f1d9e4810f21",
  //     onUpdate: (data) => {
  //       console.log("Real-time data update:", data);
  //     },
  //   });
  // },[])

  if (requests.length !== 0 && !isLoading) {
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

  const list = {
    october: [
      {
        status: 0.1,
        date: new Date(2025, 9, 10),
        data: {
          temperature: 22,
          moisture: 0.8,
          sunlight: 6.5,
          rainfall: 120,
          windSpeed: 15,
          humidity: 75,
        },
      },
      {
        status: 0.5,
        date: new Date(2025, 9, 16),
        data: {
          temperature: 24,
          moisture: 0.6,
          sunlight: 7,
          rainfall: 100,
          windSpeed: 10,
          humidity: 70,
        },
      },
    ],
    november: [
      {
        status: 0.7,
        date: new Date(2025, 10, 5),
        data: {
          temperature: 20,
          moisture: 0.7,
          sunlight: 6,
          rainfall: 110,
          windSpeed: 12,
          humidity: 72,
        },
      },
      {
        status: 0.3,
        date: new Date(2025, 10, 12),
        data: {
          temperature: 18,
          moisture: 0.9,
          sunlight: 5.5,
          rainfall: 130,
          windSpeed: 18,
          humidity: 78,
        },
      },
      {
        status: 0.9,
        date: new Date(2025, 10, 25),
        data: {
          temperature: 21,
          moisture: 0.5,
          sunlight: 7.5,
          rainfall: 90,
          windSpeed: 8,
          humidity: 68,
        },
      },
    ],
    december: [
      {
        status: 0.4,
        date: new Date(2025, 11, 1),
        data: {
          temperature: 19,
          moisture: 0.85,
          sunlight: 5,
          rainfall: 125,
          windSpeed: 14,
          humidity: 74,
        },
      },
      {
        status: 0.6,
        date: new Date(2025, 11, 15),
        data: {
          temperature: 23,
          moisture: 0.65,
          sunlight: 6.8,
          rainfall: 105,
          windSpeed: 11,
          humidity: 69,
        },
      },
      {
        status: 0.2,
        date: new Date(2025, 11, 20),
        data: {
          temperature: 17,
          moisture: 0.95,
          sunlight: 4.5,
          rainfall: 135,
          windSpeed: 20,
          humidity: 80,
        },
      },
    ],
  };

  return (
    <div>
      <div className='flex justify-between'>
        <div>
          {requests.length ? `${requests.length} requests found` : "No requests found"}
        </div>
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
      <div className="max-w-[100%]">
        {isLoadingCalendar ? (
          <CalendarSkeleton loadingMessage={loadingMessage} />
        ) : (
          <StatusCalendar
            list={list}
            onDaySelect={(date) => {
              const month = date
                .toLocaleDateString("en-US", { month: "long" })
                .toLowerCase();
              const info = list[month as keyof typeof list]?.find(
                (d) => d.date.toDateString() === date.toDateString()
              );
              setSelectedDate(info ? info.data : null);
            }}
          />
        )}
      {selectedDate && !isLoadingCalendar && (
        <Card className='max-w-md mx-auto mt-10'>
          <CardHeader>
            <CardTitle>
              Environmental Data for{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </CardTitle>
          </CardHeader>
          <div className='grid grid-cols-2 gap-4 p-4'>
            <div>
              <strong>Temperature:</strong> {selectedDate.temperature}°C 
            </div>
            <div>
              <strong>Moisture:</strong> {selectedDate.moisture * 100}%
            </div>
            <div>
              <strong>Sunlight:</strong> {selectedDate.sunlight} hours
            </div>
            <div>
              <strong>Rainfall:</strong> {selectedDate.rainfall} mm
            </div>
            <div>
              <strong>Wind Speed:</strong> {selectedDate.windSpeed} km/h
            </div>
            <div>
              <strong>Humidity:</strong> {selectedDate.humidity}%
            </div>
          </div>
        </Card>
      )}</div> */}
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
