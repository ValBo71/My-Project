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

      var $submitBtn = $form.find("button[type=submit]");
      var originalBtnText = $submitBtn.text();
      $submitBtn.prop("disabled", true).text("Sending...");

      $.ajax({
        url: "https://api.web3forms.com/submit",
        type: "POST",
        dataType: "json",
        data: $form.serialize(),
        success: function(response) {
          if (response.success) {
            $('#success').html("<div class='alert alert-success'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button><strong>Message sent!</strong> Thank you for reaching out, I'll get back to you soon.</div>");
            $form.trigger("reset");
          } else {
            showSendError();
          }
        },
        error: function() {
          showSendError();
        },
        complete: function() {
          $submitBtn.prop("disabled", false).text(originalBtnText);
        }
      });

      function showSendError() {
        $('#success').html("<div class='alert alert-danger'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button><strong>Something went wrong.</strong> Please email me directly at <a href='mailto:home@bogdanovi.com'>home@bogdanovi.com</a>.</div>");
      }
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
