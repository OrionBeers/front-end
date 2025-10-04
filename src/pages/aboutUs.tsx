import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import DevelopersInfo from "@/lib/developers.info";
import { Github, Linkedin } from "lucide-react";

const AboutUs = () => {
  return (
    <div className='flex justify-center flex-wrap gap-2'>
      {DevelopersInfo.sort((a, b) => (b.name < a.name ? 1 : -1)).map((it) => (
        <Card
          key={it.name}
          className='flex-row items-center justify-between p-4 w-[350px] min-h-[160px]'
        >
          <Avatar className='size-20'>
            <AvatarImage
              src={it.image}
              alt={it.name}
              className='object-cover'
            />
          </Avatar>
          <CardContent className='px-2 flex flex-col gap-2 w-[80%]'>
            <CardTitle>
              {it.name} {it.country}
            </CardTitle>
            <CardDescription className='text-xs'>
              {it.description}
            </CardDescription>
            <CardDescription className='flex gap-2 items-center'>
              <Button variant='ghost' size='link' asChild>
                <a href={it.linkedIn}>
                  <Linkedin />
                </a>
              </Button>
              <Button variant='ghost' asChild size='link'>
                <a href={it.github}>
                  <Github />
                </a>
              </Button>
              {it.portfolio && (
                <Button variant='link' size='link' asChild>
                  <a href={it.portfolio}>Portfolio</a>
                </Button>
              )}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AboutUs;
