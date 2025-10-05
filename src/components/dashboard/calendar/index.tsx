import { formatDate } from "@/lib/formatData";
import { cn } from "@/lib/utils";
import type { DashboardRequestDetails } from "@/types/dashboard";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Calendar from "react-calendar";

const StatusCalendar = ({
  list,
  onDaySelect,
  activeStartDate
}: {
  list: DashboardRequestDetails["calendar"];
  onDaySelect?: (date: Date) => void;
  activeStartDate: Date
}) => {
  const getStatusForDay = (
    date: Date
  ): "green" | "yellow" | "red" | undefined => {
    if (!list) {
      return undefined;
    }

    // Get month name (e.g., "january", "february")
    const monthName = date
      .toLocaleDateString("pt-BR", { month: "long" })
      // .toLocaleDateString("en-US", { month: "long" })
      .toLowerCase();
    const monthData = list[monthName as keyof typeof list];

    if (!monthData) return undefined;

    const dayData = monthData.find((item) => {
      const itemDate = new Date(formatDate(item.date));
      return itemDate.toDateString() === date.toDateString();
    });

    if (!dayData) {
      return undefined;
    }

    // Convert numeric status (0-1) to color status
    if (dayData.status >= 0.7) return "green";
    if (dayData.status >= 0.4) return "yellow";
    return "red";
  };

  return (
    <Calendar
      tileClassName={({ date }) => {
        const status = getStatusForDay(date);
        if (status) {
          return `status ${status}`;
        }
        return undefined;
      }}
      minDate={new Date()}
      className={cn(
        "mx-auto w-[500px] max-w-[100%] mt-10 border border-border rounded-lg overflow-hidden"
      )}
      onClickDay={onDaySelect}
      prevLabel={<ChevronLeft />}
      nextLabel={<ChevronRight />}
      prev2Label={<ChevronsLeft />}
      next2Label={<ChevronsRight />}
      defaultActiveStartDate={activeStartDate}
    />
  );
};

export default StatusCalendar;
