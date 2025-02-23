import QRScanner from "./components/qrscan";
import Auth from "./components/signin";
import { useUserSign, UsersignProvider } from "./components/codeContext";
import { ScanningProvider, ErrorProvider, CodeDataProvider } from "./components/codeContext";
import ModifyMenu from "./components/cat-limit";
import { useState } from "react";
export const handleLogout = () => {
  localStorage.removeItem("token");
  alert("Session expired. Please log in again.");
  window.location.href = "/login";
};

const AppContent = () => {
  const [isModifyOpen, setIsModifyOpen] = useState(false);

  const { UsersignedIn } = useUserSign();
  return (<>
 

  <div>
  <div>
      {isModifyOpen ? (
        <ModifyMenu closeModify={() => setIsModifyOpen(false)} />
      ) : UsersignedIn ? (
        <QRScanner openModify={() => setIsModifyOpen(true)} />
      ) : (
        <Auth />
      )}
    </div>
  </div>
  
    </>
    )
};

function App() {
  return (
    <ScanningProvider>
      <CodeDataProvider>
        <ErrorProvider>
          <UsersignProvider>
            <AppContent />
            <div className="flex justify-center items-center m-20">
            <button onClick={handleLogout} className="bg-blue-300 rounded-xl p-4 m-20">Logout</button>
            </div>
          </UsersignProvider>
        </ErrorProvider>
      </CodeDataProvider>
    </ScanningProvider>
  );
}

export default App;
