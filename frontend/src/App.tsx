import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  useEffect(() => {
    document.title = "TestFlyQA - Quality Assurance Platform";
  }, []);

  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;