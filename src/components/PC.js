// // PC.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PC = ({ onPokeSelect }) => {
  const [pokemons, setPokemons] = useState([]);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    fetchPokemons();
  }, []);

  const fetchPokemons = (type = '') => {
    let url = 'http://localhost:8000/pc';
    if (type) {
      url += `?type=${type}`;
    }

    fetch(url, {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setPokemons(data);
      })
      .catch(error => console.error('Error fetching Pokémon data:', error));
  };

  // When a the filter's value is changed, ex. to fire, then this sets the filter variable and refetches list of pokemon
  // based on what the filter is
  const handleFilterChange = (event) => {
    const selectedType = event.target.value;
    setFilter(selectedType);
    fetchPokemons(selectedType === 'all' ? '' : selectedType);
  };

  // displays Details below the pokemon user has clicked
  const toggleMenu = (index) => {
    const newPokemons = [...pokemons];
    newPokemons[index].menuVisible = !newPokemons[index].menuVisible;
    setPokemons(newPokemons);
  };

  const goToDetails = (id) => {
    onPokeSelect(id);
    navigate(`/PokeDetails`);
  };

  return (
    <div>
      <button className="button-style" onClick={() => navigate('/main')}>Exit PC</button>
      <br />
      <br />
      <div>
        <label htmlFor="type-filter">Filter by Type:</label>
        <select id="type-filter" value={filter} onChange={handleFilterChange}>
          <option value=""></option>
          <option value="all">All</option>
          <option value="fire">Fire</option>
          <option value="water">Water</option>
          <option value="grass">Grass</option>
          <option value="normal">Normal</option>
          <option value="flying">Flying</option>
          <option value="fighting">Fighting</option>
          <option value="poison">Poison</option>
          <option value="ground">Ground</option>
          <option value="rock">Rock</option>
          <option value="bug">Bug</option>
          <option value="ghost">Ghost</option>
          <option value="steel">Steel</option>
          <option value="electric">Electric</option>
          <option value="psychic">Psychic</option>
          <option value="ice">Ice</option>
          <option value="dragon">Dragon</option>
          <option value="dark">Dark</option>
          <option value="fairy">Fairy</option>
          <option value="stellar">Stellar</option>
        </select>
      </div>
      <br />
      <div>
        <ul id="pc">
          {pokemons.map((pokemon, index) => (
            <li key={pokemon.id} className="hidden-bullets">
              <div className="pokemon-container" onClick={() => toggleMenu(index)}>
                <img className="pc-pokemon-image" src={pokemon.sprite} alt="Pokemon" />
                <div className={`menu ${pokemon.menuVisible ? '' : 'hidden'}`}>
                  <button className="button-style" onClick={() => goToDetails(pokemon.id)}>Details</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PC;