const buttonFeedback = document.getElementById("buttonFeedback");

function updateButtonFeedback(enabled, text="", color="#CC2222") {
  buttonFeedback.innerHTML = text;
  buttonFeedback.hidden = !enabled;
  buttonFeedback.style.color = color;
}