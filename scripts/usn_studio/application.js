	
	// DETECT DEVICE
	$(window).bind('load resize', function() {

	    // BROWSER CLASS
		if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
			$("body").addClass("browser-safari");
		}
	    if (navigator.userAgent.match(/iP(hone|od|ad)/i)) {
			$("body").removeClass("browser-safari");
	        jQuery('body').addClass('browser-ios');
		}
	    // ADD PADDING TO TOP NAV IF CTA PRESENT ON LARGE SCREENS
	    var ctaWidth = $('nav.cta-links').outerWidth();
	    $('nav.secondary').css('padding-right', ctaWidth + 30);
	    var ctaWidth = $('html[dir="rtl"] nav.cta-links').outerWidth();
	    $('nav.secondary').css('padding-left', ctaWidth + 0);

	});

	// FIX PARALLAX 
	// IE 11 background-attachment:fixed will jitter on scroll if this is missing
	jQuery(function() {
	    if (navigator.userAgent.match(/MSIE 10/i) || navigator.userAgent.match(/Trident\/7\./) || navigator.userAgent.match(/Edge\/12\./)) {
	        $('body').on("mousewheel", function() {
	            event.preventDefault();
	            var wd = event.wheelDelta;
	            var csp = window.pageYOffset;
	            window.scrollTo(0, csp - wd);
	        });
	    }
	});

	// ADD CLASS TO HTML ELEMENT WHEN THE MOBILE/BURGER NAVIGATION IS PRESENT
	(function($) {
	    var $window = $(window),
	        $html = $('html');

	    function resize() {
	        if ($window.width() < 992) {
	            return $html.addClass('mobile-width');
	        }
	        $html.removeClass('mobile-width');
	    }
	    $window
	        .resize(resize)
	        .trigger('load resize');
	})(jQuery);

	// IMPROVE SCROLL PERFORMANCE FOR
	// ANIMATION &
	// HEADER HIDE/REVEAL
	function debounce(func, wait, immediate) {
	    var timeout;
	    return function() {
	        var context = this,
	            args = arguments;
	        var later = function() {
	            timeout = null;
	            if (!immediate) func.apply(context, args);
	        };
	        var callNow = immediate && !timeout;
	        clearTimeout(timeout);
	        timeout = setTimeout(later, wait);
	        if (callNow) func.apply(context, args);
	    };
	};
	var myEfficientScroll = debounce(function() {
	    // TRIGGER ANIMATIONS
	    // http://www.oxygenna.com/tutorials/scroll-animations-using-waypoints-js-animate-css
	    function onScrollInit(items, trigger) {

	        items.each(function() {
	            var osElement = $(this),
	                osAnimationClass = osElement.attr('data-os-animation'),
	                osAnimationDelay = osElement.attr('data-os-animation-delay');

	            osElement.css({
	                '-webkit-animation-delay': osAnimationDelay,
	                '-moz-animation-delay': osAnimationDelay,
	                '-ms-animation-delay': osAnimationDelay,
	                'animation-delay': osAnimationDelay
	            });

	            var osTrigger = (trigger) ? trigger : osElement;

	            osTrigger.waypoint(function() {
					osElement.addClass('animated').addClass(osAnimationClass);
	            }, {
	                //triggerOnce: true,
	                offset: '95%'
	            });
	        });

	    }
	    onScrollInit($('.os-animation'));

	}, 250);
	window.addEventListener('load', myEfficientScroll);

	$(document).ready(function() {

	    cookiePolicy();

	    $(".umbraco-ajax-form form").preventDoubleSubmission();

	    // LAZYSIZES PRELOAD
	    $('img.lazyload').addClass('lazypreload');

	    // Main Navigation
	    // $(".navigation nav.main ul li.active").addClass("mobile-open-child");
	    $(".navigation nav.main ul li span").click(function() {
	        if ($(".navigation nav.main ul li span").length) {
	            $(this).parent().toggleClass("open-child");
	            $(this).parent().siblings().removeClass("open-child");
	            $(this).parent().toggleClass("open-child_mobile");
	            $(this).parent().siblings().removeClass("open-child_mobile");
	        } else {
	            $(this).parent().toggleClass("open-child");
	            $(this).parent().toggleClass("open-child_mobile");
	        }
		});
		$(".navigation nav.main ul li.has-child.active").addClass("open-child_mobile");
	    $("html").click(function() {
	        $(".navigation nav.main ul li.open-child").removeClass("open-child");
	    });
	    $(".navigation nav.main ul li span, header a.expand").click(function(e) {
	        e.stopPropagation();
	    });

	    // EXPAND MOBILE NAVIVAGTION  
	    $("header#site-header a.expand").click(function() {
	        if ($(".navigation .reveal").length) {
	            $("header#site-header a.expand").toggleClass('active');
	            $("html").toggleClass('reveal-out');
	        } else {
	            $("header#site-header a.expand").toggleClass('active');
	            $("html").toggleClass('reveal-out');
	        }
	    });

	    // EXPAND Anchor Mobile Navigation  
	    $(".anchors-component .expand").click(function() {
	        if ($(".anchors-component nav").length) {
	            $(".anchors-component .expand").toggleClass('anchor-active');
	            $(".anchors-component nav").toggleClass('open-mobile');
	        } else {
	            $(".anchors-component .expand").toggleClass('anchor-active');
	            $(".anchors-component nav").toggleClass('open-mobile');
	        }
	    });

	    // EXPAND HEADER SEARCH 
	    $("header#site-header .site-search a.expand-search").click(function() {
	        if ($("header#site-header .site-search").length) {
	            $("header#site-header .site-search").toggleClass('open-search');
	            $("header#site-header .site-search .form-control").focus();
	        } else {
	            $("header#site-header .site-search").toggleClass('open-search');
	        }
	    });
	    $("html").click(function() {
	        $("header#site-header .site-search").removeClass("open-search");
	    });
	    $("header#site-header .site-search").click(function(e) {
	        e.stopPropagation();
	    });

		//RTL for Slick
		function rtl_slick(){
			if(jQuery("html").is('[dir="rtl"]')) {
			   return true;
			} else {
			   return false;
		}}

	    // BANNER
	    // PLAYS VIDEO IN BANNER
	    $('.banner-component .slides').on('init', function(ev, el) {
	        $('video').each(function() {
	            this.play();
	        });
	    });
		// ALL CAROUSELS
	    $(".component:not(.banner-component) .slides, footer#site-footer .slides").slick({
			rtl: rtl_slick(),
	        infinite: true,
	        speed: 600,
			adaptiveHeight: true,
	        prevArrow: '<div class="slick-prev"><i class="icon usn_ion-ios-arrow-back"></i>',
	        nextArrow: '<div class="slick-next"><i class="icon usn_ion-ios-arrow-forward"></i>'
	    });
	    $(".banner-component .slides, .swp .slides").slick({
			rtl: rtl_slick(),
	        infinite: true,
	        speed: 600,
	        fade: true,
			adaptiveHeight: true,
	        prevArrow: '<div class="slick-prev"><i class="icon usn_ion-ios-arrow-back"></i>',
	        nextArrow: '<div class="slick-next"><i class="icon usn_ion-ios-arrow-forward"></i>'
		});

	    // SCROLL PROMPT
	    // 3 DIFFERENT VERSIONS
	    // ACCOUNTS FOR DIFFERENT OFFSETS DEPENDING:
	    // SCREEN WIDTH &/OR HEADER SHOWN
	    $('html:not(.mobile-width) body:not(.no-header) .scroll-prompt').click(function() {
	        var target;
	        $("section").next().each(function(i, element) {
	            target = ($(element).offset().top + 1);
	            if (target - 10 > $(document).scrollTop()) {
	                return false; // break
	            }
	        });
	        $("html, body").animate({
	            scrollTop: target
	        }, 600);
	    });
	    $('html.mobile-width body:not(.no-header) .scroll-prompt').click(function() {
	        var target;
	        $("section").next().each(function(i, element) {
	            target = ($(element).offset().top - 59);
	            if (target - 10 > $(document).scrollTop()) {
	                return false; // break
	            }
	        });
	        $("html, body").animate({
	            scrollTop: target
	        }, 600);
	    });
	    $('html body.no-header .scroll-prompt').click(function() {
	        var target;
	        $("section").next().each(function(i, element) {
	            target = ($(element).offset().top - 0);
	            if (target - 10 > $(document).scrollTop()) {
	                return false; // break
	            }
	        });
	        $("html, body").animate({
	            scrollTop: target
	        }, 600);
		});

		// Anchor Navigation
		// NEED TO FIX OFFSET FOR HEADER
		var sections = $('section'), 
		nav = $('.anchors-component'), 
		anchor_nav_height = $('.anchors-component').outerHeight()
		nav_height = $('header#site-header').outerHeight();
		nav_heightShort = $('header#site-header').outerHeight() / 2;
		$(window).on('scroll', function () {
			var cur_pos = $(this).scrollTop();
			sections.each(function() {

			var top = $(this).offset().top - anchor_nav_height,
				bottom = top + $(this).outerHeight();

			if (cur_pos >= top && cur_pos <= bottom) {
				nav.find('a').removeClass('active');
				sections.removeClass('active');
				
				$(this).addClass('active');
					nav.find('a[href="#'+$(this).attr('id')+'"]').addClass('active');
				}
			});
		});
		nav.find('a').on('click', function () {
			var $el = $(this), 
			href = $(this).attr('href');
			$(".anchors-component .expand").removeClass('anchor-active');
			$(".anchors-component nav").removeClass('open-mobile');
				$('html, body').animate({
					scrollTop: $(href).offset().top - anchor_nav_height
				}, 500);
			return false;
		});

	});

	// LIGHTBOX
	$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
	    event.preventDefault();
	    $(this).ekkoLightbox();
	});

	// HEADER SCROLLING
	var didScroll;
	var lastScrollTop = 0;
	var delta = 60;
	var navbarHeight = $('header').outerHeight();

	// FIXED HEADER
	$(window).scroll(function(event) {
	    didScroll = true;
	    var scroll = $(window).scrollTop();
	    if (scroll >= 60) {
	        $("html").removeClass("reached-top");
	    } else {
	        $("html").addClass("reached-top").removeClass("nav-down").removeClass("nav-up");
	    }
	});
	setInterval(function() {
	    if (didScroll) {
	        hasScrolled();
	        didScroll = false;
	    }
	}, 5);

	function hasScrolled() {
	    var st = $(this).scrollTop();
	    // Make sure they scroll more than delta
	    if (Math.abs(lastScrollTop - st) <= delta)
	        return;
	    if (st > lastScrollTop && st > navbarHeight) {
	        // Scroll Down
	        $('html').removeClass('nav-down').addClass('nav-up');
	    } else {
	        // Scroll Up
	        $('html').addClass('nav-down').removeClass('nav-up');
	    }
	    lastScrollTop = st;
	}

	// COOKIE NOTICE FUNCTION
	function cookiePolicy() {
        var cookiePanel = $('.usn-notification'),
	        cookieName = "cookieNotice";

	    checkCookie();

	    $('.accept-cookies').on('click', function(e) {
	        e.preventDefault();
	        setCookie();
	    });

	    // Get cookie
	    function getCookie(c_name) {

	        var i, x, y, ARRcookies = document.cookie.split(";");
	        for (i = 0; i < ARRcookies.length; i++) {
	            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
	            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
	            x = x.replace(/^\s+|\s+$/g, "");
	            if (x == c_name) {
	                return unescape(y);
	            }
	        }

	    }

	    // Set cookie
	    function setCookie() {

	        var exdate = new Date();
	        exdate.setDate(exdate.getDate() + exdays);
	        var c_value = "accepted" + ((exdays == null) ? "" : "; path=/; expires=" + exdate.toUTCString());
	        document.cookie = cookieName + " =" + c_value;
	        cookiePanel.addClass("closed");
	        cookiePanel.removeClass("open");
	    }

	    // Check cookie
	    function checkCookie() {

	        var username = getCookie(cookieName);
	        if (username != null && username != "") {
	            cookiePanel.addClass("closed");
	            cookiePanel.removeClass("open");
	        } else {
	            cookiePanel.addClass("open");
	            cookiePanel.removeClass("closed");
	        }

	    }

	};

	// jQuery plugin to prevent double submission of forms
	jQuery.fn.preventDoubleSubmission = function() {

	    $(this).on('submit', function(e) {

	        e.preventDefault();

	        var $form = $(this);

	        if ($form.data('submitted') === true) {
	            // Previously submitted - don't submit again
	        } else {
	            if ($form.valid()) {
	                // Mark it so that the next submit can be ignored
	                $form.data('submitted', true);

	                /*show loader*/
	                $form.find(".ajax-loading").show();

	                // Make ajax call form submission
	                $.ajax({
	                    url: $form.attr('action'),
	                    type: 'POST',
	                    cache: false,
	                    data: $form.serialize(),
	                    success: function(result) {

	                        var thankYouMessage = $form.find('input[name="umbraco_submit_message"]').val();

	                        $form.find('.form-container').html("<div class='umbraco-forms-submitmessage alert alert-success' role='alert'>" + thankYouMessage + "</div>");
	                        $form.find(".ajax-loading").hide();
	                    },
	                    error: function() {
	                        /*hide loader*/
	                        $form.find(".ajax-loading").hide();
	                        $form.find('.UmbracoFormMessage').html("<div class='alert alert-danger alert-dismissible text-center'>An error occured. Please try again.</div>");
	                    }
	                });
	            }
	        }

	    });

	    // Keep chainability
	    return this;
	};