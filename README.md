# HandSketch - HCI Class Final Project

# Team members
+ [fcole90](https://github.com/fcole90)
+ [flamel13](https://github.com/flamel13)
+ [HichamL](https://github.com/HichamL)
+ [m-pilia](https://github.com/m-pilia)

# Compile and run
Just make the application, running on the command line (requires `make` and `awk`):
```bash
make
```
and then open the resulting file `HandSketch.html` with your web browser.

# Contributing
## File and plugins handling

```
HandSketch
|
+--LICENSE
+--README.md
|
+--lib
|  +--jquery
|     +--jquery.min.js
|
|  +--bootstrap
|     +--*bootstrap libraries*
|
|  +--bootstrap-plugins
|      +--*plugin_name*
|         +--css
|         +--js
|  +--*other libraries*
|
+--html
|  +--main.html
|  +--*othen html files for page components*
|
+--js
|  +--*custom js scripts*
|
+--css
|  +--*custom css stylesheets*
```

### Libs
All the third party libraries should go under the lib folder. Bootstrap plugins should go under bootstrap-plugins. When you download a plugin it should have a *dist* folder that contains js and css subfolders. Check that the folder structure of the plugins is like that and then put the dist folder under bootstrap-plugins and rename it to the plugin_name. If you don't find a dist folder take the relevant js and css files and create the needed structure by yourself or ask for help.

### HTML
HTML code is divided into different files inside the html folder, one file for each relevant component of the UI. The main page is in the html/main.html file. The other files are included inside it with a preprocessing program. To include a component into the main page, place the code `<!-- #include file_name.html -->` inside the main.html file, in the appropriated position. To preprocess, launch the makefile: the HandSketch.html page will be compiled and put into the root folder of the project.

### JavaScript
Custom JavaScript functions should go inside a file in the js folder. Keep the functions which are related to an html component grouped into a file with a consistent name.

### CSS
Custom CSS stylesheet files should go into the css folder.

## Style conventions
Comment your code in a way that everybody can understand what's happening or, if you find it more motivating, as if the person who ends up maintaining your code is a violent armed psychopath who knows where you live. Some team members actually are psychopaths and well armed, so you have been warned. Use [JSDoc](http://usejsdoc.org/about-getting-started.html) format when documenting functions. Also include a file comment at the beginning of JavaScript files, providing at least a brief and "@author" and "@date yyyy-mm-dd" tags.

The indentation is of 4 spaces (convert tab to spaces in your code). Anyone leaving tabs in the code will be LARTed without mercy.

The maximum length for code lines is peremptorily of 80 characters for JavaScript and CSS files. But HTML sucks, so the limit is not applied to HTML files, just try to keep a reasonable line length there.

## Git Memorandum for dummies

1. Fork the repo here on github
2. Clone your repo with ```git clone *repo_address*```
3. cd to the project folder and make a new branch with ```git checkout -b *feature-branch-name*```
4. Work on the feature
5. When ready send your code with ```git push -u origin *feature-branch-name*```
6. Send a pull request


# Third party libs

| Library           | Authors or maintainers               | License    | Link |
|-------------------|:------------------------------------:|:----------:|:----:|
| jQuery            | jQuery foundation                    | [jQuery](https://github.com/jquery/jquery/blob/master/LICENSE.txt) | https://jquery.com/ |
| bootstrap         | Mark Otto, Jacob Thornton, core team | MIT        | http://getbootstrap.com/ |
| bootstrap submenu | Vasily A.                            | MIT        | https://github.com/vsn4ik/bootstrap-submenu |
| LeapJS            | Leap Motion, Inc                     | Apache 2.0 | https://github.com/leapmotion/leapjs |

# License
The project is licensed under GPL 3. See [LICENSE](/LICENSE) file for the full
license.
