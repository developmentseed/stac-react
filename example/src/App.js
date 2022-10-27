import Header from "./layout/Header";
import Main from "./pages/Main";

function App() {
  return (
    <div className="App h-screen grid grid-rows-[min-content_1fr]">
      <Header />
      <main className="flex items-stretch">
        <Main />
      </main>
    </div>
  );
}

export default App;
