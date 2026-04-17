import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StarterSelection from "./pages/StarterSelection";
import Game from "./pages/Game";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select" element={<StarterSelection />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
