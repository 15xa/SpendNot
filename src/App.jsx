import QRScanner from "./components/qrscan";
import Auth from "./components/signin";
import { useUserSign, UsersignProvider } from "./components/codeContext";
import { ScanningProvider, ErrorProvider, CodeDataProvider } from "./components/codeContext";

const AppContent = () => {
  const { UsersignedIn } = useUserSign();
  return UsersignedIn ? <QRScanner /> : <Auth />;
};

function App() {
  return (
    <ScanningProvider>
      <CodeDataProvider>
        <ErrorProvider>
          <UsersignProvider>
            <AppContent />
          </UsersignProvider>
        </ErrorProvider>
      </CodeDataProvider>
    </ScanningProvider>
  );
}

export default App;
