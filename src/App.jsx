import QRScanner from "./components/qrscan";
import Auth from "./components/signin";
import Analytics from "./components/analytics";
import { useUserSign, UsersignProvider } from "./components/codeContext";
import { ScanningProvider, ErrorProvider, CodeDataProvider } from "./components/codeContext";
import ModifyMenu from "./components/cat-limit";
import { useState } from "react";

export const handleLogout = () => {
  localStorage.removeItem("token");
  alert("Session expired. Please log in again.");
  window.location.href = "/spendnot/";
};

function App() {
  const [isModifyOpen, setModifyOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const AppContent = () => {
    const { UsersignedIn } = useUserSign();
    
    return (
      <>
        {isModifyOpen ? (
          <>
            <div className="fixed top-4 right-4 flex gap-2">
              <button 
                className="bg-green-400 px-4 py-2 rounded-lg hover:bg-green-500 text-white"
                onClick={() => setModifyOpen(true)}
              >
                Limits
              </button>
              <button 
                className="bg-red-400 px-4 py-2 rounded-lg hover:bg-red-500 text-white"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
            <ModifyMenu close={() => setModifyOpen(false)} />
          </>
        ) : UsersignedIn ? (
          <>
            <div className="fixed top-4 right-4 flex gap-2">
              <button 
                className="bg-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500 text-white"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                {showAnalytics ? "Scan QR" : "Analytics"}
              </button>
              <button 
                className="bg-green-400 px-4 py-2 rounded-lg hover:bg-green-500 text-white"
                onClick={() => setModifyOpen(true)}
              >
                Limits
              </button>
              <button 
                className="bg-red-400 px-4 py-2 rounded-lg hover:bg-red-500 text-white"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
            {showAnalytics ? <Analytics /> : <QRScanner openModify={() => setModifyOpen(true)} />}
          </>
        ) : (
          <Auth />
        )}
      </>
    );
  };

  return (
    <UsersignProvider>
      <ErrorProvider>
        <CodeDataProvider>
          <ScanningProvider>
            <div className="flex flex-col gap-10">
              <div className="min-h-screen flex justify-center items-center">
                <AppContent />
              </div>
            </div>
          </ScanningProvider>
        </CodeDataProvider>
      </ErrorProvider>
    </UsersignProvider>
  );
}

export default App;