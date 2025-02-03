// Get the modal
const modal = document.getElementById("modalDialog");
        
// Get the image and insert it inside the modal - use its "alt" text as a caption
const images = document.querySelectorAll(".hobby-image img");
const modalImg = document.getElementById("img01");
const captionText = document.getElementById("caption");
images.forEach(function(img) {
  img.onclick = function () {
    modal.style.display = "block";
    modalImg.src = this.getAttribute('data-large-src');
    captionText.innerHTML = this.alt;
  }
 });

// Get the <span> element that closes the modal
const closeButton = document.querySelectorAll(".close")[0];

// When the user clicks on <span> (x), close the modal
closeButton.onclick = function() { 
  modal.style.display = "none";
}