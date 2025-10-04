import Header from "./components/layout/header";
import Footer from "./components/layout/footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <h1>Hi</h1>
      </main>
      <Footer />
    </div>
  );
}

export default App;
