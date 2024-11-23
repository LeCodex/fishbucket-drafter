const exportButton = document.getElementById("buttonExport");
const downloadButton = document.getElementById("buttonDownload");

function getGameStateJSON() {
  let gameState = {
    "bluffs":[null,null,null],
    "edition":{"id":"custom"},
    "roles":[],
    "fabled":[],
    "players":[]
  }
  
  for (var key of Object.keys(playerList)) {
    const player = playerList[key];
    
    for (let role of player.roles) {
      let roleData = {"id": role}
      if (!gameState.roles.map(e => e.id).includes(role)) gameState.roles.push(roleData);
    }
    
    const playerData = {
      name: key,
      id: "",
      role: player.selected || "",
      reminders: [],
      "isVoteless": false,
      "isDead": false,
      "pronouns": ""
    }
    gameState.players.push(playerData);
  }
  
  return gameState;
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


exportButton.onclick = (event) => {
  let gameState = getGameStateJSON()
  
  updateButtonFeedback(true, "Game state JSON copied to clipboard!", "#22CC22");
  navigator.clipboard.writeText(JSON.stringify(gameState));
}

downloadButton.onclick = (event) => {
  let gameState = getGameStateJSON()
  
  updateButtonFeedback(true, "Game state JSON downloaded!", "#22CC22");
  downloadObjectAsJson(gameState, "fishbucket_game_state");
}