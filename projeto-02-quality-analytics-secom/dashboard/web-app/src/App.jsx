import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import VisaoGeral from './pages/VisaoGeral';
import AnaliseSensores from './pages/AnaliseSensores';
import DiagnosticoModelo from './pages/DiagnosticoModelo';
import DicionarioDados from './pages/DicionarioDados';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<VisaoGeral />} />
        <Route path="/sensores" element={<AnaliseSensores />} />
        <Route path="/diagnostico" element={<DiagnosticoModelo />} />
        <Route path="/dicionario" element={<DicionarioDados />} />
      </Routes>

      <footer className="app-footer">
        SECOM Quality Analytics · Análise de sensores e previsão de falhas ·
        Dashboard by Ivan
      </footer>
    </BrowserRouter>
  );
}

export default App;
