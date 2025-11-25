import { StacApiProvider } from 'stac-react';
import Header from './layout/Header';
import Main from './pages/Main';

function App() {
  const apiUrl = process.env.REACT_APP_STAC_API;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <StacApiProvider apiUrl={apiUrl} enableDevTools={isDevelopment}>
      <div className="App grid grid-rows-[min-content_1fr]">
        <Header />
        <main className="flex items-stretch">
          <Main />
        </main>
      </div>
    </StacApiProvider>
  );
}

export default App;
