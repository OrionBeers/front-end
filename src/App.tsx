import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import LocationPickerDialog from "./components/map/LocationPickerDialog";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-8">
        {/* TODO: delete when we finish the development */}
        <LocationPickerDialog 
          onLocationSelect={(location) => {
            console.log("Selected location:", location);
          }}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
