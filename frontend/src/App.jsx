import AppRouter from "./routes/AppRouter";
import { ClassroomProvider } from "./context/ClassroomProvider";
import { ToastProvider } from "./components/ui/Toast";
import {AuthProvider} from "./auth/AuthProvider";

function App() {
  return (
    <ClassroomProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </ClassroomProvider>
  );
}

export default App;
