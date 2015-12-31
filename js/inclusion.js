/**
 * Script wich manages the inclusion of HTML chunks inside the master page.
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2015-12-30
 */

$(function(){
  $("#menubar-content").load("html/menubar.html");
  $("#tool-widget-content").load("html/tool_widget.html");
  $("#options-widget-content").load("html/options_widget.html");
  $("#color-picker-widget-content").load("html/color_picker_widget.html");
  $("#canvas-area-content").load("html/canvas_area.html");
});
