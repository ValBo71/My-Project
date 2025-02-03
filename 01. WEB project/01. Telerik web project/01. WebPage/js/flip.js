const groupOne = document.querySelectorAll(".person");

function flipCard() {
  // toggle the cards on click
  this.classList.toggle("flip");
}

groupOne.forEach((card) => card.addEventListener("click", flipCard));