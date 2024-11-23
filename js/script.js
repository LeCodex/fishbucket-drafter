const playerForm = document.getElementById("playerForm");
const playerGrid = document.getElementById("playerGrid");
const playerInput = document.getElementById("playerInput");

var playerList = {};

playerInput.onchange = (event) => {
  playerInput.classList.remove("is-invalid");
}

playerForm.onsubmit = (event) => {
  event.preventDefault();
  
  const data = parsePlayerInput(playerInput.value);  // new bootstrap.Tooltip("#playerInput")
  if (!data) return false;
  
  var [child, select] = createPlayerElement(data.name, data.roles);
  playerGrid.appendChild(child);
  
  playerList[data.name] = {
    roles: data.roles,
    selected: null,
    select: select
  };
  updateFromPlayerCount();
  
  playerInput.value = "";
  return true;
};

// Enable all tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
})