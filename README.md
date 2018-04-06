# Tiled Photo Gallery by Tayfun Sertan Yaman

A responsive, animated jquery photo gallery plugin which arranges your photos in tiled rows, supports photo previews, infinite scroll, swipe navigation for mobile devices, CSS3 animations and ajax server side image loading.

## Getting Started

For a demo of how plugin works, check: http://www.sertanyaman.com/PhotoGallery.cshtml?mode=vitrine

### Installing

Download the script and its CSS file from the 'src' folder and HTML template from src\html folder. Add the 3rd party plugins listed below. Check the page structure plugin uses in the provided HTML template to get started. 

You need to write a server-side ajax photo feeder (for infinite scrolling and thumbnail loading) and a photo loader (for loading full sized photos when you click on the thumbnails or navigating) for plugin to work properly. See the examples in the 'example' folder, there is a fully working ASP.NET Web Pages example with instructions.

Alternatively you can modify the script to work in non-dynamic HTML pages and add all your photos like shown in the template.

For more information on installation and the examples provided about the library, visit my blog post at :

http://devblog.sertanyaman.com/

### 3rd party libraries

Tiled Photo Gallery needs the following 3rd party plugins and libraries, for usage of those see template HTML in src\html folder:

```
Web Font Loader v1.6.6 - (c) Adobe Systems, Google. License: Apache 2.0 https://github.com/typekit/webfontloader
waitForImages jQuery Plugin by Alexander Dickson https://github.com/alexanderdickson/waitForImages
modernizr 3.1.0 (Custom Build) - https://modernizr.com/
jquery.transit plugin by Rico Sta. Cruz  https://github.com/rstacruz/jquery.transit
TouchSwipe-Jquery-Plugin by Matt Bryson https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
```

## Authors

* **Tayfun Sertan Yaman** - *Initial work* - [sertanyaman](https://github.com/sertanyaman)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Built With

* [JQuery](https://jquery.com/)
* [Web Font Loader](https://github.com/typekit/webfontloader)
* [waitForImages](https://github.com/alexanderdickson/waitForImages)
* [modernizr](https://modernizr.com/)
* [jquery.transit](https://github.com/rstacruz/jquery.transit)
* [TouchSwipe-Jquery-Plugin](https://github.com/mattbryson/TouchSwipe-Jquery-Plugin)

## Other references

Tiled Photo Gallery benefits from the following scripts provided by 3rd party developers:

Debouncing function from John Hann http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
CSS fadein fadeout code example by Tom Roggero http://stackoverflow.com/questions/5587392/can-jquerys-fadein-and-fadeout-be-tweeked-to-use-css-transitions



