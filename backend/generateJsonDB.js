const axios = require('axios');
const fs = require('fs');

async function fetchPokemonData(id) {
  const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = response.data;

  const evolutionResponse = await axios.get(data.species.url);
  const evolutionChainUrl = evolutionResponse.data.evolution_chain.url;
  const evolutionChainResponse = await axios.get(evolutionChainUrl);
  const evolutionChain = getEvolutionChain(evolutionChainResponse.data.chain);

  return {
    id: data.id,
    name: data.name,
    types: data.types.map(type => type.type.name),
    abilities: data.abilities.map(ability => ability.ability.name),
    height: data.height,
    weight: data.weight,
    cries: {
      latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`,
      legacy: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${data.id}.ogg`
    },
    evolutionChains: evolutionChain
  };
}

function getEvolutionChain(chain) {
  const evolutionChain = [chain.species.name];
  let currentChain = chain;

  while (currentChain.evolves_to.length > 0) {
    currentChain = currentChain.evolves_to[0];
    evolutionChain.push(currentChain.species.name);
  }

  return evolutionChain;
}

async function generateJsonDB() {
  const pokemonList = [];

  for (let i = 1; i <= 100; i++) {
    try {
      const pokemonData = await fetchPokemonData(i);
      pokemonList.push(pokemonData);
      console.log(`Fetched data for Pokemon #${i}`);
    } catch (error) {
      console.error(`Error fetching data for Pokemon #${i}:`, error.message);
    }
  }

  fs.writeFileSync('db.json', JSON.stringify({ pokemon: pokemonList }, null, 2));
  console.log('db.json has been generated successfully!');
}

generateJsonDB();
