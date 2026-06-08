/*
  Jquery Validation using jqBootstrapValidation
   example is taken from jqBootstrapValidation docs 
  */
$(function() {

 $("input,textarea").jqBootstrapValidation(
    {
     preventSubmit: true,
     submitError: function($form, event, errors) {
      // something to have when submit produces an error ?
      // Not decided if I need it yet
     },
     submitSuccess: function($form, event) {
      event.preventDefault(); // prevent default submit behaviour
       // get values from FORM
       var name = $("input#name").val();  
       var email = $("input#email").val(); 
       var message = $("textarea#message").val();
        var firstName = name; // For Success/Failure Message
           // Check for white space in name for Success/Fail message
        if (firstName.indexOf(' ') >= 0) {
	   firstName = name.split(' ').slice(0, -1).join(' ');
         }        
        var subject = "Message from " + name + " via Personal Site";
        var body = "Hi Valentin,\n\n" + message + "\n\nRegards,\n" + name + "\nEmail: " + email;
        var mailtoUrl = "mailto:home@bogdanovi.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        
        window.location.href = mailtoUrl;

        // Success message for opening mail client
        $('#success').html("<div class='alert alert-success'>");
        $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
        $('#success > .alert-success')
            .append("<strong>Opening your email client...</strong> If it doesn't open, you can email me directly at <a href='" + mailtoUrl + "'>home@bogdanovi.com</a>.");
        $('#success > .alert-success')
            .append('</div>');
            
        // clear all fields
        $('#contactForm').trigger("reset");
         },
         filter: function() {
                   return $(this).is(":visible");
         },
       });

      $("a[data-toggle=\"tab\"]").click(function(e) {
                    e.preventDefault();
                    $(this).tab("show");
        });
  });
 

/*When clicking on Full hide fail/success boxes */ 
$('#name').focus(function() {
     $('#success').html('');
  });
