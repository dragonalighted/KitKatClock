//KitKatClock Plugin
$(function(){$.fn.kitkatclock=function(options){
    this.each(function(){
        options=options||{};
        var clock_dim=options.size||350;
        var fontSize=options.fontSize||48;
        var colors=options.colors||{};
        colors.clock=colors.clock||"#050505";
        colors.numerals=colors.numerals||"#fff";
        colors.hand=colors.hand||'#960000';
        colors.background=colors.background||"#222222";
        var radius=clock_dim/2;
        var pi=Math.PI;
        var mouse_down=false;
        var hour_mode=true;
        var allow_draw=true;
        var clock, hand, numerals, hour_display, minute_display, canvas_container, am, pm, am_pm;
        var container=$("<div>").hide();
        var input=$(this).on("mouseup", function(){
            if (!$(this).is(":focus"))
                return;
            $(this).trigger("blur");
            var val=input.val().split(":");
            var hour=parseInt(val[0]);
            var minute=parseInt(val[1]);
            container.attr({
                hour:hour==12?0:hour,
                minute:minute
            });
            hour_display.html((hour<10?"&nbsp;":"")+hour);
            minute_display.html((minute<10?"0":"")+minute);
            hour_mode=true;
            draw_hours();
            container.show().position({
                my:"center top", at:"center top", of: input,
                collision:"fit"
            });
            $("body").on("click", function(event){
                var target=event.target;
                if (!$(target).is(container) &&
                    container.has(target).length==0 &&
                    !$(target).is(input))
                    finalize_time();
            })
        });
        function init_clock(){
            $("body").append(container);
            if (input.val()=="")
                input.val("12:00 AM");
            clock=$("<canvas>");
            hand=$("<canvas>");
            numerals=$("<canvas>");
            am_pm=$("<input type='checkbox'>").on("change", function(){
                if (this.checked){
                    am.css("background", "#960000");
                    pm.css("background", "#500000");
                }
                else{
                    pm.css("background", "#960000");
                    am.css("background", "#500000");
                }
            }).hide();
            am=$("<canvas>");
            pm=$("<canvas>");
            var am_text=$("<div>AM</div>").css({
                position:"absolute",
                top:fontSize+clock_dim-25, left:25,
                width:50, textAlign:"center",
                fontSize:"24px", fontFamily:"Verdana, sans-serif"
            }).on("click", function(){
                am.trigger("click");
            });
            var pm_text=$("<div>PM</div>").css({
                position:"absolute",
                top:fontSize+clock_dim-25, right:25,
                width:50, textAlign:"center",
                fontSize:"24px", fontFamily:"Verdana, sans-serif"
            }).on("click", function(){
                pm.trigger("click");
            });
            $([am, pm]).each(function(){
                this.attr({
                    height:50,
                    width:50
                }).on("click", function(){
                    am_pm[0].checked=$(this).is(am);
                    am_pm.trigger("change");
                }).css({
                    background:"#960000",
                    position:"absolute",
                    top:fontSize+clock_dim-35
                });
                if (this==am)
                    this.css("left", 25);
                else
                    this.css("right", 25);
                var ctx=this[0].getContext("2d");
                ctx.fillStyle=colors.background;
                ctx.fillRect(0,0,50,50);
                ctx.beginPath();
                ctx.arc(25, 25, 25, 0, 2*pi);
                ctx.fillStyle = 'rgba(0,0,0,1)';
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fill();
                ctx.closePath();
            });
            if (input.val().toUpperCase().indexOf("AM")!=-1){
                am_pm[0].checked=true;
                am_pm.trigger("change");
            }
            container.css({
                width:clock_dim, height:clock_dim+(fontSize*2)+10,
                zIndex:9999999,
                backgroundColor:colors.background,
                borderRadius:"3px", padding:"3px 20px",
                border: "3px solid #ccc",
                fontFamily: "Verdana, sans-serif"
            });
            canvas_container=$("<div>").css({
                position:"absolute",
                top:fontSize+10, left:20,
                width:clock_dim, height:clock_dim
            });
            $([clock, hand, numerals]).each(function(){
                this.attr({
                    width:clock_dim, height:clock_dim
                }).css({
                    position:"absolute",
                    top:"3px", left:"0px"
                });
            });
            hour_display=$("<span>").html(12).on("click", function(){
                hour_mode=true;
                draw_hours();
            }).css("fontSize", fontSize);
            minute_display=$("<span>").html("00").on("click", function(){
                hour_mode=false;
                draw_minutes();
            }).css("fontSize", fontSize);
            var time_display=$("<div>");
            time_display.append(hour_display).append($("<span>:</span>").css("fontSize", fontSize)).append(minute_display).append(am_pm).css({
                position:"absolute",
                top:0, left:0,
                width:"100%", textAlign:"center",
                background:"#050505", color:"white"
            });          
            var done_button=$("<div>Done</div>").css({
                width:"100%", cursor:"pointer",
                textAlign:"center",
                fontSize:fontSize*(2/3),
                position:"absolute",
                borderTop:"1px solid #ccc",
                color:"white",
                top:clock_dim+20+fontSize, left:0
            }).on("click", finalize_time);
            canvas_container.append(clock).append(hand).append(numerals)
            container.append(canvas_container).append(time_display).append(done_button).append(am).append(pm).append(am_text).append(pm_text);
            var ctx=clock[0].getContext("2d");
            ctx.arc(radius, radius, radius, 0, 2*pi);
            ctx.fillStyle=colors.clock;
            ctx.fill();
            draw_hours();
            draw_hand_orig();
            canvas_container.on("mousemove mousedown mouseup touchstart touchend touchcancel click touchmove", function(event){
                if (!allow_draw ||
                   event.offsetX>clock_dim ||
                   event.offsetY>clock_dim)
                    return;
                var use_event;
                if (event.type=="touchmove" ||
                    event.type=="touchstart"){
                    event.offsetX=event.originalEvent.touches[0].clientX;
                    event.offsetY=event.originalEvent.touches[0].clientY;
                }
                switch (event.type){
                    case "touchmove":use_event="mousemove";event.preventDefault();break;
                    case "touchend":use_event="mouseup";break;
                    case "touchcancel":use_event="mouseup";break;
                    case "touchstart":use_event="mousedown";break;
                    default:use_event=event.type;
                }
                if (use_event=="mousedown")
                    mouse_down=true;
                if (use_event=="mouseup")
                    mouse_down=false;
                if (use_event=="click" ||
                    use_event=="mousedown" ||
                    (use_event=="mousemove" && mouse_down)){
                    var number=get_closest(event.offsetX, event.offsetY, hour_mode?12:60);
                    if (number==null)
                        return;
                    var radians=pi/2;
                    radians+=number*pi/(hour_mode?6:30);
                    radians=(radians>2*pi)?radians-(2*pi):radians;
                    draw_hand(radians);
                    if (hour_mode){
                        container.attr("hour", number);
                        var minute=container.attr("minute")||0;
                        minute=parseInt(minute);
                        var hour=number;
                        minute=Math.round(minute);
                        minute=minute==60?0:minute;
                        hour_display.html(((hour<10&&hour!=0)?"&nbsp;":"")+(hour==0?12:hour));
                        minute_display.html((minute<10?"0":"")+minute);
                    }
                    else {
                        container.attr("minute", number);
                        var hour=container.attr("hour")||0;
                        hour=parseInt(hour);
                        var minute=number;
                        minute=Math.round(minute);
                        minute=minute==60?0:minute;
                        hour_display.html(((hour<10&&hour!=0)?"&nbsp;":"")+(hour==0?12:hour));
                        minute_display.html((minute<10?"0":"")+minute);
                    }
                }
                if (use_event=="mouseup"){
                    if (hour_mode){
                        hour_mode=false;
                        draw_minutes();
                        allow_draw=false;
                        setTimeout(function(){allow_draw=true;}, 100);
                        //draw_hand(pi/2);
                    }
                }
            });
        }
        function finalize_time(){
            input.val(hour_display.html().replace("&nbsp;", "")+":"+minute_display.html()+" "+(am_pm[0].checked?"AM":"PM"));
            container.hide();
        }
        function draw_hours(){
            //numerals.clearCanvas();
            hour_display.css("color", colors.hand);
            minute_display.css("color", "");
            var ctx=numerals[0].getContext("2d");
            ctx.clearRect(0, 0, clock_dim, clock_dim);
            ctx.fillStyle=colors.numerals;
            ctx.font=fontSize+'px Verdana, sans-serif';
            ctx.textBaseline="middle";
            ctx.textAlign="center";
            var pi=Math.PI;
            var radians=pi/2;
            for (var i=0;i<12;i++){
                var x=radius+(Math.cos(radians)*(-1)*(radius-fontSize/1.75));
                var y=radius+(Math.sin(radians)*(-1)*(radius-fontSize/1.75));
                ctx.fillText(i==0?12:i, x, y);
                radians+=pi/6;
            }
            if (container.attr("hour")!=undefined){
                var hours=parseInt(container.attr("hour"));
                draw_hand(pi/2 + (hours*(pi/6)));
            }
            else
                draw_hand(pi/2);
        }
        function draw_minutes(){
            minute_display.css("color", colors.hand);
            hour_display.css("color", "");
            var ctx=numerals[0].getContext("2d");
            ctx.clearRect(0, 0, clock_dim, clock_dim);
            ctx.fillStyle=colors.numerals;
            ctx.font=fontSize+'px Verdana, sans-serif';
            ctx.textBaseline="middle";
            ctx.textAlign="center";
            var radians=pi/2;
            for (var i=0;i<12;i++){
                var x=radius+(Math.cos(radians)*(-1)*(radius-fontSize/1.5));
                var y=radius+(Math.sin(radians)*(-1)*(radius-fontSize/1.5));
                ctx.fillText(i*5, x, y);
                radians+=pi/6;
            }
            if (container.attr("minute")!=undefined){
                var minutes=parseInt(container.attr("minute"));
                draw_hand(pi/2 + (minutes*(pi/30)));
            }
            else
                draw_hand(pi/2);
        }
        function draw_hand(radians){
            hand.css({
                '-webkit-transform': "rotate("+(radians*180/pi)+"deg)"
            });
        }
                
        function draw_hand_orig(){
            var radians=0;
            //hand.clearCanvas();
            var ctx=hand[0].getContext("2d");
            ctx.clearRect(0, 0, clock_dim, clock_dim);
            var a_x=radius+(Math.cos(radians)*(-1)*(radius-fontSize/1.5));
            var a_y=radius+(Math.sin(radians)*(-1)*(radius-fontSize/1.5));
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.lineTo(a_x, a_y);
            ctx.strokeStyle=colors.hand;
            ctx.lineWidth=8;
            ctx.stroke();
            ctx.closePath();
            ctx.arc(a_x, a_y, fontSize*(1.35/2), 0, 2*pi);
            ctx.fillStyle=colors.hand;
            ctx.fill();
        }
        function get_closest(x, y, pieces){
            x-=radius;
            y-=radius;
            pieces/=2;
            var z=Math.sqrt(x*x+y*y);
            var theta=Math.asin(y/z);
            var closest=(pi/pieces)*Math.round(theta/(pi/pieces));
            closest/=pi;
            closest*=pieces;
            var x_pos=x>0;
            var start=pieces/2;
            if (!x_pos){
                start*=3;
                closest*=-1;
            }
            return start+closest;
        }
        //what to do
        init_clock();
    });
    return this;
}});

/*! jQuery UI - v1.10.4 - 2014-05-24
* http://jqueryui.com
* Includes: jquery.ui.position.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function( $, undefined ) {

$.ui = $.ui || {};

var cachedScrollbarWidth,
    max = Math.max,
    abs = Math.abs,
    round = Math.round,
    rhorizontal = /left|center|right/,
    rvertical = /top|center|bottom/,
    roffset = /[\+\-]\d+(\.[\d]+)?%?/,
    rposition = /^\w+/,
    rpercent = /%$/,
    _position = $.fn.position;

function getOffsets( offsets, width, height ) {
    return [
        parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
        parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
    ];
}

function parseCss( element, property ) {
    return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
    var raw = elem[0];
    if ( raw.nodeType === 9 ) {
        return {
            width: elem.width(),
            height: elem.height(),
            offset: { top: 0, left: 0 }
        };
    }
    if ( $.isWindow( raw ) ) {
        return {
            width: elem.width(),
            height: elem.height(),
            offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
        };
    }
    if ( raw.preventDefault ) {
        return {
            width: 0,
            height: 0,
            offset: { top: raw.pageY, left: raw.pageX }
        };
    }
    return {
        width: elem.outerWidth(),
        height: elem.outerHeight(),
        offset: elem.offset()
    };
}

$.position = {
    scrollbarWidth: function() {
        if ( cachedScrollbarWidth !== undefined ) {
            return cachedScrollbarWidth;
        }
        var w1, w2,
            div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
            innerDiv = div.children()[0];

        $( "body" ).append( div );
        w1 = innerDiv.offsetWidth;
        div.css( "overflow", "scroll" );

        w2 = innerDiv.offsetWidth;

        if ( w1 === w2 ) {
            w2 = div[0].clientWidth;
        }

        div.remove();

        return (cachedScrollbarWidth = w1 - w2);
    },
    getScrollInfo: function( within ) {
        var overflowX = within.isWindow || within.isDocument ? "" :
                within.element.css( "overflow-x" ),
            overflowY = within.isWindow || within.isDocument ? "" :
                within.element.css( "overflow-y" ),
            hasOverflowX = overflowX === "scroll" ||
                ( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
            hasOverflowY = overflowY === "scroll" ||
                ( overflowY === "auto" && within.height < within.element[0].scrollHeight );
        return {
            width: hasOverflowY ? $.position.scrollbarWidth() : 0,
            height: hasOverflowX ? $.position.scrollbarWidth() : 0
        };
    },
    getWithinInfo: function( element ) {
        var withinElement = $( element || window ),
            isWindow = $.isWindow( withinElement[0] ),
            isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9;
        return {
            element: withinElement,
            isWindow: isWindow,
            isDocument: isDocument,
            offset: withinElement.offset() || { left: 0, top: 0 },
            scrollLeft: withinElement.scrollLeft(),
            scrollTop: withinElement.scrollTop(),
            width: isWindow ? withinElement.width() : withinElement.outerWidth(),
            height: isWindow ? withinElement.height() : withinElement.outerHeight()
        };
    }
};

$.fn.position = function( options ) {
    if ( !options || !options.of ) {
        return _position.apply( this, arguments );
    }

    // make a copy, we don't want to modify arguments
    options = $.extend( {}, options );

    var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
        target = $( options.of ),
        within = $.position.getWithinInfo( options.within ),
        scrollInfo = $.position.getScrollInfo( within ),
        collision = ( options.collision || "flip" ).split( " " ),
        offsets = {};

    dimensions = getDimensions( target );
    if ( target[0].preventDefault ) {
        // force left top to allow flipping
        options.at = "left top";
    }
    targetWidth = dimensions.width;
    targetHeight = dimensions.height;
    targetOffset = dimensions.offset;
    // clone to reuse original targetOffset later
    basePosition = $.extend( {}, targetOffset );

    // force my and at to have valid horizontal and vertical positions
    // if a value is missing or invalid, it will be converted to center
    $.each( [ "my", "at" ], function() {
        var pos = ( options[ this ] || "" ).split( " " ),
            horizontalOffset,
            verticalOffset;

        if ( pos.length === 1) {
            pos = rhorizontal.test( pos[ 0 ] ) ?
                pos.concat( [ "center" ] ) :
                rvertical.test( pos[ 0 ] ) ?
                    [ "center" ].concat( pos ) :
                    [ "center", "center" ];
        }
        pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
        pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

        // calculate offsets
        horizontalOffset = roffset.exec( pos[ 0 ] );
        verticalOffset = roffset.exec( pos[ 1 ] );
        offsets[ this ] = [
            horizontalOffset ? horizontalOffset[ 0 ] : 0,
            verticalOffset ? verticalOffset[ 0 ] : 0
        ];

        // reduce to just the positions without the offsets
        options[ this ] = [
            rposition.exec( pos[ 0 ] )[ 0 ],
            rposition.exec( pos[ 1 ] )[ 0 ]
        ];
    });

    // normalize collision option
    if ( collision.length === 1 ) {
        collision[ 1 ] = collision[ 0 ];
    }

    if ( options.at[ 0 ] === "right" ) {
        basePosition.left += targetWidth;
    } else if ( options.at[ 0 ] === "center" ) {
        basePosition.left += targetWidth / 2;
    }

    if ( options.at[ 1 ] === "bottom" ) {
        basePosition.top += targetHeight;
    } else if ( options.at[ 1 ] === "center" ) {
        basePosition.top += targetHeight / 2;
    }

    atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
    basePosition.left += atOffset[ 0 ];
    basePosition.top += atOffset[ 1 ];

    return this.each(function() {
        var collisionPosition, using,
            elem = $( this ),
            elemWidth = elem.outerWidth(),
            elemHeight = elem.outerHeight(),
            marginLeft = parseCss( this, "marginLeft" ),
            marginTop = parseCss( this, "marginTop" ),
            collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
            collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
            position = $.extend( {}, basePosition ),
            myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

        if ( options.my[ 0 ] === "right" ) {
            position.left -= elemWidth;
        } else if ( options.my[ 0 ] === "center" ) {
            position.left -= elemWidth / 2;
        }

        if ( options.my[ 1 ] === "bottom" ) {
            position.top -= elemHeight;
        } else if ( options.my[ 1 ] === "center" ) {
            position.top -= elemHeight / 2;
        }

        position.left += myOffset[ 0 ];
        position.top += myOffset[ 1 ];

        // if the browser doesn't support fractions, then round for consistent results
        if ( !$.support.offsetFractions ) {
            position.left = round( position.left );
            position.top = round( position.top );
        }

        collisionPosition = {
            marginLeft: marginLeft,
            marginTop: marginTop
        };

        $.each( [ "left", "top" ], function( i, dir ) {
            if ( $.ui.position[ collision[ i ] ] ) {
                $.ui.position[ collision[ i ] ][ dir ]( position, {
                    targetWidth: targetWidth,
                    targetHeight: targetHeight,
                    elemWidth: elemWidth,
                    elemHeight: elemHeight,
                    collisionPosition: collisionPosition,
                    collisionWidth: collisionWidth,
                    collisionHeight: collisionHeight,
                    offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
                    my: options.my,
                    at: options.at,
                    within: within,
                    elem : elem
                });
            }
        });

        if ( options.using ) {
            // adds feedback as second argument to using callback, if present
            using = function( props ) {
                var left = targetOffset.left - position.left,
                    right = left + targetWidth - elemWidth,
                    top = targetOffset.top - position.top,
                    bottom = top + targetHeight - elemHeight,
                    feedback = {
                        target: {
                            element: target,
                            left: targetOffset.left,
                            top: targetOffset.top,
                            width: targetWidth,
                            height: targetHeight
                        },
                        element: {
                            element: elem,
                            left: position.left,
                            top: position.top,
                            width: elemWidth,
                            height: elemHeight
                        },
                        horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                        vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
                    };
                if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
                    feedback.horizontal = "center";
                }
                if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
                    feedback.vertical = "middle";
                }
                if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
                    feedback.important = "horizontal";
                } else {
                    feedback.important = "vertical";
                }
                options.using.call( this, props, feedback );
            };
        }

        elem.offset( $.extend( position, { using: using } ) );
    });
};

$.ui.position = {
    fit: {
        left: function( position, data ) {
            var within = data.within,
                withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                outerWidth = within.width,
                collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                overLeft = withinOffset - collisionPosLeft,
                overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                newOverRight;

            // element is wider than within
            if ( data.collisionWidth > outerWidth ) {
                // element is initially over the left side of within
                if ( overLeft > 0 && overRight <= 0 ) {
                    newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
                    position.left += overLeft - newOverRight;
                // element is initially over right side of within
                } else if ( overRight > 0 && overLeft <= 0 ) {
                    position.left = withinOffset;
                // element is initially over both left and right sides of within
                } else {
                    if ( overLeft > overRight ) {
                        position.left = withinOffset + outerWidth - data.collisionWidth;
                    } else {
                        position.left = withinOffset;
                    }
                }
            // too far left -> align with left edge
            } else if ( overLeft > 0 ) {
                position.left += overLeft;
            // too far right -> align with right edge
            } else if ( overRight > 0 ) {
                position.left -= overRight;
            // adjust based on position and margin
            } else {
                position.left = max( position.left - collisionPosLeft, position.left );
            }
        },
        top: function( position, data ) {
            var within = data.within,
                withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                outerHeight = data.within.height,
                collisionPosTop = position.top - data.collisionPosition.marginTop,
                overTop = withinOffset - collisionPosTop,
                overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                newOverBottom;

            // element is taller than within
            if ( data.collisionHeight > outerHeight ) {
                // element is initially over the top of within
                if ( overTop > 0 && overBottom <= 0 ) {
                    newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
                    position.top += overTop - newOverBottom;
                // element is initially over bottom of within
                } else if ( overBottom > 0 && overTop <= 0 ) {
                    position.top = withinOffset;
                // element is initially over both top and bottom of within
                } else {
                    if ( overTop > overBottom ) {
                        position.top = withinOffset + outerHeight - data.collisionHeight;
                    } else {
                        position.top = withinOffset;
                    }
                }
            // too far up -> align with top
            } else if ( overTop > 0 ) {
                position.top += overTop;
            // too far down -> align with bottom edge
            } else if ( overBottom > 0 ) {
                position.top -= overBottom;
            // adjust based on position and margin
            } else {
                position.top = max( position.top - collisionPosTop, position.top );
            }
        }
    },
    flip: {
        left: function( position, data ) {
            var within = data.within,
                withinOffset = within.offset.left + within.scrollLeft,
                outerWidth = within.width,
                offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                overLeft = collisionPosLeft - offsetLeft,
                overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                myOffset = data.my[ 0 ] === "left" ?
                    -data.elemWidth :
                    data.my[ 0 ] === "right" ?
                        data.elemWidth :
                        0,
                atOffset = data.at[ 0 ] === "left" ?
                    data.targetWidth :
                    data.at[ 0 ] === "right" ?
                        -data.targetWidth :
                        0,
                offset = -2 * data.offset[ 0 ],
                newOverRight,
                newOverLeft;

            if ( overLeft < 0 ) {
                newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
                if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
                    position.left += myOffset + atOffset + offset;
                }
            }
            else if ( overRight > 0 ) {
                newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
                if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
                    position.left += myOffset + atOffset + offset;
                }
            }
        },
        top: function( position, data ) {
            var within = data.within,
                withinOffset = within.offset.top + within.scrollTop,
                outerHeight = within.height,
                offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                collisionPosTop = position.top - data.collisionPosition.marginTop,
                overTop = collisionPosTop - offsetTop,
                overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                top = data.my[ 1 ] === "top",
                myOffset = top ?
                    -data.elemHeight :
                    data.my[ 1 ] === "bottom" ?
                        data.elemHeight :
                        0,
                atOffset = data.at[ 1 ] === "top" ?
                    data.targetHeight :
                    data.at[ 1 ] === "bottom" ?
                        -data.targetHeight :
                        0,
                offset = -2 * data.offset[ 1 ],
                newOverTop,
                newOverBottom;
            if ( overTop < 0 ) {
                newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
                if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
                    position.top += myOffset + atOffset + offset;
                }
            }
            else if ( overBottom > 0 ) {
                newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
                if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
                    position.top += myOffset + atOffset + offset;
                }
            }
        }
    },
    flipfit: {
        left: function() {
            $.ui.position.flip.left.apply( this, arguments );
            $.ui.position.fit.left.apply( this, arguments );
        },
        top: function() {
            $.ui.position.flip.top.apply( this, arguments );
            $.ui.position.fit.top.apply( this, arguments );
        }
    }
};

// fraction support test
(function () {
    var testElement, testElementParent, testElementStyle, offsetLeft, i,
        body = document.getElementsByTagName( "body" )[ 0 ],
        div = document.createElement( "div" );

    //Create a "fake body" for testing based on method used in jQuery.support
    testElement = document.createElement( body ? "div" : "body" );
    testElementStyle = {
        visibility: "hidden",
        width: 0,
        height: 0,
        border: 0,
        margin: 0,
        background: "none"
    };
    if ( body ) {
        $.extend( testElementStyle, {
            position: "absolute",
            left: "-1000px",
            top: "-1000px"
        });
    }
    for ( i in testElementStyle ) {
        testElement.style[ i ] = testElementStyle[ i ];
    }
    testElement.appendChild( div );
    testElementParent = body || document.documentElement;
    testElementParent.insertBefore( testElement, testElementParent.firstChild );

    div.style.cssText = "position: absolute; left: 10.7432222px;";

    offsetLeft = $( div ).offset().left;
    $.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;

    testElement.innerHTML = "";
    testElementParent.removeChild( testElement );
})();

}( jQuery ) );