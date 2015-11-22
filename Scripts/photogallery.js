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
var acceptableHeight =  220;
var maxHeight =400;
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
            var imgwidth = parseInt($image.attr("img-width")) + photomargin * 2;
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

            while (localwidth < galleryWidth)
            {
                localwidth += rowwidths[imgindex];

                if (localwidth < galleryWidth) {
                    totalwidth = localwidth;
                    imgindex++
                }
                else if(imgindex == indexstart)
                    {
                        totalwidth = galleryWidth;
                        imgindex++;
                    }
               

                if(imgindex >= photoids.length)
                {
                    break;
                }
            }

            if (!((imgindex >= photoids.length) && (totalwidth < galleryWidth))) {

                var ratio = (galleryWidth / totalwidth);
            }
            else
            {
                ratio = 1;
            }

            curheight = Math.min(Math.floor(curheight * ratio), maxHeight);
        
            totalwidth = 0;
            var i = 0;

            for(i = indexstart; i<imgindex;i++)
            {
                var curid = photoids[i];
                var curwidth = rowwidths[i];
                var $curbox = $container.find("div[img-id='"+curid+"']");

                curwidth = Math.floor(curwidth * ratio);

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


    $container.on("click",".photo-box-link",
        function (event) {
            event.preventDefault();
            var $this = $(this);
            var photoid = $this.attr("img-id");

            openViewer();
            showPhotoOverlay();
            loadPhoto(photoid);            
        }
    );

    function positionPhoto($image)
    {
        var $photoinfo = $("#photo-info");
                
        var $photocontainer = $("#photocontainer");
        var containerheight = $photocontainer.outerHeight();
        var totalheight = $image.outerHeight() + $photoinfo.outerHeight();

        var padding = 0;
        if (totalheight < containerheight) {
            padding = Math.round(containerheight / 2) - Math.round(totalheight / 2);
        }

        $photocontainer.css("padding-top", padding);
        $photoinfo.css('max-width', $image.outerWidth());
    }

    function loadPhoto(photoid)
    {
        $.ajax({
            type: 'GET',
            url: "http://lorempixel.com/400/200/" + photoid,
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

    function closeViewer()
    {
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
                showPhotoOverlay();
                loadPhoto(photoid);
            }
        }

        event.stopPropagation();
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

    $.event.trigger({
        type : "galleryloaded"
    });

    //Set acceptables
    acceptableHeight = ((mode === "album") || (mode === "galleries")) ? 420 : 220;
    maxHeight = ( (mode === "album") || (mode === "galleries"))? 420 : 400;

});


    