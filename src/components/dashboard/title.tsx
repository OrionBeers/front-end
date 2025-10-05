import { capitalize } from "@/lib/formatData";
import type {
  DashboardRequestDetails,
  DashboardRequests,
} from "@/types/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const DashboardTitle = ({
  requests,
  fetchCrop,
  selectedCrop,
}: {
  requests: DashboardRequests[];
  fetchCrop: (history_id: string) => Promise<void>;
  selectedCrop: DashboardRequestDetails;
}) => {
  return (
    <div className='grow'>
      {requests.length ? (
        <div className='flex items-center gap-2 grow'>
          <Select
            onValueChange={async (value) => {
              await fetchCrop(value);
            }}
            defaultValue={selectedCrop._id}
          >
            <SelectTrigger className='w-fit font-bold text-foreground'>
              <SelectValue placeholder='Select a crop' />
            </SelectTrigger>
            <SelectContent>
              {requests.map((r) => (
                <SelectItem key={r._id} value={r._id}>
                  {capitalize(r.crop)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-sm font-medium text-foreground'>
            From {selectedCrop.date_range?.start_date} to{" "}
            {selectedCrop.date_range?.end_date}
          </p>
        </div>
      ) : (
        "No requests found"
      )}
    </div>
  );
};

export default DashboardTitle;
