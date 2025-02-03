// Open the Modal
function openModal() {
    document.getElementById("myModal").style.display = "block";
  }
  
  // Close the Modal
  function closeModal() {
    document.getElementById("myModal").style.display = "none";
  }
  
  var slideindexHobby = 1;
  showSlidesHobby(slideindexHobby);
  
  // Next/previous controls
  function plusSlidesHobby(n) {
    showSlidesHobby(slideindexHobby += n);
  }
  
  // Thumbnail image controls
  function currentSlideHobby(n) {
    showSlidesHobby(slideindexHobby = n);
  }
  
  function showSlidesHobby(n) {
    var i;
    var slidesHobby = document.getElementsByClassName("mySlides");
    var dotsHobby = document.getElementsByClassName("demo");
    var captionText = document.getElementById("caption");
    if (n > slidesHobby.length) {slideindexHobby = 1}
    if (n < 1) {slideindexHobby = slidesHobby.length}
    for (i = 0; i < slidesHobby.length; i++) {
      slidesHobby[i].style.display = "none";
    }
    for (i = 0; i < dotsHobby.length; i++) {
      dotsHobby[i].className = dotsHobby[i].className.replace(" active", "");
    }
    slidesHobby[slideindexHobby-1].style.display = "block";
    dotsHobby[slideindexHobby-1].className += " active";
    captionText.innerHTML = dotsHobby[slideindexHobby-1].alt;
  }