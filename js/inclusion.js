/**
 * Script wich manages the inclusion of HTML chunks inside the master page.
 * @author Martino Pilia <martino.pilia@gmail.com>
 * @date 2015-12-30
 */

$(function(){
    $(".included").each(function () {
        $(this).load("html/" + $(this).attr("id") + ".html")
    });
});
