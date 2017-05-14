var Site = (function($, window, undefined) {

  function initSite() {
    $(document).ready(function(){
      // $('[data-slider]').slider();
      // $('.intro-slider').slider({});
      // $('.partner-slider').slider({});
      // 
        $(".slider-container").slider({
          speed: 500,
        });
    });
  }

  return {
    initSite: initSite
  };

})(jQuery, window);

jQuery(function() {
  Site.initSite();
});