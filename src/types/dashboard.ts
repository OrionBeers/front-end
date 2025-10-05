interface DashboardRequests {
  _id: string;
  id_user: string;
  crop: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

interface PredictionData {
  moisture: number;
  temperature: number;
  precipitation: number;
}

interface CalendarData {
  status: number;
  date: string;
  prediction_data: PredictionData;
}

interface DashboardRequestDetails extends DashboardRequests {
  calendar: {
    [date: string]: CalendarData[];
  };
}

export type { DashboardRequestDetails, DashboardRequests, CalendarData, PredictionData };
