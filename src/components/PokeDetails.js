// PokeDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PokeDetails = ({ pokemonID }) => {
  const { pokeId } = useParams();
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if(pokemonID) {
      fetch(`http://localhost:8000/pc/${pokemonID}`, {
      method: 'GET',
      credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        // Ensure default values for move properties
        const moves = ['move_1', 'move_2', 'move_3', 'move_4'];
        moves.forEach(moveKey => {
          if (data[moveKey]) {
            data[moveKey].pp = data[moveKey].pp || 'N/A';
            data[moveKey].power = data[moveKey].power || 'N/A';
            data[moveKey].accuracy = data[moveKey].accuracy || 'N/A';
          }
        });
        setPokemonDetails(data)
      })
      .catch(error => console.error('Error fetching Pokémon details:', error));
    }
  }, [pokemonID]);

  const handleRename = (e) => {
    e.preventDefault();
    fetch(`http://localhost:8000/api/update_name/${pokemonID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ new_name: newName }),
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        setPokemonDetails(prevDetails => ({
          ...prevDetails,
          owned_poke: { ...prevDetails.owned_poke, name: newName }
        }));
      } else {
        alert('Failed to update name');
      }
    })
    .catch((error) => {
      console.error('Error updating name:', error);
    });
  };

  const handleRelease = () => {
    fetch(`http://localhost:8000/api/delete/${pokemonID}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        navigate('/PC');
      } else {
        alert('Failed to release Pokémon');
      }
    })
    .catch((error) => {
      console.error('Error releasing Pokémon:', error);
    });
  };

  if (!pokemonDetails) return <div>Loading...</div>;

  const { owned_poke, poketype1, poketype2, move_1, move_2, move_3, move_4 } = pokemonDetails;

  return (
    <div className="pokemon-details">
      <div className="top-left">
        <button className="button-style" onClick={() => navigate('/PC')}>
          Back
        </button>
      </div>
      <section className="pokemon-info">
        <div id="rename-btn">
          <button className="button-style" onClick={() => setShowForm(!showForm)}>
            Rename
          </button>
        </div>

        {showForm && (
          <div id="name-form">
            <form id="update-name-form" onSubmit={handleRename}>
              <label htmlFor="new-name"> New Name: </label>
              <input 
                type="text" 
                id="new-name" 
                name="new_name" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
              />
              <button type="submit" className="button-style">Update Name</button>
            </form>
          </div>
        )}

        <p id="name-type">
          <span id="pokemon_name">Name: {owned_poke.name}</span>
          <div className="poke-type">
            Type: <div className="type">{poketype1}</div>
            {poketype2 && <div className="type">{poketype2}</div>}
          </div>
        </p>

        <section className="moves">
          <div className="move">
            <p>{move_1.name}</p>
            <p>PP: {move_1.pp}</p>
            <p>Power: {move_1.power}</p>
            <p>Accuracy: {move_1.accuracy}</p>
          </div>
          <div className="move">
            <p>{move_2.name}</p>
            <p>PP: {move_2.pp}</p>
            <p>Power: {move_2.power}</p>
            <p>Accuracy: {move_2.accuracy}</p>
          </div>
          <div className="move">
            <p>{move_3.name}</p>
            <p>PP: {move_3.pp}</p>
            <p>Power: {move_3.power}</p>
            <p>Accuracy: {move_3.accuracy}</p>
          </div>
          <div className="move">
            <p>{move_4.name}</p>
            <p>PP: {move_4.pp}</p>
            <p>Power: {move_4.power}</p>
            <p>Accuracy: {move_4.accuracy}</p>
          </div>
        </section>
      </section>

      <section>
        <img className="pokemon-image details" src={owned_poke.sprite} alt={owned_poke.name} />
        <button onClick={handleRelease} className="button-style">
          Release
        </button>
      </section>
    </div>
  );
};

export default PokeDetails;