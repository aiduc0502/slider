/**
 *  @name plugin
 *  @description description
 *  @version 1.0
 *  @options
 *    option
 *  @events
 *    event
 *  @methods
 *    init
 *    publicMethod
 *    destroy
 */
 ;(function($, window, undefined) {
  'use strict';
  var pluginName = 'slider',
  none='none',
  onTouchStart='ontouchstart';

  function supportCSS3(prop) {
    var prefix = ['-webkit-', '-moz-', ''];
    var root = document.documentElement;

    function camelCase(str) {
      return str.replace(/\-([a-z])/gi, function(match, $1) {
        return $1.toUpperCase();
      });
    }
    for (var i = prefix.length - 1; i >= 0; i--) {
      var css3prop = camelCase(prefix[i] + prop);
      if (css3prop in root.style) {
        return css3prop;
      }
    }
    return false;
  }

  function transitionEnd() {
    var transitions = {
      'transition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'mozTransitionEnd'
    };
    var root = document.documentElement;
    for (var name in transitions) {
      if (root.style[name] !== undefined) {
        return transitions[name];
      }
    }
    return false;
  }

  function support3d() {
    if (!window.getComputedStyle) {
      return false;
    }
    var el = document.createElement('div'),
    has3d,
    transform = supportCSS3('transform');

    document.body.insertBefore(el, null);

    el.style[transform] = 'translate3d(1px,1px,1px)';
    has3d = getComputedStyle(el)[transform];

    document.body.removeChild(el);

    return (has3d !== undefined && has3d.length > 0 && has3d !== none);
  }
  var Touch = {
    hasTouch: !!((onTouchStart in window) || window.DocumentTouch && document instanceof window.DocumentTouch),
    event: function() {
      return {
        start: (this.hasTouch) ? 'touchstart' : 'mousedown',
        move: (this.hasTouch) ? 'touchmove' : 'mousemove',
        end: (this.hasTouch) ? 'touchend' : 'mouseup',
        leave: (this.hasTouch) ? 'touchleave' : 'mouseout'
      };
    }
  };

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
      args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  }
  // var initVar = function(ele) {
  //   $container = ele.vars.$container;
  //   $slider =  ele.vars.$slider;
  //   $arrows =  ele.vars.$arrows;
  //   $caption =  ele.vars.$caption;
  //   $slide =  ele.vars.$slide;
  //   sliderStyle = $slider.get(0).style;
  //   slideLen = $slide.length;
  //   slideWidth = $container.outerWidth();
  //   sliderWidth = slideLen * slideWidth;
  //   transformProperty = supportCSS3('transform');
  //   transitionProperty = supportCSS3('transition');
  //   has3d = support3d();
  // };

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {

    init: function() {
      var ele = this.element,
      options = this.options;
      ele.vars = {
        touch: options.touch,
        infinite: options.infinite,
        autoPlay: options.autoPlay,
        pauseOnHover: options.pauseOnHover,
        delay: options.delay,
        responsive: options.responsive,
        controls: options.controls,
        arrows: options.arrows,
        caption: options.caption,
        speed: options.speed,
        cssEase: options.cssEase,
        classSlider:options.classSlider,
        classSliderSwitch:options.classSliderSwitch,
        classSliderCaption:options.classSliderCaption,
        classSliderItem:options.classSliderItem,      
        $container : ele,
        $slider : ele.find('.'+options.classSlider),
        $arrows : ele.find('.'+options.classSliderSwitch),
        $caption : ele.find('.'+options.classSliderCaption),
        $slide : ele.find('.'+options.classSliderItem)
      };

      // transformProperty = supportCSS3('transform');
      // transitionProperty = supportCSS3('transition');
      // has3d = support3d();
      var  $container = ele.vars.$container;
      var $slider =  ele.vars.$slider;
      var $arrows =  ele.vars.$arrows;
      var $caption =  ele.vars.$caption;
      var $slide =  ele.vars.$slide;
      var sliderStyle = $slider.get(0).style;
      var slideLen = $slide.length;
      var slideWidth = $container.outerWidth();
      var sliderWidth = slideLen * slideWidth;
      var current = 0;
      var offset = 0;
      var busy = false;
      var touchFlag = false;
      var $controlPanel;
      var $navControl;
      var timer;

      var transformProperty = supportCSS3('transform');
      var transitionProperty = supportCSS3('transition');
      var has3d = support3d();
      function move(ele, value, hasAnimate) {
        console.log(ele);
        console.log($slider);
        if (transitionProperty && transformProperty) {

          (hasAnimate) ?
          sliderStyle[transitionProperty] = transformProperty + ' ' + ele.vars.speed + 'ms ' + ele.vars.cssEase: sliderStyle[transitionProperty] = none;

          (has3d) ?
          sliderStyle[transformProperty] = 'translate3d(' + value + 'px, 0, 0)': sliderStyle[transformProperty] = 'translateX(' + value + 'px)';

          if (hasAnimate) {
            $slider.one(transitionEnd(), function() {

              busy = false;
            });
          } else {
            busy = false;
          }
        } else {
          if (hasAnimate) {
            $slider.animate({
              'margin-left': value
            }, ele.vars.speed, 'linear', function() {
              busy = false;
            });
          } else {
            $slider.css('margin-left', value);
            busy = false;
          }

        }
      }
      function stopInfinite(direction) {
        $container.find('.slider-switch-' + direction).attr('disabled', true);
      }
      function show(ele, slide) {
        if (busy) {
          return;
        }
        if (slide === current) {
          return;
        }
        current = (slide > slideLen - 1) ? 0 : slide;
        if (slide < 0) {
          current = slideLen - 1;
        }

        if (!ele.vars.infinite) {

          $arrows.attr('disabled', false);
          if (slide === slideLen - 1) {
            stopInfinite('next');
          }

          if (current === 0) {
            stopInfinite('prev');
          }

        }

        offset = -(slideWidth * (current));
        console.log(offset);
        if (ele.vars.controls) {
          $navControl.removeClass('active')
          .eq(current)
          .addClass('active');
        }
        busy = true;
        move(ele, offset, true);
      }
      function autoPlay() {
          // if(temp ==='') {
          //   temp = ele;
          // }
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function() {
          if (!touchFlag) {
            show(ele, current + 1);
          }
        },10000);
      }
      function dimmensions() {
        console.log($container);
        var scrollWidth = window.innerWidth - document.documentElement.clientWidth || 0;
        slideWidth = $container.outerWidth() + scrollWidth;
        sliderWidth = slideLen * slideWidth;
        $slide.css('width', slideWidth);
        sliderStyle['width'] = sliderWidth + 'px';
      }

      function responsive(ele) {

        if (timer) {
          clearInterval(timer);
        }
        dimmensions();

        offset = -(slideWidth * current);
        move(ele, offset);

   // autoPlay(ele);
 }
 function controls(ele) {
  $controlPanel = $('<div/>', {
    'class': 'slider-nav'
  })
  .appendTo($container);

  var links = [];

  for (var i = 0; slideLen > i; i++) {
    var act = (current === i) ? 'active' : '';
    links.push('<li class="slider-nav-control ' + act + '" data-slider-control="' + i + '"><p>'+(i+1)+'</p></li>');
  }
  $controlPanel.html(links.join(''));
  $navControl = $controlPanel.find('.slider-nav-control');
  $controlPanel.on('click.' + pluginName, '.slider-nav-control', function(e) {
    e.preventDefault();
    if ($(this).hasClass('active')) {
      return;
    }
    show(ele, parseInt(this.getAttribute('data-slider-control'), 10));
  });
}

function touchEnable(ele) {
  $slider.addClass('has-touch');
  var touchX;
  var touchY;
  var delta;
  var target;

  $slider.on(Touch.event().start + '.' + pluginName, function(e) {
    if (touchFlag || busy) {
      return;
    }

    var touch;
    if (e.originalEvent.targetTouches) {
      target = e.originalEvent.targetTouches[0].target;
      touch = e.originalEvent.targetTouches[0];
    } else {
      touch = e.originalEvent;
      e.preventDefault();
    }

    delta = 0;
    touchX = touch.pageX || touch.clientX;
    touchY = touch.pageY || touch.clientY;
    touchFlag = true;

  });
  $slider.on(Touch.event().move + '.' + pluginName, function(e) {
    if (!touchFlag) {
      return;
    }

    var touch;
    if (e.originalEvent.targetTouches) {
      if (e.originalEvent.targetTouches.length > 1 || target !== e.originalEvent.targetTouches[0].target) {
        return;
      }
      touch = e.originalEvent.targetTouches[0];
    } else {
      e.preventDefault();
      touch = e.originalEvent;
    }

    var currentX = touch.pageX || touch.clientX;
    var currentY = touch.pageY || touch.clientY;

    if (Math.abs(touchX - currentX) >= Math.abs(touchY - currentY)) {
      delta = touchX - currentX;
      move(ele, parseInt(offset, 10) - delta);
    }
  });
  $slider.on(Touch.event().end + '.' + pluginName, function() {

    if (!touchFlag) {
      return;
    }
    var swipeTo = delta < 0 ? current - 1 : current + 1;

    if (Math.abs(delta) < 50 || (!ele.vars.infinite && (swipeTo > slideLen - 1 || swipeTo < 0))) {
      touchFlag = false;
      move(ele, offset, true);
      return;
    }
    touchFlag = false;
    target = null;
    show(ele, swipeTo);
  });
  $slider.on(Touch.event().leave + '.' + pluginName, function() {
    if (touchFlag) {
      move(ele, offset, true);
      touchFlag = false;
    }
  });
}

dimmensions();

if (ele.vars.responsive) {
  $(window).on('resize.' + pluginName, debounce(responsive, 50));
}
!ele.vars.caption && $caption.attr('disabled', true);
ele.vars.controls && controls(ele);
if (ele.vars.touch) {
  $slide.find('img').attr('draggable', false);
  touchEnable(ele);
}

if (ele.vars.autoPlay) {
  autoPlay(ele);
  if (ele.vars.pauseOnHover) {
    $container.on('mouseenter.' + pluginName, function() {
      clearInterval(timer);
    });
    $container.on('mouseleave.' + pluginName, autoPlay);
  }
}

if (ele.vars.arrows) {
  !ele.vars.infinite && stopInfinite('prev');

  $arrows.on('click.' + pluginName, function(e) {
    e.preventDefault();
    if (this.getAttribute('data-slider-dir') === 'next') {
      show(ele, current + 1);
    } else {
      show(ele, current - 1);
    }
  });
} else {
  $arrows.attr('disabled', true);
}
console.log($slider);
},

 destroy: function() {
      // remove events
      // deinitialize
      $.removeData(this.element[0], pluginName);
    }
};

$.fn[pluginName] = function(options, params) {

  return this.each(function() {
    var instance = $.data(this, pluginName);
    if (!instance) {
      $.data(this, pluginName, new Plugin(this, options));
    } else if (instance[options]) {
      instance[options](params);
    }
  });
};
$.fn[pluginName].defaults = {
 touch: true,
 infinite: false,
 autoPlay: true,
 pauseOnHover: true,
 delay: 100000,
 responsive: true,
 controls: true,
 arrows: true,
 caption: true,
 speed: 300,
 cssEase: 'ease-out',
 classSlider:'slider',
 classSliderSwitch:'slider-switch',
 classSliderCaption:'slider-caption',
 classSliderItem:'slider-item',

};

$(function() {
  $('[data-' + pluginName + ']')[pluginName]({

  });
});

})(jQuery, window);
