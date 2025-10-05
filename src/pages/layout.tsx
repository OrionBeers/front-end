import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Outlet } from "react-router";

const Layout = () => {
  return (
    <div className="min-h-full bg-[url('/src/assets/background.png')] bg-cover bg-center bg-no-repeat">
      <Header />
      <div className='h-[79vh] overflow-y-scroll'>
        <div className=' py-4 px-2 container mx-auto'>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
