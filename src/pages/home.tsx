import { ModeToggle } from "@/components/themeProvider/mode-toggle";
import Login from "../components/Login";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-main">
      <ModeToggle />
      <Login />
    </div>
  );
};

export default HomePage;
