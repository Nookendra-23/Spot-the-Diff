// loader.js
async function loadGameData() {
    try {
        const response = await fetch('./config/gameConfig.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const gameData = await response.json();
        document.getElementById("gameTitle").innerText = gameData.gameTitle;
        return gameData;
    } catch (error) {
        console.error("Failed to load game data:", error);
    }
}
