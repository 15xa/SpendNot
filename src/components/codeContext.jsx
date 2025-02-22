import { createContext, useContext, useState } from "react";

const CodeDataContext = createContext();
const ScanningContext = createContext();
const ErrorContext = createContext();
const UsersignContext = createContext();

export const UsersignProvider = ({children}) => {
    const [UsersignedIn, setUsersignedIn] = useState(false);

    return(
        <UsersignContext.Provider value={{UsersignedIn, setUsersignedIn}}>
            {children}
        </UsersignContext.Provider>
    )
};

export const ScanningProvider = ({ children }) => {
    const [scanning, setScanning] = useState(false);

    return (
        <ScanningContext.Provider value={{ scanning, setScanning }}>
            {children}
        </ScanningContext.Provider>
    );
};

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState("");

    return (
        <ErrorContext.Provider value={{ error, setError }}>
            {children}
        </ErrorContext.Provider>
    );
};

export const CodeDataProvider = ({ children }) => {
    const [scanResult, setScanResult] = useState("");

    return (
        <CodeDataContext.Provider value={{ scanResult, setScanResult }}>
            {children}
        </CodeDataContext.Provider>
    );
};

export const useScanning = () => useContext(ScanningContext);
export const useError = () => useContext(ErrorContext);
export const useCodeData = () => useContext(CodeDataContext);
export const useUserSign = () => useContext(UsersignContext)