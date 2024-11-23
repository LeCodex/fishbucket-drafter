const townsfolkButton = document.getElementById("buttonTownsfolk");
const outsiderButton = document.getElementById("buttonOutsider");
const minionButton = document.getElementById("buttonMinion");
const demonButton = document.getElementById("buttonDemon");
const completeButton = document.getElementById("buttonComplete");
const resetButton = document.getElementById("buttonReset");

const townsfolkCount = document.getElementById("inputTownsfolk");
const outsiderCount = document.getElementById("inputOutsider");
const minionCount = document.getElementById("inputMinion");
const demonCount = document.getElementById("inputDemon");

var rolesData = {};
window.fetch("./roles.json").then(x => x.json()).then(x => rolesData = x);

var jinxesData = {};
window.fetch("./jinxes.json").then(x => x.json()).then(x => jinxesData = x);

var rolesCount = [];
window.fetch("./rolesCount.json").then(x => x.json()).then(x => rolesCount = x);