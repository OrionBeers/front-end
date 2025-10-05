import api from "@/lib/api.axios";
import { useAuth } from "@/lib/auth.provider";
import type { SearchSchema } from "@/lib/search.schema";
import searchSchema from "@/lib/search.schema";
import type { Location } from "@/types/location";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import LocationPickerDialog from "../map/LocationPickerDialog";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const months = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
];

const SearchForm = ({
  onSearch,
}: {
  onSearch?: (requestId?: string) => void;
}) => {
  const [openLocation, setOpenLocation] = useState(false);
  const [locations, setLocations] = useState([] as Location[]);
  const { user } = useAuth();

  const form = useForm<SearchSchema>({
    defaultValues: {
      crop: "",
      location: "farm1",
      month: "january",
    },
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = async (data: SearchSchema) => {
    const body = {
      id_user: user._id,
      latitude:
        locations
          .find((loc) => loc.displayName === data.location)
          ?.lat?.toString() || "0",
      longitude:
        locations
          .find((loc) => loc.displayName === data.location)
          ?.lng?.toString() || "0",
      crop_type: data.crop,
      start_month: data.month,
    };
    const { data: result } = await api.post("/publish", body);
    console.log("Search result:", result);
    onSearch?.(result.id_request);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
        <FormField
          control={form.control}
          name='crop'
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor='crop'>Crop</FormLabel>
              <FormControl>
                <Input id='crop' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='location'
          render={({ field }) => (
            <div className='flex items-end w-full'>
              <FormItem className='grow'>
                <FormLabel>Farm</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Choose your farm' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='farm1'>Farm 1</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
              <Button
                className='rounded-full ml-2'
                type='button'
                onClick={() => setOpenLocation(true)}
              >
                <Plus />
              </Button>
              <LocationPickerDialog
                open={openLocation}
                setOpen={setOpenLocation}
                onLocationSelect={(location) => {
                  console.log(location);
                }}
              />
            </div>
          )}
        />
        <FormField
          control={form.control}
          name='month'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start month</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Choose month' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type='submit' className='w-full'>
          Search
        </Button>
      </form>
    </Form>
  );
};

export default SearchForm;
