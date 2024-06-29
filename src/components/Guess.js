// Guess.js
import React, { useState, useEffect, useRef } from 'react';

const Guess = ({  }) => {
  const [guess, setGuess] = useState('');

  const [guesses, setGuesses] = useState(3);
  const [pokemon, setPokemon] = useState(null);
  const [pic, setPic] = useState(null);
  const [message, setMessage] = useState('');
  const [correct, setCorrect] = useState(false);

  const hasFetchedPokemon = useRef(false);

  useEffect(() => {
    if (hasFetchedPokemon.current) return;
    hasFetchedPokemon.current = true;
    
    fetch('http://localhost:8000/guess', {
      method: 'GET',
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setGuesses(data.guesses)
        setPic(data.pic)
        setPokemon(data.pokemon)
      } else {
        alert(data.message)
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }, []);

  const handleGuess = e => {
    e.preventDefault();
    fetch(`http://localhost:8000/api/guess/${pokemon.name}`, { // Adjust URL if necessary
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess, guesses }),
    })
      .then((res) => res.json())
      .then((data) => {
        if(data.correct) {
          document.querySelector('.pokemon-image').style.filter = 'none';
          setMessage(`That's right! It's... ${data.pokemon_name}!!`);
          setCorrect(true);
        } else if (guesses > 1) {
          setGuesses(data.guesses);
          setMessage("Sorry, that's incorrect. Try again.");
        } else {
          document.querySelector('.pokemon-image').style.filter = 'none';
          setMessage(`Sorry, out of attempts... It's ${data.pokemon_name}.`);
          setCorrect(true);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  if (!pokemon) {
    return <div>Loading...</div>;
  }

  return (
    <section>
      <a href="/main" className="top-left button-style">
        Quit Game
      </a>
      <section className="battle-page">
        <section>
          {/* <!-- pokemon sprite here --> */}
          <img className="pokemon-image gray" src={pic} />
        </section>

        {!message &&
          <div id="encounter">
            Guess that pokemon!!
            <div className="guess-attempts">
              <p className="text">You have </p> 
              <p id="num-guesses"> {guesses} </p> 
              <p className="text"> guesses left</p>
            </div>
          </div>
        }

        <form id="guess-form" onSubmit={handleGuess}>
          <label htmlFor="pokemon-guess"> Name: </label>
          <input 
            type="text" 
            id="pokemon-guess" 
            name="guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            required
          />
          <button type="submit" id="guess-submit" className="button-style">Guess</button>
        </form>
        {message && <p className='message'>{message}</p>}
        {correct && (
          <div id="play-again">
            <a href="/guess" id="play" className="button-style">Play Again?</a>
          </div>
        )}
      </section>
    </section>
  );
};

export default Guess;