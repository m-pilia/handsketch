/**
 * Create option widgets events.
 *
 * @author Fabio Colella <fcole90@gmail.com>
 * @date 2016-01-20
 */

/* Change the selected shape when clicking on a shape. */
var tool = ["brush", "rubber", "aerograph", "color-picker"];
for (var i = 0; i<4; i++)
{
    console.log("Initializing tool " + tool[i] + "..");
    $("." + tool[i] + "-shapes").each(function() {
        var path = "img/brush-shapes/" + $(this).data("shape") + ".png";
        var thisTool = tool[i];
        $(this).on("click", function()
        {
            $("#" + thisTool + "-selected-shape").attr("src", path);
        });
    });
}

/* Enable or disable range on sample average for color picker. */
$("#color-picker-sample-average").on("change", function() {
   if ($(this).prop("checked"))
   {
       $("#color-picker-range").prop("disabled", false);
   }
   else
   {
       $("#color-picker-range").prop("disabled", true);
   }
});


/* Display only the selected tool options. */
$(".tool").each(function () {
    var elementID = "#" + $(this).attr("id") + "-options";
    $(this).on("click", function () {
        $(".tool-options").css("display", "none");
        $(elementID).css("display", "block");
    });
});