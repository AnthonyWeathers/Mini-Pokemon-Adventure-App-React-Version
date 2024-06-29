// Battle.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Battle = () => {
  const [pokemon, setPokemon] = useState(null);
  const [pic, setPic] = useState('');
  const [shiny, setShiny] = useState('');

  const [message, setMessage] = useState('');
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [encounterMessage, setEncounterMessage] = useState('');

  const hasFetchedPokemon = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (hasFetchedPokemon.current) return;
    hasFetchedPokemon.current = true;

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching random Pokémon...');
    }
    fetch('http://localhost:8000/pokemon/random')
      .then((response) => response.json())
      .then((data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Random Pokémon fetched:', data);
        }
        setPokemon(data.pokemon);
        setPic(data.pic);
        setShiny(data.shiny);
        setEncounterMessage('A wild ' + data.pokemon.name + ' has appeared!')
      })
      .catch((error) => console.error('Error fetching random Pokémon:', error));
  }, []);

  const handleCapture = (e) => {
    e.preventDefault();
    if (process.env.NODE_ENV === 'development') {
      console.log('Capturing Pokémon...');
    }
    fetch(`http://localhost:8000/pokemon/capture/${pokemon.id}/${shiny}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Capture response:', data);
        }
        if (data.catch) {
          setPic(data.pokeball_url);
          setMessage(data.message);
          setShowReturnButton(true);
          setEncounterMessage('');
        } else {
          setEncounterMessage('Drat, ' + data.pokemon_name + ' avoided the pokeball!');
        }
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Battle component render', { pokemon, message, showReturnButton });
  }

  if (!pokemon) {
    return <div>Loading...</div>;
  }


  return (
    <section className="battle-page">
      <section>
        <img className="pokemon-image" src={pic} alt={`${pokemon.name} sprite`} />
      </section>

      <p id="encounter">{encounterMessage}</p>

      {!showReturnButton && (
        <div id="battle">
          {/* Buttons for battle options */}
          <button
            className="button-style capture"
            onClick={handleCapture}
          >
            Capture
          </button>
          <button className="button-style" onClick={() => navigate('/main')}>
            Flee
          </button>
        </div>
      )}

        {message && <p className='caught'>{message}</p>}
        {showReturnButton && (
            <button className="button-style" onClick={() => navigate("/main")}>
              Return
            </button>
          
        )}
    </section>
  );
};

export default Battle;