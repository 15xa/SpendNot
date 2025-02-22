import QRScanner from './components/qrscan';
import { ScanningProvider, ErrorProvider, CodeDataProvider } from './components/codeContext';

function App() {
  return (
    <ScanningProvider>
      <CodeDataProvider>
        <ErrorProvider>
          <QRScanner />
        </ErrorProvider>
      </CodeDataProvider>
    </ScanningProvider>
  );
}

export default App;
