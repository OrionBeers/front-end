import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-screen bg-[url('/src/assets/background.png')] bg-fixed bg-cover bg-center bg-no-repeat flex flex-col">
      <Header />
      <div className='flex-1 overflow-y-auto'>
        <div className=' py-4 px-2 container mx-auto'>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
