const invalidFeedback = document.getElementById("invalidFeedback");

const toSentenceCase = (str) => str.charAt(0, 0).toUpperCase() + str.slice(1, str.length);


function parsePlayerInput(text) {
  const tfCount = Number(townsfolkCount.value), outCount = Number(outsiderCount.value), minCount = Number(minionCount.value), dmCount = Number(demonCount.value);
  const totalCount = tfCount + outCount + minCount + dmCount;
  
  var list = text.trim().split(" ");
  
  if (list.length < totalCount + 1) {
    invalidateForm("Not enough roles");
    return null;
  }
  
  var name = "";
  while (list.length > totalCount) name += list.shift() + " ";
  name = name.trim();
  
  // Check if the roles are valid and correspond to the character types
  const roles = list.map(e => resolveAlias(e.toLowerCase()));
  for (var idx in roles) {
    const role = roles[idx];
    if (!rolesData[role]) {
      invalidateForm(toSentenceCase(role) + " is not a valid role");
      return null;
    }
    
    const expectedType = (
      idx < tfCount ? "townsfolk" :
      idx < tfCount + outCount ? "outsider" :
      idx < tfCount + outCount + minCount ? "minion" :
      "demon"
    );
    if (rolesData[role].type !== expectedType) {
      let error = toSentenceCase(role) + " is not a valid " + toSentenceCase(expectedType);
      if (name.split(" ").length > 1) error += " (Are there too many roles?)";
      invalidateForm(error);
      return null;      
    }
  }
  
  if (playerList[name]) {
    invalidateForm("Player with the same name in play");
    return null;
  }
  
  return {name: name, roles: roles};
}


function resolveAlias(alias) {
  if (rolesData[alias] && rolesData[alias].alias) return rolesData[alias].alias;
  return alias;
}


function invalidateForm(reason) {
  invalidFeedback.innerHTML = reason;
  playerInput.classList.add("is-invalid");
}


function createPlayerElement(name, roles) {  
  var element = document.createElement("div");
  element.className = "col border text-center p-3 position-relative";
  
  // Header
  var header = document.createElement("div");
  header.className = "d-flex align-items-center justify-content-center"
  element.appendChild(header);
  
  // Header content
  {
    var nameLabel = document.createElement("h4");
    nameLabel.innerHTML = name;
    header.appendChild(nameLabel);

    var deleteButton = document.createElement("button");
    deleteButton.className = "btn-close btn-sm mx-2";
    header.appendChild(deleteButton); 
    
    deleteButton.onclick = (event) => {
      if (!playerList[name]) return;
      
      element.remove();
      delete playerList[name];
      updateFromPlayerCount();
    }
  }
  
  // Setup warning
  var setupWarning = document.createElement("span");
  setupWarning.className = "position-absolute top-0 start-100 z-3 translate-middle badge rounded-pill bg-danger text-light border border-light";
  setupWarning.tooltip = createTooltip(setupWarning, "This character changes the game's setup");
  setupWarning.innerHTML = "!";
  setupWarning.hidden = true;
  element.appendChild(setupWarning);
  
  // Duplicate warning
  var duplicateWarning = document.createElement("span");
  duplicateWarning.className = "position-absolute top-0 start-100 z-3 translate-middle badge rounded-pill bg-warning text-light border border-light";
  duplicateWarning.tooltip = createTooltip(duplicateWarning, "Multiple players have this character");
  duplicateWarning.innerHTML = "x2";
  duplicateWarning.hidden = true;
  element.appendChild(duplicateWarning);
  
  // Jinx warning
  var jinxWarning = document.createElement("span");
  jinxWarning.className = "position-absolute top-0 start-100 z-3 translate-middle badge rounded-pill bg-warning text-light border border-light";
  jinxWarning.tooltip = createTooltip(jinxWarning, "This character cannot be in-play with another one");
  jinxWarning.innerHTML = "Jinx";
  jinxWarning.hidden = true;
  element.appendChild(jinxWarning);
  
  // Internal jinx warning
  var internalJinxWarning = document.createElement("span");
  internalJinxWarning.className = "position-absolute top-0 start-100 z-3 translate-middle badge rounded-pill bg-warning text-light border border-light";
  internalJinxWarning.tooltip = createTooltip(internalJinxWarning, "This player has incompatible characters");
  internalJinxWarning.innerHTML = "Incompatible";
  internalJinxWarning.hidden = !markInternalJinxes(roles);
  element.appendChild(internalJinxWarning);
  
  // Missing necessary character warning
  var missingWarning = document.createElement("span");
  missingWarning.className = "position-absolute top-0 start-100 z-3 translate-middle badge rounded-pill bg-warning text-light border border-light";
  missingWarning.tooltip = createTooltip(missingWarning, "This character must be in-play with another one");
  missingWarning.innerHTML = "Missing";
  missingWarning.hidden = true;
  element.appendChild(missingWarning);
  
  
  // Role select
  var roleSelect = document.createElement("select");
  roleSelect.className = "form-select";
  element.appendChild(roleSelect);
  
  roleSelect.oninput = (event) => {
    if (roleSelect.value != -1) {
      var role = roles[roleSelect.value];
      playerList[name].selected = role;
      element.style.backgroundColor = "var(--bg-" + rolesData[role].type + ")";
      // element.style.color = "var(--" + rolesData[role].type + ")";
      setupWarning.hidden = !rolesData[role].setup;
    } else {
      playerList[name].selected = null;
      element.style.backgroundColor = "";
      // element.style.color = "";
      setupWarning.hidden = true;
    }
    
    markDuplicates();
    markJinxes();
    markMissing();
  }
  roleSelect.duplicateWarning = duplicateWarning;
  roleSelect.jinxWarning = jinxWarning;
  roleSelect.missingWarning = missingWarning;
  
  // Role select options
  {
    var unselectedOption = document.createElement("option");
    unselectedOption.selected = true;
    unselectedOption.value = -1;
    unselectedOption.innerHTML = "❔ Unassigned"
    roleSelect.appendChild(unselectedOption);

    for (var idx in roles) {
      var role = roles[idx];
      var roleButton = document.createElement("option");
      roleButton.value = idx;
      roleButton.style.color = "var(--" + rolesData[role].type + ")";
      roleButton.innerHTML = rolesData[role].icon + " " + rolesData[role].name;
      roleButton.title = rolesData[role].ability;

      roleSelect.appendChild(roleButton);
    } 
  }
  
  return [element, roleSelect];
}


function createTooltip(element, text) {
  element.setAttribute("data-bs-toggle", "tooltip");
  element.setAttribute("data-bs-title", text);
  return new bootstrap.Tooltip(element);
}


function updateFromPlayerCount() {
  var playerCount = Object.values(playerList).length;
  
  let enabled = false, info = "?-?-?-?";
  if (rolesCount[playerCount.toString()]) {
    enabled = true;
    info = rolesCount[playerCount.toString()].join("-");
  }
  completeButton.innerHTML = "Random distribution (" + info + ")"
  completeButton.disabled = !enabled;
  
  const started = playerCount > 0;
  townsfolkCount.disabled = started;
  outsiderCount.disabled = started;
  minionCount.disabled = started;
  demonCount.disabled = started;
}
updateFromPlayerCount();



function markDuplicates() {
  let currentRoles = {};
  for (let key of Object.keys(playerList)) {
    playerList[key].select.duplicateWarning.hidden = true;
    let role = playerList[key].selected;
    if (!role) continue;
    
    currentRoles[role] = (currentRoles[role] !== undefined);
  }
  
  for (let role of Object.keys(currentRoles)) {
    if (!currentRoles[role]) continue;
    
    for (let player of Object.values(playerList))
      if (player.selected === role) player.select.duplicateWarning.hidden = false;
  }
}


function markJinxes() {
  for (let player of Object.values(playerList)) player.select.jinxWarning.hidden = true;
  
  for (let role of Object.keys(jinxesData.external)) {
    let jinxes = jinxesData.external[role];
    let origin = [], affected = [];
    
    for (let player of Object.values(playerList)) {
      if (player.selected === role) origin.push(player);
      if (jinxes.includes(player.selected)) affected.push(player);
    }
      
    if (origin.length && affected.length) for (let player of affected.concat(origin)) player.select.jinxWarning.hidden = false;
  }
}


function markInternalJinxes(roles) {
  for (let role1 of roles) {
    if (!Object.keys(jinxesData.internal).includes(role1)) continue;
    
    let jinxes = jinxesData.internal[role1];
    let origin = [], affected = [];
    
    for (let role2 of roles) {
      if (jinxes.includes(role2)) {
        return true;
      }
    }
  }
  
  return false;
}


function markMissing() {
  for (let player of Object.values(playerList)) player.select.missingWarning.hidden = true;
  
  for (let role of Object.keys(jinxesData.necessary)) {
    let necessary = jinxesData.necessary[role];
    let affected = [], missing = true;
    
    for (let player of Object.values(playerList)) {
      if (player.selected === role) affected.push(player);
      if (player.selected === necessary) missing = false;
    }
      
    if (missing) for (let player of affected) player.select.missingWarning.hidden = false;
  }
}