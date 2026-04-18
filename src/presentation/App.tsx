import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomeScreen from "./screens/HomeScreen";
import StarterSelectionScreen from "./screens/StarterSelectionScreen";
import GameScreen from "./screens/GameScreen";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/select" element={<StarterSelectionScreen />} />
        <Route path="/game" element={<GameScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
