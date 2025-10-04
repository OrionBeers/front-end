import Footer from "./components/layout/footer";
import Header from "./components/layout/header";

function App() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex-1 p-8'></main>
      <Footer />
    </div>
  );
}

export default App;
