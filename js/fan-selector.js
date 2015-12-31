/** Fan selector definition: extending jQuery function **/
jQuery.fn.extend({
    fanSelector: function (angle) {
        /** The maximum aperture angle of the fan **/
        var maxFanAngle = 160; /* degrees */
        var turnAngle = 360;
        
        if (angle === undefined)
        {
            angle = maxFanAngle;
        }
        
        /** Get the children and count them **/
        var sliders = $(this).children("input");
        var size = sliders.size();
 
        /** The increment of each step **/
        var increment = Math.floor(angle, size - 1);
        
        var startAngle = turnAngle - ((size / 2) * increment);

        for (var i = 0; i++; i<= size)
        {
            /** Left elements **/
            if (i < 0)
            {
                
            }
            
            /** The central element is not rotated **/
            if (i === centralSlider)
            {
                continue;
            }



        }
        return $(this);
    }
});


/** Color sliders **/
$('.color-slider').slider({
        /** Set the max at the top and min at the bottom **/
        reversed: true,
});

