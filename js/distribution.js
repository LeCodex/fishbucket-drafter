const MAX_ATTEMPTS = 100;

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

function distributeRoles(idxStart, roleCount, playerAmount) {
  var unassignedPlayers = Object.keys(playerList).filter(e => !playerList[e].selected);
  playerAmount = Math.min(playerAmount, unassignedPlayers.length);
  if (playerAmount === 0) return false;
  
  var valid = false, attempts = 0, distribution = {};
  while (!valid && attempts < MAX_ATTEMPTS) {
    attempts++;
    let currentRoles = [];
    for (var key of Object.keys(playerList)) {
      if (!playerList[key].selected) distribution[key] = -1;
      else currentRoles.push(playerList[key].selected);
    }
    
    valid = true;
    for (var i = 0; i < playerAmount; i++) {
      let key = randomElementThatMatchesCond(unassignedPlayers, (key) => distribution[key] == -1);
      
      distribution[key] = getRandomInt(idxStart, idxStart + roleCount);
      
      let role = playerList[key].roles[distribution[key]];
      if (
        currentRoles.includes(role) || // Role is a duplicate
        currentRoles.some(e => 
          jinxesData.external[role] && jinxesData.external[role].includes(e) || 
          jinxesData.external[e] && jinxesData.external[e].includes(role)
        )  // There is a jinx
      ) {
        valid = false; 
        break; 
      }
      
      if (jinxesData.necessary[role] && false) { // Automatic fill-in is disabled for now as it causes issues
        let necessary = jinxesData.necessary[role]
        let playersWithSecondRole = Object.keys(playerList).filter(e => distribution[e] === -1 && playerList[e].roles.includes(necessary));
        if (playersWithSecondRole.length === 0) {
          valid = false;
          break;
        }
        
        let secondKey = playersWithSecondRole[getRandomInt(0, playersWithSecondRole.length)];
        distribution[secondKey] = playerList[secondKey].roles.indexOf(necessary);
        currentRoles.push(necessary);
      }
      
      currentRoles.push(role);
    }
  }
  
  updateButtonFeedback(!valid, "Role assignment failed because of duplicates/jinxes/requirements");
  if (valid) {
    for (var key of unassignedPlayers) {
      playerList[key].select.value = distribution[key];
      playerList[key].select.oninput() ; // Ugly hack, but hey, it works
    }
  }
  
  return valid;
}


function getTypeAmount(type) {
  const count = rolesCount[Object.keys(playerList).length.toString()];
  if (!count) return null;
  return count[type];
}


function randomElementThatMatchesCond(list, cond) {
  let val;
  
  do { 
    val = list[getRandomInt(0, list.length)]
  } while (!cond(val));
  
  return val;
}


townsfolkButton.onclick = (event) => {
  distributeRoles(0, Number(townsfolkCount.value), 1);
}

outsiderButton.onclick = (event) => {
  distributeRoles(Number(townsfolkCount.value), Number(outsiderCount.value), 1);
}

minionButton.onclick = (event) => {
  distributeRoles(Number(townsfolkCount.value) + Number(outsiderCount.value), Number(minionCount.value), 1);
}

demonButton.onclick = (event) => {
  distributeRoles(Number(townsfolkCount.value) + Number(outsiderCount.value) + Number(minionCount.value), Number(demonCount.value), 1);
}

completeButton.onclick = (event) => {
  resetButton.onclick();
  
  let startIdx = 0;
  const counts = [townsfolkCount.value, outsiderCount.value, minionCount.value, demonCount.value].map(e => Number(e));
  for (let i = 0; i < 4; i++) {
    var amount = getTypeAmount(i);
    if (amount === null) return;
    if (amount) if (!distributeRoles(startIdx, counts[i], amount)) return;
    startIdx += counts[i];
  }
}

resetButton.onclick = (event) => {
  updateButtonFeedback(false);
  for (var player of Object.values(playerList)) {
    player.select.value = -1;
    player.select.oninput();
  }
}