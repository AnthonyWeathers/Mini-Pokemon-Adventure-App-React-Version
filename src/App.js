// src/App.js
import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Main from './components/Main';
import Guess from './components/Guess';
import PC from './components/PC';
import Battle from './components/Battle';
import PokeDetails from './components/PokeDetails';

function App() {
    const [pokemonID, setPokemonID] = useState(null);

    const handlePokemonSelect = (selectedPokemon) => {
      setPokemonID(selectedPokemon);
    };

    return (
      <div className='container'>
        <div className='block-container'>
          <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Login />} />
                <Route path="/main" element={<Main />} />
                <Route path="/guess" element={<Guess />} />
                <Route path="/PC" element={<PC onPokeSelect={handlePokemonSelect} />} />
                <Route path="/battle" element={<Battle />} />
                <Route path="/PokeDetails" element={<PokeDetails pokemonID={pokemonID} />} />
              </Routes>
          </Router>
        </div>
      </div>
      );
}

export default App;