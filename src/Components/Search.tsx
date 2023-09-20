import React, { useState } from "react";
import axios from "axios";

type TeamColors = {
  [key: string]: string;
};

const teamColors: TeamColors = {
  ATL: "#E03A3E", // Atlanta Hawks
  BOS: "#007A33", // Boston Celtics
  BKN: "#000000", // Brooklyn Nets
  CHA: "#00788C", // Charlotte Hornets
  CHI: "#CE1141", // Chicago Bulls
  CLE: "#860038", // Cleveland Cavaliers
  DAL: "#00538C", // Dallas Mavericks
  DEN: "#0E2240", // Denver Nuggets
  DET: "#C8102E", // Detroit Pistons
  GSW: "#1D428A", // Golden State Warriors
  HOU: "#CE1141", // Houston Rockets
  IND: "#FDBB30", // Indiana Pacers
  LAC: "#1D428A", // LA Clippers
  LAL: "#552583", // Los Angeles Lakers
  MEM: "#5D76A9", // Memphis Grizzlies
  MIA: "#98002E", // Miami Heat
  MIL: "#00471B", // Milwaukee Bucks
  MIN: "#005083", // Minnesota Timberwolves
  NOP: "#0C2340", // New Orleans Pelicans
  NYK: "#006BB6", // New York Knicks
  OKC: "#007AC1", // Oklahoma City Thunder
  ORL: "#0077C0", // Orlando Magic
  PHI: "#006BB6", // Philadelphia 76ers
  PHX: "#1D1160", // Phoenix Suns
  POR: "#E03A3E", // Portland Trail Blazers
  SAC: "#5A2D81", // Sacramento Kings
  SAS: "#C4CED4", // San Antonio Spurs
  TOR: "#CE1141", // Toronto Raptors
  UTA: "#002B5C", // Utah Jazz
  WAS: "#E31837", // Washington Wizards
};

const SearchComponent: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [searchedPlayers, setSearchedPlayers] = useState<number[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `https://www.balldontlie.io/api/v1/players?search=${query}`
      );
      const playerData = response.data.data;

      const playersWithAverages = await Promise.all(
        playerData.map(async (player: any) => {
          const seasonAverageResponse = await axios.get(
            `https://www.balldontlie.io/api/v1/season_averages?season=2022&player_ids[]=${player.id}`
          );
          const seasonAverages =
            seasonAverageResponse.data.data.find(
              (avg: any) => avg.season === 2022
            ) || {};
          return {
            ...player,
            seasonAverages,
          };
        })
      );

      const players2022Season = playersWithAverages.filter(
        (player) => player.seasonAverages.season === 2022
      );

      if (players2022Season.length === 0) {
        setSearchError(`No player named "${query}" for the 2022 season.`);
      } else {
        setSearchError(null);
        setResults(players2022Season);
        setSearchedPlayers((prevPlayers) => [
          ...prevPlayers,
          ...players2022Season.map((player) => player.id),
        ]);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setSearchError(`An error occurred while searching. Please try again.`);
    }
  };

  const handleDisplayStats = (playerId: number) => {
    setSelectedPlayerId(playerId);
  };

  const handleCloseStats = () => {
    setSelectedPlayerId(null);
  };

  const formatPlayerStats = (player: any) => {
    const formattedStats = Object.keys(player.seasonAverages)
      .filter((key) => key !== "player_id") // Exclude player_id
      .map((key) => {
        const formattedKey = key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return `${formattedKey}: ${player.seasonAverages[key]}`;
      })
      .join("\n");
    return formattedStats;
  };

  const filteredResults = results.filter((player) =>
    searchedPlayers.includes(player.id)
  );

  return (
    <div className="container">
      <h1 className="title"> NBA STATS </h1>
      <div className="input">
        <input
          type="text"
          placeholder="Enter a player name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="player-info">
        {searchError && <div className="error-message">{searchError}</div>}
        <ul>
          {filteredResults.map((result) => (
            <li className="list-container" style={{ listStyle: "none" }} key={result.id}>
              <div
                className="card"
                style={{
                  backgroundColor:
                    teamColors[result.team.abbreviation] || "#fff",
                  color: "#fff",
                }}
              >
                <h5>Team:</h5> {result.team.abbreviation}
                <h5>Name:</h5> {result.first_name} {result.last_name}
                <h5>Height:</h5> {result.height_feet}' {result.height_inches}
                <h5>Season Average:</h5> {result.seasonAverages.pts} Points Per
                Game
                <button onClick={() => handleDisplayStats(result.id)}>
                  Display All Stats
                </button>
              </div>
              {selectedPlayerId === result.id && (
                <div className="card player-stats-card">
                  <button onClick={handleCloseStats}>Close</button>
                  <h2>Player Stats</h2>
                  <pre>{formatPlayerStats(result)}</pre>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchComponent;