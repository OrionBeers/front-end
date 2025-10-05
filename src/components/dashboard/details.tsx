import { capitalize, formatDate } from "@/lib/formatData";
import type { CalendarData } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const MetricUnit = {
  moisture: "%",
  temperature: "°C",
  precipitation: "mm",
} as const;

const DetailsCard = ({ selectedDate }: { selectedDate: CalendarData }) => {
  return (
    <Card className='w-fit min-w-[300px] mx-auto mt-10'>
      <CardHeader>
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
