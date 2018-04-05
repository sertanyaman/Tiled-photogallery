/*!
 * Tile Photogallery v1.0
 * Tiled photogallery with photo preview
 * http://www.sertanyaman.com
 * MIT License
 * by Tayfun Sertan Yaman
 */
var $container;
var galleryWidth;
var scrollbarwidth;
var acceptableHeight =  150;
var maxHeight =300;
var rowcount = 0;
var rowheight = [];
var photomargin = 5;
var nextpagetriggered = false;
var minWidth = 320;
var prevWidth = 0;
var idCounter = 0;
var vieweropen = false;
var curphotoid = 0;



function triggerGallery() {
   
    if (!$container) {
        return;
    }

    // init sizer
    $container.waitForImages(function () {
        $("#albumloader").hide();
        loading = true;
        nextpagetriggered = false;
        renderGallery();
    });
}

// trigger masonry when fonts have loaded
WebFont.load({
    active: triggerGallery,
    inactive: triggerGallery
});

///SERTAN Photo gallery

function renderGallery()
{
    rowcount = 1;
    rowheight = [];
    var $images = $container.find(".photo-box");  
    placeinGallery($images, true);
}

//scrollbar
function getScrollBarWidth() {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) w2 = outer.clientWidth;

    document.body.removeChild(outer);

    return (w1 - w2);
};

//Place them in gallery
function placeinGallery($images, reset)
{
    var d = $.Deferred();
    galleryWidth = Math.max($container.innerWidth(), minWidth);
    scrollbarwidth = getScrollBarWidth();

    prevWidth = galleryWidth;

    if (!vieweropen && ($container.height() <= $(window).height())) {
        if (galleryWidth == $("body").width())
            galleryWidth = galleryWidth - scrollbarwidth
    }

    var currow = rowcount;
    var curheight = 0;

    if(rowheight[rowcount]!== undefined && rowheight[rowcount]!== 0){
        curheight = rowheight[rowcount];
    } 
    else{
        curheight = acceptableHeight;
        rowheight[rowcount] = curheight;
    }

    var rowwidths = [];
    var photoids = [];
    var index = 0;

    //Get inventory
    if (!reset) {
        var $previmages = $container.find(".photo-box[img-row='" + rowcount + "']");
        $previmages.each(function () {
            var $image = $(this);
            var imgwidth = parseInt($image.attr("img-width"));// + photomargin * 2;
            var imgheight = parseInt($image.attr("img-height"));
            var photoid = $image.attr("img-id");

            if (imgheight != curheight) {
                imgwidth = Math.floor(imgwidth * (curheight / imgheight));
            }

            rowwidths.push(imgwidth);
            photoids.push(photoid);
        });
    }
    
    $images.each(function(){
        var $image = $(this);
        var imgwidth = parseInt($image.attr("img-width"));
        var imgheight = parseInt($image.attr("img-height"));
        var photoid = $image.attr("img-id");

        if(imgheight!= curheight)
        {
            imgwidth = Math.floor(imgwidth * (curheight / imgheight));
        }

        rowwidths.push(imgwidth);
        photoids.push(photoid);
    });

    //place in rows
    var imgindex = 0;

        while(imgindex < photoids.length)
        {
            var totalwidth=0, localwidth=0;
            var indexstart = imgindex;

            var ratiox = 1;
            var ratioy = 1;

            while (localwidth < galleryWidth)
            {
                localwidth += rowwidths[imgindex];

                if (localwidth < galleryWidth) {
                    totalwidth = localwidth;
                    imgindex++
                }
                else
                if (imgindex == indexstart)
                {
                    totalwidth = galleryWidth;
                    ratioy = (galleryWidth / localwidth);
                    imgindex++;
                }               

                if(imgindex == photoids.length)
                {
                    break;
                }
            }
        
            if (!((imgindex == photoids.length) && (totalwidth < galleryWidth))) {
                var ratiox = (galleryWidth / totalwidth);
            }
     
            if (ratioy == 1)//No override
            {
                ratioy = ratiox;
            }            
               
            curheight = Math.min(Math.floor(curheight * ratioy), maxHeight);
        
            totalwidth = 0;
            var i = 0;

            for(i = indexstart; i<imgindex;i++)
            {
                var curid = photoids[i];
                var curwidth = Math.min(rowwidths[i], galleryWidth);
                var $curbox = $container.find("div[img-id='"+curid+"']");

                curwidth = Math.floor(curwidth * ratiox);

                $curbox.css("width", curwidth+"px");
                $curbox.css("height", curheight+"px");
                $curbox.css("display", "block");
                $curbox.attr("img-row", rowcount);
                $curbox.css("transition-delay");
                $curbox.css("transition-delay", i/4 + "s");
                $curbox.css("opacity", 1);

                totalwidth+=curwidth;            
            }

            rowheight[rowcount] = curheight;
            if (imgindex < photoids.length)
                rowcount++;
            curheight = acceptableHeight;
        }

        setTimeout(function () {
            loading = false;
            nextpagetriggered = false;
            d.resolve();
            $(document).trigger("galleryloaded");
        }
        , (((imgindex) / 4) + 0.5) * 1000);
        
}

function loadMore(url, page, maxphotos, callback) {
    var request = {
        page: page,
        maxphotos: maxphotos
    };

    $.ajax({
        type: "POST",
        url: url,
        datatype: "html",
        data: request,
        cache: true,
        async: true,
        success: function (data) {
            callback(data);
        },
        fail:
            function () {
                callback("");
            }
    });
}

$(window).load(function () {
    $('body').scrollTop(0);
    triggerGallery();
});


$(document).ready(function () {
    $container = $("#photo-list");
    var swipeOptions = {
        triggerOnTouchEnd: true,
        swipeStatus: onSwipe,
        allowPageScroll: "vertical",
        threshold: 75,
        fingers: 1,
        excludedElements: "select, textarea, .noSwipe"
    };
    
    $("#albumloader").show();

    (function ($, sr) {

        // debouncing function from John Hann
        // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
        var debounce = function (func, threshold, execAsap) {
            var timeout;

            return function debounced() {
                var obj = this, args = arguments;
                function delayed() {
                    if (!execAsap)
                        func.apply(obj, args);
                    timeout = null;
                };

                if (timeout)
                    clearTimeout(timeout);
                else if (execAsap)
                    func.apply(obj, args);

                timeout = setTimeout(delayed, threshold || 100);
            };
        }
        // smartresize 
        jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

    })(jQuery, 'smartresize');

    var hasCSSTransitions = Modernizr.csstransitions;

    hasCSSTransitions && (function ($) {
        $.fn.fadeIn = function (speed, easing, callback) {
            return this.filter(function (i, elem) {
                return $.css(elem, 'display') === 'none' || !$.contains(elem.ownerDocument, elem);
            })
                        .css('opacity', 0)
                        .show()
                        .end()
                    .transition({
                        opacity: 0.85
                    }, speed, easing, callback);
        };

        $.fn.fadeOut = function (speed, easing, callback) {
            var newCallback = function () {
                $(this).hide();
            };

            // Account for `.fadeOut(callback)`.
            if (typeof speed === 'function') {
                callback = speed;
                speed = undefined;
            }

            // Account for `.fadeOut(options)`.
            if (typeof speed === 'object' && typeof speed.complete === 'function') {
                callback = speed.complete;
                delete speed.complete;
            }

            // Account for `.fadeOut(duration, callback)`.
            if (typeof easing === 'function') {
                callback = easing;
                easing = undefined;
            }

            if (typeof callback === 'function') {
                newCallback = function () {
                    $(this).hide();
                    callback.apply(this, arguments);
                };
            }

            return this.transition({
                opacity: 0
            }, speed, easing, newCallback);
        };
    }(jQuery));

    function scrollLoadMore(event, callback) {
        loading = true;
        page++;
        loadMore(feedurl, page, maxphotos, function (html) {
            $("#albumloader").hide();
            var $html = $(html);

            if (html.trim() != "") {
                $("#photo-list").append($html);

                if (typeof callback != 'undefined') {
                    callback();
                }

                $("#photo-list").waitForImages({
                    finished: function () {
                        var $images = $html.find(".photo-box");
                        placeinGallery($images, false);
                        
                    },
                    waitForAll: true
                });
            }

        });
    }

  
    $(window).smartresize(function(){
        var myId=(++idCounter);
        setTimeout(function(){
            if(myId===idCounter){
                var containerwidth = $container.innerWidth();

                if (containerwidth < minWidth) return;

                if ((containerwidth < prevWidth) || (containerwidth > prevWidth)) {
                    renderGallery();
                }

                if(vieweropen)
                {
                    positionPhoto($("#viewer"));
                }
            }
        }, 100);
                
    }); 

    $(window).scroll(function () {
        if (page < pagetotal) {
            var criticalpos = ($(document).height() - $(window).height() - $("footer").height());
            var currentpos = $(window).scrollTop();
            if (currentpos != 0 && currentpos > criticalpos) {


                $("#albumloader").show();

                if (!loading) {
                    loading = true;
                    scrollLoadMore();
                }
                else {
                    if (!nextpagetriggered) {
                        $(document).one("galleryloaded", scrollLoadMore);
                        nextpagetriggered = true;
                    }
                }

            }
        }
    });

    $(document).keyup(function (event) {
        if (!event)
            event = window.event;
        var code = event.keyCode;
        if (event.charCode && code == 0)
            code = event.charCode;

        switch (code) {
            case 37:
                $("#view-container-leftnav").click();
                event.preventDefault();
                break;
            case 38:
                // Key up.
                break;
            case 39:
                $("#view-container-rightnav").click();
                event.preventDefault();
                break;
            case 40:
                // Key down.
                break;
            case 27:
                closeViewer();
                event.preventDefault();
                break;
        }

    });

    $(document).swipe(swipeOptions);

    function endSwipe() {
        $("#photocontainer").css({
            '-webkit-transform': 'none',
            '-moz-transform': 'none',
            '-ms-transform': 'none',
            '-o-transform': 'none',
            'transform': 'none'
        });
    }

    function onSwipe(event, phase, direction, distance) {
        if (vieweropen) {
            var $photocontainer = $("#photocontainer");

            if (phase == "move" && (direction == "left" || direction == "right")) {
                var duration = 0;


                if (direction == "left") {
                    $photocontainer.css({
                        '-webkit-transform': 'translateX(-' + distance + 'px)',
                        '-moz-transform': 'translateX(-' + distance + 'px)',
                        '-ms-transform': 'translateX(-' + distance + 'px)',
                        '-o-transform': 'translateX(-' + distance + 'px)',
                        'transform': 'translateX(-' + distance + 'px)'
                    });
                } else if (direction == "right") {
                    $photocontainer.css({
                        '-webkit-transform': 'translateX(' + distance + 'px)',
                        '-moz-transform': 'translateX(' + distance + 'px)',
                        '-ms-transform': 'translateX(' + distance + 'px)',
                        '-o-transform': 'translateX(' + distance + 'px)',
                        'transform': 'translateX(' + distance + 'px)'
                    });
                }

            } else if (phase == "cancel") {
                endSwipe();
            } else if (phase == "end") {
                endSwipe();

                if (direction == "right") {
                    $("#view-container-leftnav").click();
                } else if (direction == "left") {
                    $("#view-container-rightnav").click();
                }
            }
        }
    }


    $container.on("click",".photo-box-link",
        function (event) {
            var $this = $(this);

            event.preventDefault();

            var photoid = $this.attr("img-id");

            openViewer();
            showPhotoOverlay();
            loadPhoto(photoid);
        }
    );

    function positionPhoto($image)
    {
        endSwipe();

        var $photoinfo = $("#photo-info");
        var $protect = $("#protect");
        var $videoplay = $("#videoplay");
        var $videoviewer = $("#video-view");
                
        var $photocontainer = $("#photocontainer");
        var containerheight = $photocontainer.outerHeight();
        $photocontainer.css("padding-top", 0);
        var totalheight = $image.outerHeight() + $photoinfo.outerHeight();

        var padding = 0;
        if (totalheight < containerheight) {
            padding = Math.round(containerheight / 2) - Math.round(totalheight / 2);
        }

        $image.css('max-height', containerheight - $photoinfo.outerHeight());

        $photocontainer.css("padding-top", padding);
        $photoinfo.css('max-width', $image.outerWidth());

        $protect.css('margin-top', padding);
        $protect.css('max-height', $image.outerHeight());

        $videoplay.css('margin-top', padding);
        $videoplay.css('max-height', $image.outerHeight());

        $videoviewer.css('margin-top', padding);
        $videoviewer.css('max-height', $image.outerHeight());
        $videoviewer.css("max-width", $image.outerWidth());
        $videoviewer.css("margin-right", $image.css("margin-right"));
        $videoviewer.css("margin-left", $image.css("margin-left"));
    }

    function loadPhoto(photoid)
    {
        $.ajax({
            type: 'GET',
            url: "PhotoLoader.cshtml?photoid=" + photoid,
            datatype: 'json',
            cache: true
        }).done(function (data) {
            curphotoid = photoid;

            $('#viewer').attr('src', data.path).one("load", function () {
                var $this = $(this);
                $("#photoloader").hide();
                $("#view-container").show();
                $this.show();
                //write image data
                $('#name').text(data.name);
                $('#camera').text(data.camera);
                $('#lens').text(data.lens);
                $('#aperture').text(data.aperture);
                $('#shutter').text(data.shutter);
                $('#iso').text(data.iso);
                $('#date').text(data.datetaken);
                $('#hits').text(data.hits);
                $('#desc').text(data.description);
                $('#place').text(data.place);

                if (data.hasstock == "1")
                {
                    $('#hasstock').show();
                }
                else
                {
                    $('#hasstock').hide();
                }

                if (albumid === 0)
                {
                    var $link = $("#albumlink");

                    $link.attr("href", "PhotoGallery.cshtml?album=" + data.albumid);
                    $link.text(data.albumname);

                    $("#albuminfo").show();

                }
                else
                {
                    $("#albuminfo").hide();
                }

                if (data.videoid != "") {
                    $("#videoplay").show();
                    $("#videolink").attr("video-id", data.videoid);
                }
                else {
                    $("#videoplay").hide();
                }

                //positioning
                positionPhoto($this);
                         

                //Show
                $("#view-container-overlay").fadeOut(200);
        });
        }).fail(function () {
            closeViewer();
        }
        );  

    }

    function showPhotoOverlay()
    {
        //$("#view-container-overlay").fadeIn(200);
        $("#photoloader").show();
    }

    function closeVideo()
    {
        var $video = $("#video-view");
        $video.attr("src", "");
        $video.hide();
    }

    function closeViewer()
    {
        $("videoplay").hide();
        closeVideo();
        $("#overlay").fadeOut(400);
        $("#view-container").hide();
        $("body").css("overflow", "auto");
        vieweropen = false;
        renderGallery();
    }

    function openViewer()
    {
        $("#overlay").fadeIn(400);
        $("body").css("overflow", "hidden");
        $("#view-container").hide();
        vieweropen = true;
    }



    function openVideoViewer(videoid)
    {
        var $video = $("#video-view");
        var $view = $('#viewer');
        var embedlink = youtubeembed;

        //$video.css("max-width", $view.outerWidth());
        //$video.css("max-height", $view.outerHeight());
        //$video.css("margin-right", $view.css("margin-right"));
        //$video.css("margin-left", $view.css("margin-left"));

        $video.attr("src", embedlink.replace("{0}", videoid));

        $video.show();

    }

    

    $("#overlay").click(function () {
        closeViewer();
    });

    $("#view-container").click(function () {
        closeViewer();
    });
            
    $("#close-button").click(function () {
        closeViewer();
    });

    $("#view-container-rightnav").click(function (event) {
            var $this = $(this);
            var $next = $container.find("li[img-id=" + curphotoid + "]").next("li");

            if ($next.length !=0) {
                var photoid = $next.attr("img-id");
                if (photoid != 0) {
                    closeVideo();
                    showPhotoOverlay();
                    loadPhoto(photoid);
                }
            }
            else
            {
                scrollLoadMore(null, function(){
                    $this.click();
                });
            }
            event.stopPropagation();

    });

    $("#view-container-leftnav").click(function (event) {
        var $this = $(this);
        var $prev = $container.find("li[img-id=" + curphotoid + "]").prev("li");

        if ($prev.length != 0) {
            var photoid = $prev.attr("img-id");
            if (photoid != 0) {
                closeVideo();
                showPhotoOverlay();
                loadPhoto(photoid);
            }
        }
        event.stopPropagation();
    });

    $.event.trigger({
        type : "galleryloaded"
    });

    $("#videolink").click(
        function (event) {
            var $this = $(this);

            event.preventDefault();

            var videoid = $this.attr("video-id");

            openVideoViewer(videoid);

            event.stopPropagation();
        });

    //Set acceptables
    acceptableHeight = ((mode === "album") || (mode === "galleries")) ? 420 : 270;
    maxHeight = ( (mode === "album") || (mode === "galleries"))? 420 : 400;

});


    