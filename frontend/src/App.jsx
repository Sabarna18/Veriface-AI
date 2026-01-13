import AppRouter from "./routes/AppRouter";
import { ClassroomProvider } from "./context/ClassroomContext";
import { ToastProvider } from "./components/ui/Toast";

function App() {
  return (
    <ClassroomProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>

    </ClassroomProvider>
  );
}

export default App;
