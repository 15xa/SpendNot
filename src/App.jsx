import QRScanner from "./components/qrscan";
import Auth from "./components/signin";
import { useUserSign, UsersignProvider } from "./components/codeContext";
import { ScanningProvider, ErrorProvider, CodeDataProvider } from "./components/codeContext";
import ModifyMenu from "./components/cat-limit";
import { useState } from "react";

export const handleLogout = () => {
  localStorage.removeItem("token");
  alert("Session expired. Please log in again.");
  window.location.href = "/spendnot/";
};

const AppContent = () => {
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const { UsersignedIn } = useUserSign();

  return (
    <>
      {isModifyOpen ? (
        <ModifyMenu close={() => setIsModifyOpen(false)} />
      ) : UsersignedIn ? (
        <QRScanner openModify={() => setIsModifyOpen(true)} />
      ) : (
        <Auth />
      )}
    </>
  );
};

function App() {
  return (
    <UsersignProvider>
      <ErrorProvider>
        <CodeDataProvider>
          <ScanningProvider>
            <div className="min-h-screen bg-gray-100">
              <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-2 flex justify-end">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              </nav>
              <AppContent />
            </div>
          </ScanningProvider>
        </CodeDataProvider>
      </ErrorProvider>
    </UsersignProvider>
  );
}

export default App;