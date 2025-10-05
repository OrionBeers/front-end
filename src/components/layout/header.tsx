import { useAuth } from "@/lib/auth.provider";
import { cn } from "@/lib/utils";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { ModeToggle } from "../themeProvider/mode-toggle";
import orionFarmerLogo from "@/assets/orion-farmer-logo.svg";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  // TODO: Replace with actual navigation links
  const navigationLinks = [
    { href: "/about-us", label: "About us" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className='bg-[#2196F3] text-black py-4 px-2 sm:px-4 border-b sticky top-0 z-50 dark:bg-[#2196F3]/90 dark:text-white backdrop-blur'>
      <div className='container mx-auto flex items-center justify-between'>
        {/* Logo */}
        <NavLink to='/dashboard'>
          <div className="rounded p-2 flex items-center">
            <img
              src={orionFarmerLogo}
              alt="Orion Farmer Logo"
              className="h-20 w-20 lg:h-24 lg:w-24"
            />
          </div>
        </NavLink>

        {/* Right side: Desktop Navigation + Actions */}
        <div className='flex items-center gap-4 md:gap-6'>
          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-6 lg:gap-8'>
            {navigationLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive, isPending, isTransitioning }) =>
                  cn(
                    "text-base hover:opacity-80 transition-opacity",
                    isActive && "font-semibold underline underline-offset-4",
                    isPending && "opacity-70",
                    isTransitioning && "opacity-50"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className='flex items-center gap-2'>
            {/* Desktop Mode Toggle */}
            <div className='hidden md:block'>
              <ModeToggle />
            </div>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className='md:hidden'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='hover:bg-white/20 dark:hover:bg-white/10'
                >
                  <Menu className='size-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[240px] sm:w-[320px]'>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription className='sr-only'>
                    Navigate to different sections of the page
                  </SheetDescription>
                </SheetHeader>
                <nav className='flex flex-col gap-2'>
                  {navigationLinks.map((link) => (
                    <NavLink
                      key={link.href}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className={({ isActive, isPending, isTransitioning }) =>
                        cn(
                          "text-lg hover:opacity-80 transition-opacity py-2 px-2 rounded hover:bg-accent",
                          isActive &&
                            "font-semibold underline underline-offset-4",
                          isPending && "opacity-70",
                          isTransitioning && "opacity-50"
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>

                {/* Mobile Mode Toggle */}
                <SheetFooter className='border-t pt-4'>
                  <div className='flex items-center justify-between w-full'>
                    <Button
                      variant='ghost'
                      onClick={() => logout()}
                      className='w-fit'
                    >
                      <LogOut />
                      Log out
                    </Button>
                    <ModeToggle />
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
