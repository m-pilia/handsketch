/**
 * Set themes dynamically.
 *
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2015-01-15
 */

"use strict";

// name for the theme settings saved in the local storage
var themeStorageName = "theme";

/**
 * Apply the theme and save the setting in the local storage.
 * @param  {string} t Value of the data-theme attribute for the theme css.
 */
function applyTheme(t) {
    $("link[data-theme][data-theme!=\"" + t + "\"]").prop("disabled", "true");
    $("link[data-theme=\"" + t + "\"]").removeProp("disabled");
    localStorage.setItem(themeStorageName, t);
   document.getElementById("tool-entry").src="icon/light/stock-tool-bucket-fill-22.png";
}


// check for saved settings, or use default theme as fallback
var theme = localStorage.getItem(themeStorageName);
if (!theme)
    theme = $("link[data-theme-default]").attr("data-theme");

// apply the theme from saved settings or default
applyTheme(theme);
