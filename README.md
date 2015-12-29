HandSketch - HCI Class Final Project
====================================

License
=======
The project is licensed under GPL 3. See [LICENSE](/LICENSE) file for the full
license. 

3rd party libs
==============
 
| Library | Authors or maintainers | Licence | Link |
|---------|:----------------------:|:-------:|:----:|
| jQuery  | jQuery foundation | [jQuery](https://github.com/jquery/jquery/blob/master/LICENSE.txt) | https://jquery.com/ |
| bootstrap | Mark Otto, Jacob Thornton, core team | MIT | http://getbootstrap.com/ |
| bootstrap submenu | Vasily A. | MIT | [GitHub project](https://github.com/vsn4ik/bootstrap-submenu) |

File and plugins handling
=========================

```
HandSketch
|
+--LICENSE
+--README.md
+--HandSketch.html
|
+--bootstrap
|  +--*bootstrap libraries*
|
+--bootstrap-plugins
|  +--*plugin_name*
|      +--css
|      +--js
|
+--js
|  +--main.js
|  +--*other js written by us*
|
+--css
|  +--*css written by us*
```

Bootstrap plugins should go under bootstrap-plugins. When you download a plugin it should have a *dist* folder that contains js and css subfolders.
Check that the folder structure of the plugins is like that and then put the dist folder under bootstrap-plugins and rename it to the plugin_name.


If you don't find a dist folder take the relevant js and css files and create the needed structure by yourself or ask for help.


Javascript functions written by us should go in main.js file or in a file in the js folder.


CSS files should go in the CSS folder.


HTML code should be integrated in the HandSketch.html file itself.

Code conventions
================
Comment your code in a way that everybody can understand what's happening or, if you find it more motivating, as if the person who ends up maintaining your code is a violent psychopath who knows where you live.

The indentation is of 4 spaces (convert tab to spaces in your code).

Keep it simple and try to not reinvent the weel.
