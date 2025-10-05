interface DashboardRequests {
  _id: string;
  id_user: string;
  crop: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
}

export type { DashboardRequests };
