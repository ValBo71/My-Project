  $(function() {
    $("ul li.footer-name a").mouseover (function() {
      $(this).css ("opacity", "1");    
      $(this).css ("background", "#d07325");  
      $(this).css ("color", "white");   
    });
    $("ul li.footer-name a").mouseout (function() {
      $(this).css ("opacity", "1");    
      $(this).css ("background", "white"); 
      $(this).css ("color", "#575252");
    });
  });
