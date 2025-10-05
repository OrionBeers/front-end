import { capitalize, formatDate } from "@/lib/formatData";
import type { CalendarData } from "@/types/dashboard";
import { XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const MetricUnit = {
  moisture: "%",
  temperature: "°C",
  precipitation: "mm",
} as const;

const DetailsCard = ({
  selectedDate,
  onClose,
}: {
  selectedDate: CalendarData;
  onClose: () => void;
}) => {
  return (
    <Card className='w-fit min-w-[300px] mx-auto mt-10'>
      <CardHeader className='relative'>
        <CardTitle className='flex flex-col gap-4'>
          Environmental predictions for{" "}
          <span>
            {new Date(formatDate(selectedDate.date)).toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}
          </span>
        </CardTitle>
        <Button
          variant='ghost'
          size='icon'
          className='absolute -top-5 right-0'
          onClick={onClose}
        >
          <XIcon className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </Button>
      </CardHeader>
      <CardContent>
        {Object.entries(selectedDate.prediction_data).map(([metric, value]) => (
          <p key={metric}>
            <strong>{capitalize(metric)}: </strong>
            {metric === "moisture" ? (value * 100).toFixed(1) : value}
            {MetricUnit[metric as keyof typeof MetricUnit]}
          </p>
        ))}
      </CardContent>
    </Card>
  );
};

export default DetailsCard;
