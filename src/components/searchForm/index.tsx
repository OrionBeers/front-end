import api from "@/lib/api.axios";
import { useAuth } from "@/lib/auth.provider";
import type { SearchSchema } from "@/lib/search.schema";
import searchSchema from "@/lib/search.schema";
import type { Location } from "@/types/location";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
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
  fetchLocations,
}: {
  onSearch?: (requestId?: string) => void;
  fetchLocations: () => Promise<Location[] | undefined>;
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

  useEffect(() => {
    fetchLocations()
      .then((data) => {
        if (data) setLocations(data);
      })
      .catch(() => {
        setLocations([]);
      });
  }, []);

  const onSubmit = async (data: SearchSchema) => {
    const body = {
      id_user: user._id,
      latitude:
        locations
          .find((loc) => loc._id === data.location)
          ?.latitude?.toString() || "0",
      longitude:
        locations
          .find((loc) => loc._id === data.location)
          ?.longitude?.toString() || "0",
      crop_type: data.crop,
      start_month: data.month,
    };
    const { data: result } = await api.post("/prediction", body);
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
                    {locations.length === 0 ? (
                      <p className='p-4 text-sm text-center'>
                        You don&apos;t have any farm registered yet.
                        <br />
                        <Button
                          variant='link'
                          size='link'
                          onClick={() => setOpenLocation(true)}
                        >
                          Start now!
                        </Button>
                      </p>
                    ) : (
                      locations.map((loc) => (
                        <SelectItem key={loc._id} value={loc._id}>
                          {loc.display_name}
                        </SelectItem>
                      ))
                    )}
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
