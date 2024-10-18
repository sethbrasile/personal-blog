---
title: 'Understanding Googles Page Speed Guidelines'
date: 2014-08-16T15:54:37-05:00
draft: false
tags: [google, pagespeed, speed, performance, old content rescued with the wayback machine]
note: 'This article was written on a muuuuch older blog many moons ago and was rescued via the wayback machine and migrated to this blog. The original article is linked at the wayback machine at the bottom of this article.'
---

I've been struggling with understanding exactly what Google's "PageSpeed Insights" wanted from me for a long time.

I searched for and read many guides, as well as the documentation that Google provides, and I always felt like my sites should be meeting their expectations, but that "Prioritize Visible Content" warning always got me!

It seemed like ridding myself of those warnings was an unreachable goal.

That is, until I read this guide by Patrick Sexton

It's all stuff that I already knew, but the actual implementation never "clicked" in my brain like this until now.

I don't think I could even improve upon it so just...

### Read it...

## Update:

I now successfully have a 98/100 for both mobile and desktop from Google's PageSpeed Insights!

If you're interested in how, I'll explain what I did.

## CSS Files

I started by identifying which CSS rules were important to render my header, navbar, general site layout, etc... because those are the only CSS rules that matter for the initial page load.

I cut those rules, one at a time, out of my stylesheet and added them inline to the `<head>` of my "default.hbs" template (if you don't know what a handlebars template is, that's a topic for another time. Just know that what I did was the equivalent of adding the rules to each html `<head>`).

**Please keep in mind** that CSS considers inline styles more important than stylesheet styles, so if you previously had rules that were purposely overriding eachother with CSS' specificity rules, you may end up having to add something like !important to certain rules in your stylesheet to keep those styles active. This sucks because I don't like using !important, but in this specific case, I don't see any way around it without removing the CSS library I'm using (and I don't want to remove it because I like it very much :D).

I cut my stylesheet and font calls completely out of my `<head>`, then at the bottom of my `<body>` I used inline javascript inside a `<script>` tag to call the rest of my css and fonts after the page is done loading.

This code snippet comes from google

```javascript
var cb = function() {
  var l = document.createElement('link'); l.rel = 'stylesheet';
  var f = document.createElement('link'); f.rel = 'stylesheet';
  var d = document.createElement('link'); d.rel = 'stylesheet';
  var o = document.createElement('link'); o.rel = 'stylesheet';
  o.href = '//fonts.googleapis.com/css?family=Open+Sans:600,300';
  d.href = '//fonts.googleapis.com/css?family=Droid+Serif';
  f.href = '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css';
  l.href = '/assets/stylesheets/xpressio.css';
  var h = document.getElementsByTagName('head')[0];

  h.parentNode.insertBefore(o, h);
  h.parentNode.insertBefore(l, h);
  h.parentNode.insertBefore(f, h);
  h.parentNode.insertBefore(d, h);
};

var raf = requestAnimationFrame || mozRequestAnimationFrame || webkitRequestAnimationFrame || msRequestAnimationFrame;

if (raf) raf(cb);
else window.addEventListener('load', cb);
```

For each resource, we're creating a DOM link element (I decided to call 'Open Sans', "o" and 'Font-Awesome', "f", etc..) setting it's rel attribute to stylesheet, setting it's href attribute, then using insertBefore to inject it into the DOM.

We're basically using javascript to construct and inject:

`<link rel='stylesheet' href='/path/to/stylesheet.css'>`

Note: I thought about using an array and a loop since google's example was only calling one resource and I was calling many, but then I decided, ".......naahhh" and moved on.

## Javascript Files

The idea here is very similar to how we handled the CSS files, but a little easier since we shouldn't have to bother with identifying which bits are important to render the initial page load.

You may be in a different boat, and have javascript involved in the initial page load. If so, follow the same path as you did with CSS and identify the important bits and inline them. My only suggestion would be to avoid using jQuery (or other libraries) for this and try to stick to plain javascript, that way you don't have to load a library to render your page. Keep in mind that this may put you in a bit of a pickle... Make sure to test in different browsers to make sure it's going to behave before you move on.

After you've got your initial page load all set, we're going to pop some javascript into the same inline script tag that calls our css files.

Google (and Patrick Sexton) suggest this:

```javascript
<script type="text/javascript">
  function downloadJSAtOnload() {
    var element = document.createElement("script");
    element.src = "defer.js";
    document.body.appendChild(element);
  }
  if (window.addEventListener)
    window.addEventListener("load", downloadJSAtOnload, false);
  else if (window.attachEvent)
    window.attachEvent("onload", downloadJSAtOnload);
  else window.onload = downloadJSAtOnload;
</script>
```

But I don't like that because it doesn't easily allow you to run code in a specific order. Now you may be a javascript "Ninja" and look at that code and know exactly how to use it to load multiple files sequentially, but I am not a javascript "Ninja" (yet).

So I used this instead:

```javascript
function getScript(url,success) {
  var script=document.createElement('script');
  script.src=url;
  var head=document.getElementsByTagName('head')[0],
      done=false;
  script.onload=script.onreadystatechange = function(){
    if ( !done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') ) {
      done=true;
      success();
      script.onload = script.onreadystatechange = null;
      head.removeChild(script);
    }
  };
  head.appendChild(script);
}
  getScript('https://code.jquery.com/jquery-2.1.1.min.js',function(){
  getScript('/assets/js/jquery.ghostHunter.min.js',function() {
    $("#search-field").ghostHunter({
      results   : "#results"
    });
  });
});

getScript('//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-xxxxxxxxxx', function(){});
```

We're defining a function called getScript() (NOT jQuerys getScript() because jQuery isn't loaded yet), then using it to call our scripts in the order of our choosing. I needed jQuery to load ahead of certain things so:

```javascript
getScript('https://code.jquery.com/jquery-2.1.1.min.js',function(){
  // Code that you want to execute after jQuery is loaded
});
```

The finished script tag, inserted right before </body> looks like this:

```javascript
<script type="text/javascript">
  function getScript(url,success) {
    var script=document.createElement('script');
    script.src=url;
    var head=document.getElementsByTagName('head')[0],
        done=false;
    script.onload=script.onreadystatechange = function(){
      if ( !done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') ) {
        done=true;
        success();
        script.onload = script.onreadystatechange = null;
        head.removeChild(script);
      }
    };
    head.appendChild(script);
  }

  getScript('https://code.jquery.com/jquery-2.1.1.min.js', function(){
   getScript('/assets/js/jquery.ghostHunter.min.js', function() {
     $("#search-field").ghostHunter({
       results   : "#results"
     });
   });
  });

  getScript('//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-xxxxxxxxxxx', function(){});

  var cb = function() {
    var l = document.createElement('link'); l.rel = 'stylesheet';
    var f = document.createElement('link'); f.rel = 'stylesheet';
    var d = document.createElement('link'); d.rel = 'stylesheet';
    var o = document.createElement('link'); o.rel = 'stylesheet';
    o.href = '//fonts.googleapis.com/css?family=Open+Sans:600,300';
    d.href = '//fonts.googleapis.com/css?family=Droid+Serif';
    f.href = '//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css';
    l.href = '/assets/stylesheets/xpressio.css';
    var h = document.getElementsByTagName('head')[0]; h.parentNode.insertBefore(o, h); h.parentNode.insertBefore(l, h); h.parentNode.insertBefore(f, h); h.parentNode.insertBefore(d, h);
  };
  var raf = requestAnimationFrame || mozRequestAnimationFrame ||
      webkitRequestAnimationFrame || msRequestAnimationFrame;
  if (raf) raf(cb);
  else window.addEventListener('load', cb);
</script>
```


This article was rescued via the wayback machine:

https://web.archive.org/web/20150224224419/http://sethbrasile.geekedout.biz/understanding-googles-page-speed-guidelines
