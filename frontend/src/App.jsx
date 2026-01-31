import AppRouter from "./routes/AppRouter";
import { ClassroomProvider } from "./context/ClassroomContext";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider } from "./auth/AuthContext";

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
