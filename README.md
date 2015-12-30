# HandSketch - HCI Class Final Project

# Team members
+ [fcole90](https://github.com/fcole90)
+ [HichamL](https://github.com/HichamL)
+ [m-pilia](https://github.com/m-pilia)
+ [flamel13](https://github.com/flamel13)

# Contributing
## File and plugins handling

```
HandSketch
|
+--LICENSE
+--README.md
+--HandSketch.html
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
|  +--*custom html files for page components*
|
+--js
|  +--*custom js scripts*
|
+--css
|  +--*custom css stylesheets*
```

All the third party libraries should go under the lib folder. Bootstrap plugins should go under bootstrap-plugins. When you download a plugin it should have a *dist* folder that contains js and css subfolders. Check that the folder structure of the plugins is like that and then put the dist folder under bootstrap-plugins and rename it to the plugin_name. If you don't find a dist folder take the relevant js and css files and create the needed structure by yourself or ask for help.

HTML code should be integrated in the HandSketch.html file itself or should go into a file under the html folder.

Custom Javascript functions should go inside a file in the js folder. Keep the functions related to an html component grouped into a file with a consistent name.

Custom CSS stylesheet files should go in the css folder.


## Style conventions
Comment your code in a way that everybody can understand what's happening or, if you find it more motivating, as if the person who ends up maintaining your code is a violent armed psychopath who knows where you live. Some team member actually are psychopaths and well armed, so you have been warned. Also include a file comment into JavaScript providing "@author" and "@date yyyy-mm-dd" tags.

The indentation is of 4 spaces (convert tab to spaces in your code).

Keep it simple and try to not reinvent the weel.

## Git Memorandum for dummies

1. Fork the repo here on github
2. Clone your repo with ```git clone *repo_address*```
3. cd to the project folder and make a new branch with ```git checkout -b *feature-branch-name*```
4. Work on the feature
5. When ready send your code with ```git push -u origin *feature-branch-name*```
6. Send a pull request


# Third party libs

| Library | Authors or maintainers | Licence | Link |
|---------|:----------------------:|:-------:|:----:|
| jQuery  | jQuery foundation | [jQuery](https://github.com/jquery/jquery/blob/master/LICENSE.txt) | https://jquery.com/ |
| bootstrap | Mark Otto, Jacob Thornton, core team | MIT | http://getbootstrap.com/ |
| bootstrap submenu | Vasily A. | MIT | [GitHub project](https://github.com/vsn4ik/bootstrap-submenu) |

# License
The project is licensed under GPL 3. See [LICENSE](/LICENSE) file for the full
license.
