import { cn } from "@/lib/utils";
import Calendar from "react-calendar";

const StatusCalendar = ({
  list,
  onDaySelect
}: {
  list: {
    [key: string]: {
      date: Date;
      status: number; // 0 to 1
    }[];
  };
  onDaySelect?: (date: Date) => void;
}) => {
  const getStatusForDay = (
    date: Date
  ): "green" | "yellow" | "red" | undefined => {
    if (!list) {
      return undefined;
    }

    // Get month name (e.g., "january", "february")
    const monthName = date
      .toLocaleDateString("en-US", { month: "long" })
      .toLowerCase();
    const monthData = list[monthName as keyof typeof list];

    if (!monthData) return undefined;

    const dayData = monthData.find((item) => {
      const itemDate = new Date(item.date);
      const match = itemDate.toDateString() === date.toDateString();
      return match;
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
          console.log(status);
          return `status ${status}`;
        }
        return undefined;
      }}
      minDate={new Date()}
      className={cn(
        "mx-auto w-fit max-w-[500px] mt-10 border border-border rounded-lg overflow-hidden",
      )}
      onClickDay={onDaySelect}
    />
  );
};

export default StatusCalendar;
