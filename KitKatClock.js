//KitKatClock Plugin
$(function(){$.fn.kitkatclock=function(options){
    this.each(function(){
        options=options||{};
        var clock_dim=options.size||350;
        var fontSize=options.fontSize||48;
        var colors=options.colors||{};
        colors.clock=colors.clock||"#444";
        colors.numerals=colors.numerals||"9cf";
        colors.numeral_outline=colors.numeral_outline||'#25a';
        colors.hand=colors.hand||'#25a';
        colors.background=colors.background||"white";
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
                my:"left top", at:"left top", of: input,
                collision:"fit"
            });
            $("body").on("click", function(event){
                var target=event.target;
                glob_debug=event.target;
                if (!$(target).is(container) &&
                    container.has(target).length==0 &&
                    !$(target).is(input))
                    finalize_time();
            })
            //input.hide();
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
                    am.css("opacity", 1);
                    pm.css("opacity", .6);
                }
                else{
                    pm.css("opacity", 1);
                    am.css("opacity", .6);
                }
            }).hide();
            am=$("<canvas>").css({
                float:"left",
                marginLeft:25
            });
            pm=$("<canvas>").css({
                float:"right",
                marginRight:25
            });
            $([am, pm]).each(function(){
                this.attr({
                    height:50,
                    width:50
                }).drawEllipse({
                    fillStyle:colors.clock,
                    x: 25, y: 25,
                    width:50, height: 50
                }).drawText({
                    fillStyle: colors.numerals,
                    strokeStyle: colors.numerals,
                    
                    x: 25, y: 25,
                    fontSize: 20,
                    fontFamily: 'Verdana, sans-serif',
                    text:(this==am)?"AM":"PM"
                }).on("click", function(){
                    am_pm[0].checked=$(this).is(am);
                    am_pm.trigger("change");
                });
            });
            if (input.val().toUpperCase().indexOf("AM")!=-1){
                am_pm[0].checked=true;
                am_pm.trigger("change");
            }
            container.css({
                width:clock_dim, height:clock_dim+(fontSize*2)+10,
                zIndex:9999999,
                backgroundColor:colors.background,
                borderRadius:"3px", padding:"3px",
                border: "3px solid #ccc"
            });
            canvas_container=$("<div>").css({
                position:"absolute",
                top:0, left:0,
                width:clock_dim, height:clock_dim
            });
            $([clock, hand, numerals]).each(function(){
                this.attr({
                    width:clock_dim, height:clock_dim
                }).css({
                    position:"absolute",
                    top:"3px", left:"3px"
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
            time_display.append(am).append(hour_display).append($("<span>:</span>").css("fontSize", fontSize)).append(minute_display).append(pm).append(am_pm).css({
                position:"absolute",
                top:clock_dim+10, left:0,
                width:"100%", textAlign:"center"
            });
            var done_button=$("<div>Done</div>").css({
                width:"100%", cursor:"pointer",
                textAlign:"center",
                fontSize:fontSize*(2/3),
                position:"absolute",
                borderTop:"1px solid #ccc",
                top:clock_dim+20+fontSize, left:0
            }).on("click", finalize_time);
            canvas_container.append(clock).append(hand).append(numerals)
            container.append(canvas_container).append(time_display).append(done_button);
            $(".kitkat-clock-am-pm").css({
                marginTop:"-20px", marginLeft:"10px"
            });
            clock.drawEllipse({
                fillStyle:colors.clock,
                x: clock_dim/2, y: clock_dim/2,
                width:clock_dim, height: clock_dim
            });
            draw_hours();
            draw_hand_orig();
            canvas_container.on("mousemove mousedown mouseup touchstart touchend touchcancel click touchmove", function(event){
                if (!allow_draw ||
                   event.offsetX>clock_dim ||
                   event.offsetY>clock_dim)
                    return;
                var use_event;
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
                    /*else {
                        finalize_time();
                    }*/
                }
            });
        }
        function finalize_time(){
            input.val(hour_display.html().replace("&nbsp;", "")+":"+minute_display.html()+" "+(am_pm[0].checked?"AM":"PM"));
            container.hide();
        }
        function draw_hours(){
            numerals.clearCanvas();
            var pi=Math.PI;
            var radians=pi/2;
            for (var i=0;i<12;i++){
                var x=radius+(Math.cos(radians)*(-1)*(radius-fontSize/1.75));
                var y=radius+(Math.sin(radians)*(-1)*(radius-fontSize/1.75));
                numerals.drawText({
                    text:(i==0)?12:i,
                    fillStyle: colors.numerals,
                    strokeStyle: colors.numeral_outline,
                    strokeWidth: 2,
                    x: x, y: y,
                    fontSize: fontSize,
                    fontFamily: 'Verdana, sans-serif'        
                });
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
            numerals.clearCanvas();
            var radians=pi/2;
            for (var i=0;i<12;i++){
                var x=radius+(Math.cos(radians)*(-1)*(radius-fontSize/1.5));
                var y=radius+(Math.sin(radians)*(-1)*(radius-fontSize/1.5));
                numerals.drawText({
                    text:i*5,
                    fillStyle: colors.numerals,
                    strokeStyle: colors.numeral_outline,
                    strokeWidth: 2,
                    x: x, y: y,
                    fontSize: fontSize,
                    fontFamily: 'Verdana, sans-serif'        
                });
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
            hand.clearCanvas();
            var a_x=radius+(Math.cos(radians)*(-1)*(radius-fontSize/1.5));
            var a_y=radius+(Math.sin(radians)*(-1)*(radius-fontSize/1.5));
            hand.drawLine({
                strokeStyle: colors.hand,
                strokeWidth: 8,
                x1: radius, y1: radius,
                x2: a_x, y2: a_y,
            });
            hand.drawEllipse({
                fillStyle:colors.hand,
                x:a_x, y: a_y,
                width:fontSize*1.35, height:fontSize*1.35
            });
        }
        function get_closest(x, y, pieces){
            x-=radius;
            y-=radius;
            pieces/=2;
            var z=Math.sqrt(x*x+y*y);
            /*if (z>radius)
                return null;*/
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

/*
 jCanvas v14.05.20
 Copyright 2014 Caleb Evans
 Released under the MIT license
*/
(function(g,ua,va,Ra,ca,ea,$a,q,y,h,v){function H(d){for(var c in d)d.hasOwnProperty(c)&&(this[c]=d[c]);return this}function ma(){Z(this,ma.baseDefaults)}function ja(d){return"string"===aa(d)}function L(d){return d&&d.getContext?d.getContext("2d"):h}function ka(d){d=Z({},d);d.masks=d.masks.slice(0);return d}function fa(d,c){var a;d.save();a=ka(c.transforms);c.savedTransforms.push(a)}function wa(d,c,a,b){a[b]&&(da(a[b])?c[b]=a[b].call(d,a):c[b]=a[b])}function T(d,c,a){wa(d,c,a,"fillStyle");wa(d,c,
a,"strokeStyle");c.lineWidth=a.strokeWidth;a.rounded?c.lineCap=c.lineJoin="round":(c.lineCap=a.strokeCap,c.lineJoin=a.strokeJoin,c.miterLimit=a.miterLimit);a.strokeDash||(a.strokeDash=[]);c.setLineDash&&c.setLineDash(a.strokeDash);c.webkitLineDash=c.mozDash=a.strokeDash;c.lineDashOffset=c.webkitLineDashOffset=c.mozDashOffset=a.strokeDashOffset;c.shadowOffsetX=a.shadowX;c.shadowOffsetY=a.shadowY;c.shadowBlur=a.shadowBlur;c.shadowColor=a.shadowColor;c.globalAlpha=a.opacity;c.globalCompositeOperation=
a.compositing;a.imageSmoothing&&(c.webkitImageSmoothingEnabled=c.mozImageSmoothingEnabled=a.imageSmoothing)}function xa(d,c,a){a.mask&&(a.autosave&&fa(d,c),d.clip(),c.transforms.masks.push(a._args))}function X(d,c,a){a.closed&&c.closePath();a.shadowStroke&&0!==a.strokeWidth?(c.stroke(),c.fill(),c.shadowColor="transparent",c.shadowBlur=0,c.stroke()):(c.fill(),"transparent"!==a.fillStyle&&(c.shadowColor="transparent"),0!==a.strokeWidth&&c.stroke());a.closed||c.closePath();a._transformed&&c.restore();
a.mask&&(d=F(d),xa(c,d,a))}function S(d,c,a,b,f){a._toRad=a.inDegrees?E/180:1;a._transformed=q;c.save();a.fromCenter||a._centered||b===v||(f===v&&(f=b),a.x+=b/2,a.y+=f/2,a._centered=q);a.rotate&&ya(c,a,h);1===a.scale&&1===a.scaleX&&1===a.scaleY||za(c,a,h);(a.translate||a.translateX||a.translateY)&&Aa(c,a,h)}function F(d){var c=ba.dataCache,a;c._canvas===d&&c._data?a=c._data:(a=g.data(d,"jCanvas"),a||(a={canvas:d,layers:[],layer:{names:{},groups:{}},eventHooks:{},intersecting:[],lastIntersected:h,
cursor:g(d).css("cursor"),drag:{layer:h,dragging:y},event:{type:h,x:h,y:h},events:{},transforms:ka(na),savedTransforms:[],animating:y,animated:h,pixelRatio:1,scaled:y},g.data(d,"jCanvas",a)),c._canvas=d,c._data=a);return a}function Ba(d,c,a){for(var b in $.events)$.events.hasOwnProperty(b)&&(a[b]||a.cursors&&a.cursors[b])&&Ca(d,c,a,b)}function Ca(d,c,a,b){$.events[b](d,c);a._event=q}function Da(d,c,a){var b,f,e;if(a.draggable||a.cursors){b=["mousedown","mousemove","mouseup"];for(e=0;e<b.length;e+=
1)f=b[e],Ca(d,c,a,f);c.events.mouseoutdrag||(d.bind("mouseout.jCanvas",function(){var a=c.drag.layer;a&&(c.drag={},Q(d,c,a,"dragcancel"),d.drawLayers())}),c.events.mouseoutdrag=q);a._event=q}}function oa(d,c,a,b){d=c.layer.names;b?b.name!==v&&ja(a.name)&&a.name!==b.name&&delete d[a.name]:b=a;ja(b.name)&&(d[b.name]=a)}function pa(d,c,a,b){d=c.layer.groups;var f,e,k,G;if(!b)b=a;else if(b.groups!==v&&a.groups!==h)for(e=0;e<a.groups.length;e+=1)if(f=a.groups[e],c=d[f]){for(G=0;G<c.length;G+=1)if(c[G]===
a){k=G;c.splice(G,1);break}0===c.length&&delete d[f]}if(b.groups!==v&&b.groups!==h)for(e=0;e<b.groups.length;e+=1)f=b.groups[e],c=d[f],c||(c=d[f]=[],c.name=f),k===v&&(k=c.length),c.splice(k,0,a)}function qa(d,c,a,b,f){b[a]&&c._running&&!c._running[a]&&(c._running[a]=q,b[a].call(d[0],c,f),c._running[a]=y)}function Q(d,c,a,b,f){if(!a.disableEvents){if("mouseout"!==b){var e;a.cursors&&(e=a.cursors[b]);-1!==g.inArray(e,W.cursors)&&(e=W.prefix+e);e&&d.css({cursor:e})}qa(d,a,b,a,f);qa(d,a,b,c.eventHooks,
f);qa(d,a,b,$.eventHooks,f)}}function P(d,c,a,b){var f,e=c._layer?a:c;c._args=a;if(c.draggable||c.dragGroups)c.layer=q,c.draggable=q;c._method=b?b:c.method?g.fn[c.method]:c.type?g.fn[Y.drawings[c.type]]:function(){};c.layer&&!c._layer&&(a=g(d),b=F(d),f=b.layers,e.name===h||ja(e.name)&&b.layer.names[e.name]===v)&&(e=new H(c),e.canvas=d,e.layer=q,e._layer=q,e._running={},e.data=e.data!==h?Z({},e.data):{},e.groups=e.groups!==h?e.groups.slice(0):[],oa(a,b,e),pa(a,b,e),Ba(a,b,e),Da(a,b,e),c._event=e._event,
e._method===g.fn.drawText&&a.measureText(e),e.index===h&&(e.index=f.length),f.splice(e.index,0,e),c._args=e,Q(a,b,e,"add"));return e}function Ea(d,c){var a,b;for(b=0;b<W.props.length;b+=1)a=W.props[b],d[a]!==v&&(d["_"+a]=d[a],W.propsObj[a]=q,c&&delete d[a])}function Sa(d,c,a){var b,f,e,k;for(b in a)if(a.hasOwnProperty(b)&&(f=a[b],da(f)&&(a[b]=f.call(d,c,b)),"object"===aa(f)&&Fa(f))){for(e in f)f.hasOwnProperty(e)&&(k=f[e],c[b]!==v&&(c[b+"."+e]=c[b][e],a[b+"."+e]=k));delete a[b]}return a}function Ga(d){var c,
a,b=[],f=1;d.match(/^([a-z]+|#[0-9a-f]+)$/gi)&&("transparent"===d&&(d="rgba( 0,0,0,0 )"),a=ua.head,c=a.style.color,a.style.color=d,d=g.css(a,"color"),a.style.color=c);d.match(/^rgb/gi)&&(b=d.match(/(\d+(\.\d+)?)/gi),d.match(/%/gi)&&(f=2.55),b[0]*=f,b[1]*=f,b[2]*=f,b[3]=b[3]!==v?ea(b[3]):1);return b}function Ta(d){var c=3,a;"array"!==aa(d.start)&&(d.start=Ga(d.start),d.end=Ga(d.end));d.now=[];if(1!==d.start[3]||1!==d.end[3])c=4;for(a=0;a<c;a+=1)d.now[a]=d.start[a]+(d.end[a]-d.start[a])*d.pos,3>a&&
(d.now[a]=Ua(d.now[a]));1!==d.start[3]||1!==d.end[3]?d.now="rgba( "+d.now.join(",")+" )":(d.now.slice(0,3),d.now="rgb( "+d.now.join(",")+" )");d.elem.nodeName?d.elem.style[d.prop]=d.now:d.elem[d.prop]=d.now}function Va(d){Y.touchEvents[d]&&(d=Y.touchEvents[d]);return d}function Wa(d){$.events[d]=function(c,a){function b(a){k.x=a.offsetX;k.y=a.offsetY;k.type=f;k.event=a;c.drawLayers({resetFire:q});a.preventDefault()}var f,e,k;k=a.event;f="mouseover"===d||"mouseout"===d?"mousemove":d;e=Va(f);a.events[f]||
(e!==f?c.bind(f+".jCanvas "+e+".jCanvas",b):c.bind(f+".jCanvas",b),a.events[f]=q)}}function U(d,c,a){var b,f,e,k;if(a=a._args)d=F(d),b=d.event,b.x!==h&&b.y!==h&&(e=b.x*d.pixelRatio,k=b.y*d.pixelRatio,f=!!(c.isPointInPath(e,k)||c.isPointInStroke&&c.isPointInStroke(e,k))),c=d.transforms,a.eventX=b.x,a.eventY=b.y,a.event=b.event,b=d.transforms.rotate,e=a.eventX,k=a.eventY,0!==b?(a._eventX=e*N(-b)-k*R(-b),a._eventY=k*N(-b)+e*R(-b)):(a._eventX=e,a._eventY=k),a._eventX/=c.scaleX,a._eventY/=c.scaleY,f&&
d.intersecting.push(a),a.intersects=!!f}function ya(d,c,a){c._toRad=c.inDegrees?E/180:1;d.translate(c.x,c.y);d.rotate(c.rotate*c._toRad);d.translate(-c.x,-c.y);a&&(a.rotate+=c.rotate*c._toRad)}function za(d,c,a){1!==c.scale&&(c.scaleX=c.scaleY=c.scale);d.translate(c.x,c.y);d.scale(c.scaleX,c.scaleY);d.translate(-c.x,-c.y);a&&(a.scaleX*=c.scaleX,a.scaleY*=c.scaleY)}function Aa(d,c,a){c.translate&&(c.translateX=c.translateY=c.translate);d.translate(c.translateX,c.translateY);a&&(a.translateX+=c.translateX,
a.translateY+=c.translateY)}function Ha(d){for(;0>d;)d+=2*E;return d}function Ia(d,c,a,b){var f,e,k,g,D,t,h;a===b?h=t=0:(t=a.x,h=a.y);b.inDegrees||360!==b.end||(b.end=2*E);b.start*=a._toRad;b.end*=a._toRad;b.start-=E/2;b.end-=E/2;D=E/180;b.ccw&&(D*=-1);f=b.x+b.radius*N(b.start+D);e=b.y+b.radius*R(b.start+D);k=b.x+b.radius*N(b.start);g=b.y+b.radius*R(b.start);ga(d,c,a,b,f,e,k,g);c.arc(b.x+t,b.y+h,b.radius,b.start,b.end,b.ccw);f=b.x+b.radius*N(b.end+D);D=b.y+b.radius*R(b.end+D);e=b.x+b.radius*N(b.end);
k=b.y+b.radius*R(b.end);ha(d,c,a,b,e,k,f,D)}function Ja(d,c,a,b,f,e,k,g){var D,t;b.arrowRadius&&!a.closed&&(t=Xa(g-e,k-f),t-=E,d=a.strokeWidth*N(t),D=a.strokeWidth*R(t),a=k+b.arrowRadius*N(t+b.arrowAngle/2),f=g+b.arrowRadius*R(t+b.arrowAngle/2),e=k+b.arrowRadius*N(t-b.arrowAngle/2),b=g+b.arrowRadius*R(t-b.arrowAngle/2),c.moveTo(a-d,f-D),c.lineTo(k-d,g-D),c.lineTo(e-d,b-D),c.moveTo(k-d,g-D),c.lineTo(k+d,g+D),c.moveTo(k,g))}function ga(d,c,a,b,f,e,k,g){b._arrowAngleConverted||(b.arrowAngle*=a._toRad,
b._arrowAngleConverted=q);b.startArrow&&Ja(d,c,a,b,f,e,k,g)}function ha(d,c,a,b,f,e,k,g){b._arrowAngleConverted||(b.arrowAngle*=a._toRad,b._arrowAngleConverted=q);b.endArrow&&Ja(d,c,a,b,f,e,k,g)}function Ka(d,c,a,b){var f,e,k;f=2;ga(d,c,a,b,b.x2+a.x,b.y2+a.y,b.x1+a.x,b.y1+a.y);for(b.x1!==v&&b.y1!==v&&c.moveTo(b.x1+a.x,b.y1+a.y);q;)if(e=b["x"+f],k=b["y"+f],e!==v&&k!==v)c.lineTo(e+a.x,k+a.y),f+=1;else break;f-=1;ha(d,c,a,b,b["x"+(f-1)]+a.x,b["y"+(f-1)]+a.y,b["x"+f]+a.x,b["y"+f]+a.y)}function La(d,c,
a,b){var f,e,k,g,D;f=2;ga(d,c,a,b,b.cx1+a.x,b.cy1+a.y,b.x1+a.x,b.y1+a.y);for(b.x1!==v&&b.y1!==v&&c.moveTo(b.x1+a.x,b.y1+a.y);q;)if(e=b["x"+f],k=b["y"+f],g=b["cx"+(f-1)],D=b["cy"+(f-1)],e!==v&&k!==v&&g!==v&&D!==v)c.quadraticCurveTo(g+a.x,D+a.y,e+a.x,k+a.y),f+=1;else break;f-=1;ha(d,c,a,b,b["cx"+(f-1)]+a.x,b["cy"+(f-1)]+a.y,b["x"+f]+a.x,b["y"+f]+a.y)}function Ma(d,c,a,b){var f,e,k,g,D,t,h,B;f=2;e=1;ga(d,c,a,b,b.cx1+a.x,b.cy1+a.y,b.x1+a.x,b.y1+a.y);for(b.x1!==v&&b.y1!==v&&c.moveTo(b.x1+a.x,b.y1+a.y);q;)if(k=
b["x"+f],g=b["y"+f],D=b["cx"+e],t=b["cy"+e],h=b["cx"+(e+1)],B=b["cy"+(e+1)],k!==v&&g!==v&&D!==v&&t!==v&&h!==v&&B!==v)c.bezierCurveTo(D+a.x,t+a.y,h+a.x,B+a.y,k+a.x,g+a.y),f+=1,e+=2;else break;f-=1;e-=2;ha(d,c,a,b,b["cx"+(e+1)]+a.x,b["cy"+(e+1)]+a.y,b["x"+f]+a.x,b["y"+f]+a.y)}function Na(d,c,a){c*=d._toRad;c-=E/2;return a*N(c)}function Oa(d,c,a){c*=d._toRad;c-=E/2;return a*R(c)}function Pa(d,c,a,b){var f,e,k,g,h,t,M;a===b?h=g=0:(g=a.x,h=a.y);f=1;e=g=t=b.x+g;k=h=M=b.y+h;ga(d,c,a,b,e+Na(a,b.a1,b.l1),
k+Oa(a,b.a1,b.l1),e,k);for(b.x!==v&&b.y!==v&&c.moveTo(e,k);q;)if(e=b["a"+f],k=b["l"+f],e!==v&&k!==v)g=t,h=M,t+=Na(a,e,k),M+=Oa(a,e,k),c.lineTo(t,M),f+=1;else break;ha(d,c,a,b,g,h,t,M)}function ra(d,c,a){isNaN(Number(a.fontSize))||(a.fontSize+="px");c.font=a.fontStyle+" "+a.fontSize+" "+a.fontFamily}function sa(d,c,a,b){var f,e;f=ba.propCache;if(f.text===a.text&&f.fontStyle===a.fontStyle&&f.fontSize===a.fontSize&&f.fontFamily===a.fontFamily&&f.maxWidth===a.maxWidth&&f.lineHeight===a.lineHeight)a.width=
f.width,a.height=f.height;else{a.width=c.measureText(b[0]).width;for(e=1;e<b.length;e+=1)f=c.measureText(b[e]).width,f>a.width&&(a.width=f);c=d.style.fontSize;d.style.fontSize=a.fontSize;a.height=ea(g.css(d,"fontSize"))*b.length*a.lineHeight;d.style.fontSize=c}}function Qa(d,c){var a=c.maxWidth,b=c.text.split("\n"),f=[],e,k,g,h,t;for(g=0;g<b.length;g+=1){h=b[g];t=h.split(" ");e=[];k="";if(1===t.length||d.measureText(h).width<a)e=[h];else{for(h=0;h<t.length;h+=1)d.measureText(k+t[h]).width>a&&(""!==
k&&e.push(k),k=""),k+=t[h],h!==t.length-1&&(k+=" ");e.push(k)}f=f.concat(e.join("\n").replace(/( (\n))|( $)/gi,"$2").split("\n"))}return f}var la,Z=g.extend,ia=g.inArray,aa=g.type,da=g.isFunction,Fa=g.isPlainObject,E=ca.PI,Ua=ca.round,Ya=ca.abs,R=ca.sin,N=ca.cos,Xa=ca.atan2,ta=Ra.prototype.slice,Za=g.event.fix,Y={},ba={dataCache:{},propCache:{},imageCache:{}},na={rotate:0,scaleX:1,scaleY:1,translateX:0,translateY:0,masks:[]},W={},$={events:{},eventHooks:{},future:{}};ma.baseDefaults={align:"center",
arrowAngle:90,arrowRadius:0,autosave:q,baseline:"middle",bringToFront:y,ccw:y,closed:y,compositing:"source-over",concavity:0,cornerRadius:0,count:1,cropFromCenter:q,crossOrigin:"",cursors:h,disableEvents:y,draggable:y,dragGroups:h,groups:h,data:h,dx:h,dy:h,end:360,eventX:h,eventY:h,fillStyle:"transparent",fontStyle:"normal",fontSize:"12pt",fontFamily:"sans-serif",fromCenter:q,height:h,imageSmoothing:q,inDegrees:q,index:h,letterSpacing:h,lineHeight:1,layer:y,mask:y,maxWidth:h,miterLimit:10,name:h,
opacity:1,r1:h,r2:h,radius:0,repeat:"repeat",respectAlign:y,rotate:0,rounded:y,scale:1,scaleX:1,scaleY:1,shadowBlur:0,shadowColor:"transparent",shadowStroke:y,shadowX:0,shadowY:0,sHeight:h,sides:0,source:"",spread:0,start:0,strokeCap:"butt",strokeDash:h,strokeDashOffset:0,strokeJoin:"miter",strokeStyle:"transparent",strokeWidth:1,sWidth:h,sx:h,sy:h,text:"",translate:0,translateX:0,translateY:0,type:h,visible:q,width:h,x:0,y:0};la=new ma;H.prototype=la;$.extend=function(d){d.name&&(d.props&&Z(la,d.props),
g.fn[d.name]=function a(b){var f,e,k,g;for(e=0;e<this.length;e+=1)if(f=this[e],k=L(f))g=new H(b),P(f,g,b,a),T(f,k,g),d.fn.call(f,k,g);return this},d.type&&(Y.drawings[d.type]=d.name));return g.fn[d.name]};g.fn.getEventHooks=function(){var d;d={};0!==this.length&&(d=this[0],d=F(d),d=d.eventHooks);return d};g.fn.setEventHooks=function(d){var c,a;for(c=0;c<this.length;c+=1)g(this[c]),a=F(this[c]),Z(a.eventHooks,d);return this};g.fn.getLayers=function(d){var c,a,b,f,e=[];if(0!==this.length)if(c=this[0],
a=F(c),a=a.layers,da(d))for(f=0;f<a.length;f+=1)b=a[f],d.call(c,b)&&e.push(b);else e=a;return e};g.fn.getLayer=function(d){var c,a,b,f;if(0!==this.length)if(c=this[0],a=F(c),c=a.layers,f=aa(d),d&&d.layer)b=d;else if("number"===f)0>d&&(d=c.length+d),b=c[d];else if("regexp"===f)for(a=0;a<c.length;a+=1){if(ja(c[a].name)&&c[a].name.match(d)){b=c[a];break}}else b=a.layer.names[d];return b};g.fn.getLayerGroup=function(d){var c,a,b,f=aa(d);if(0!==this.length)if(c=this[0],"array"===f)b=d;else if("regexp"===
f)for(a in c=F(c),c=c.layer.groups,c){if(a.match(d)){b=c[a];break}}else c=F(c),b=c.layer.groups[d];return b};g.fn.getLayerIndex=function(d){var c=this.getLayers();d=this.getLayer(d);return ia(d,c)};g.fn.setLayer=function(d,c){var a,b,f,e,k,h,D;for(b=0;b<this.length;b+=1)if(a=g(this[b]),f=F(this[b]),e=g(this[b]).getLayer(d)){oa(a,f,e,c);pa(a,f,e,c);for(k in c)c.hasOwnProperty(k)&&(h=c[k],D=aa(h),"object"===D&&Fa(h)?e[k]=Z({},h):"array"===D?e[k]=h.slice(0):"string"===D?0===h.indexOf("+=")?e[k]+=ea(h.substr(2)):
0===h.indexOf("-=")?e[k]-=ea(h.substr(2)):e[k]=h:e[k]=h);Ba(a,f,e);Da(a,f,e);g.isEmptyObject(c)===y&&Q(a,f,e,"change",c)}return this};g.fn.setLayers=function(d,c){var a,b,f,e;for(b=0;b<this.length;b+=1)for(a=g(this[b]),f=a.getLayers(c),e=0;e<f.length;e+=1)a.setLayer(f[e],d);return this};g.fn.setLayerGroup=function(d,c){var a,b,f,e;for(b=0;b<this.length;b+=1)if(a=g(this[b]),f=a.getLayerGroup(d))for(e=0;e<f.length;e+=1)a.setLayer(f[e],c);return this};g.fn.moveLayer=function(d,c){var a,b,f,e,k;for(b=
0;b<this.length;b+=1)if(a=g(this[b]),f=F(this[b]),e=f.layers,k=a.getLayer(d))k.index=ia(k,e),e.splice(k.index,1),e.splice(c,0,k),0>c&&(c=e.length+c),k.index=c,Q(a,f,k,"move");return this};g.fn.removeLayer=function(d){var c,a,b,f,e;for(a=0;a<this.length;a+=1)if(c=g(this[a]),b=F(this[a]),f=c.getLayers(),e=c.getLayer(d))e.index=ia(e,f),f.splice(e.index,1),oa(c,b,e,{name:h}),pa(c,b,e,{groups:h}),Q(c,b,e,"remove");return this};g.fn.removeLayers=function(d){var c,a,b,f,e,k;for(a=0;a<this.length;a+=1){c=
g(this[a]);b=F(this[a]);f=c.getLayers(d);for(k=0;k<f.length;k+=1)e=f[k],c.removeLayer(e),k-=1;b.layer.names={};b.layer.groups={}}return this};g.fn.removeLayerGroup=function(d){var c,a,b,f;if(d!==v)for(a=0;a<this.length;a+=1)if(c=g(this[a]),F(this[a]),c.getLayers(),b=c.getLayerGroup(d))for(b=b.slice(0),f=0;f<b.length;f+=1)c.removeLayer(b[f]);return this};g.fn.addLayerToGroup=function(d,c){var a,b,f,e=[c];for(b=0;b<this.length;b+=1)a=g(this[b]),f=a.getLayer(d),f.groups&&(e=f.groups.slice(0),-1===ia(c,
f.groups)&&e.push(c)),a.setLayer(f,{groups:e});return this};g.fn.removeLayerFromGroup=function(d,c){var a,b,f,e=[],k;for(b=0;b<this.length;b+=1)a=g(this[b]),f=a.getLayer(d),f.groups&&(k=ia(c,f.groups),-1!==k&&(e=f.groups.slice(0),e.splice(k,1),a.setLayer(f,{groups:e})));return this};W.cursors=["grab","grabbing","zoom-in","zoom-out"];W.prefix=function(){var d=getComputedStyle(ua.documentElement,"");return"-"+(ta.call(d).join("").match(/-(moz|webkit|ms)-/)||""===d.OLink&&["","o"])[1]+"-"}();g.fn.triggerLayerEvent=
function(d,c){var a,b,f;for(b=0;b<this.length;b+=1)a=g(this[b]),f=F(this[b]),(d=a.getLayer(d))&&Q(a,f,d,c);return this};g.fn.drawLayer=function(d){var c,a,b;for(c=0;c<this.length;c+=1)a=g(this[c]),L(this[c]),(b=a.getLayer(d))&&b.visible&&b._method&&(b._next=h,b._method.call(a,b));return this};g.fn.drawLayers=function(d){var c,a,b=Z({},d),f,e,k,G,D,t,M;b.index||(b.index=0);for(c=0;c<this.length;c+=1)if(d=g(this[c]),a=L(this[c])){G=F(this[c]);b.clear!==y&&d.clearCanvas();a=G.layers;for(k=b.index;k<
a.length;k+=1)if(f=a[k],f.index=k,b.resetFire&&(f._fired=y),D=d,t=f,e=k+1,t&&t.visible&&t._method&&(t._next=e?e:h,t._method.call(D,t)),f._masks=G.transforms.masks.slice(0),f._method===g.fn.drawImage&&f.visible){M=!0;break}if(M)break;f=G;var B=e=t=D=void 0;D=h;for(t=f.intersecting.length-1;0<=t;t-=1)if(D=f.intersecting[t],D._masks){for(B=D._masks.length-1;0<=B;B-=1)if(e=D._masks[B],!e.intersects){D.intersects=y;break}if(D.intersects)break}f=D;D=G.event;t=D.type;if(G.drag.layer){e=d;var B=G,z=t,A=void 0,
m=void 0,u=void 0,p=u=void 0,x=void 0,u=A=A=u=void 0,u=B.drag,p=(m=u.layer)&&m.dragGroups||[],A=B.layers;if("mousemove"===z||"touchmove"===z){if(u.dragging||(u.dragging=q,m.dragging=q,m.bringToFront&&(A.splice(m.index,1),m.index=A.push(m)),m._startX=m.x,m._startY=m.y,m._endX=m._eventX,m._endY=m._eventY,Q(e,B,m,"dragstart")),u.dragging)for(A=m._eventX-(m._endX-m._startX),u=m._eventY-(m._endY-m._startY),m.dx=A-m.x,m.dy=u-m.y,m.x=A,m.y=u,Q(e,B,m,"drag"),A=0;A<p.length;A+=1)if(u=p[A],x=B.layer.groups[u],
m.groups&&x)for(u=0;u<x.length;u+=1)x[u]!==m&&(x[u].x+=m.dx,x[u].y+=m.dy)}else if("mouseup"===z||"touchend"===z)u.dragging&&(m.dragging=y,u.dragging=y,Q(e,B,m,"dragstop")),B.drag={}}e=G.lastIntersected;e===h||f===e||!e._hovered||e._fired||G.drag.dragging||(G.lastIntersected=h,e._fired=q,e._hovered=y,Q(d,G,e,"mouseout"),d.css({cursor:G.cursor}));f&&(f[t]||Y.mouseEvents[t]&&(t=Y.mouseEvents[t]),f._event&&f.intersects&&(G.lastIntersected=f,!(f.mouseover||f.mouseout||f.cursors)||G.drag.dragging||f._hovered||
f._fired||(f._fired=q,f._hovered=q,Q(d,G,f,"mouseover")),f._fired||(f._fired=q,D.type=h,Q(d,G,f,t)),!f.draggable||f.disableEvents||"mousedown"!==t&&"touchstart"!==t||(G.drag.layer=f)));f!==h||G.drag.dragging||d.css({cursor:G.cursor});k===a.length&&(G.intersecting.length=0,G.transforms=ka(na),G.savedTransforms.length=0)}return this};g.fn.addLayer=function(d){var c,a;for(c=0;c<this.length;c+=1)if(a=L(this[c]))a=new H(d),a.layer=q,P(this[c],a,d);return this};W.props=["width","height","opacity","lineHeight"];
W.propsObj={};g.fn.animateLayer=function(){function d(a,b,c){return function(){var d,f;for(f=0;f<W.props.length;f+=1)d=W.props[f],c[d]=c["_"+d];for(var k in c)c.hasOwnProperty(k)&&-1!==k.indexOf(".")&&delete c[k];b.animating&&b.animated!==c||a.drawLayers();c._animating=y;b.animating=y;b.animated=h;e[4]&&e[4].call(a[0],c);Q(a,b,c,"animateend")}}function c(a,b,c){return function(d,f){var k,g,h=!1;"_"===f.prop[0]&&(h=!0,f.prop=f.prop.replace("_",""),c[f.prop]=c["_"+f.prop]);-1!==f.prop.indexOf(".")&&
(k=f.prop.split("."),g=k[0],k=k[1],c[g]&&(c[g][k]=f.now));c._pos!==f.pos&&(c._pos=f.pos,c._animating||b.animating||(c._animating=q,b.animating=q,b.animated=c),b.animating&&b.animated!==c||a.drawLayers());e[5]&&e[5].call(a[0],d,f,c);Q(a,b,c,"animate",f);h&&(f.prop="_"+f.prop)}}var a,b,f,e=ta.call(arguments,0),k,G;"object"===aa(e[2])?(e.splice(2,0,e[2].duration||h),e.splice(3,0,e[3].easing||h),e.splice(4,0,e[4].complete||h),e.splice(5,0,e[5].step||h)):(e[2]===v?(e.splice(2,0,h),e.splice(3,0,h),e.splice(4,
0,h)):da(e[2])&&(e.splice(2,0,h),e.splice(3,0,h)),e[3]===v?(e[3]=h,e.splice(4,0,h)):da(e[3])&&e.splice(3,0,h));for(b=0;b<this.length;b+=1)if(a=g(this[b]),f=L(this[b]))f=F(this[b]),(k=a.getLayer(e[0]))&&k._method!==g.fn.draw&&(G=Z({},e[1]),G=Sa(this[b],k,G),Ea(G,q),Ea(k),k.style=W.propsObj,g(k).animate(G,{duration:e[2],easing:g.easing[e[3]]?e[3]:h,complete:d(a,f,k),step:c(a,f,k)}),Q(a,f,k,"animatestart"));return this};g.fn.animateLayerGroup=function(d){var c,a,b=ta.call(arguments,0),f,e;for(a=0;a<
this.length;a+=1)if(c=g(this[a]),f=c.getLayerGroup(d))for(e=0;e<f.length;e+=1)b[0]=f[e],c.animateLayer.apply(c,b);return this};g.fn.delayLayer=function(d,c){var a,b,f,e;c=c||0;for(b=0;b<this.length;b+=1)if(a=g(this[b]),f=F(this[b]),e=a.getLayer(d))g(e).delay(c),Q(a,f,e,"delay");return this};g.fn.delayLayerGroup=function(d,c){var a,b,f,e,k;c=c||0;for(b=0;b<this.length;b+=1)if(a=g(this[b]),f=a.getLayerGroup(d))for(k=0;k<f.length;k+=1)e=f[k],a.delayLayer(e,c);return this};g.fn.stopLayer=function(d,c){var a,
b,f,e;for(b=0;b<this.length;b+=1)if(a=g(this[b]),f=F(this[b]),e=a.getLayer(d))g(e).stop(c),Q(a,f,e,"stop");return this};g.fn.stopLayerGroup=function(d,c){var a,b,f,e,k;for(b=0;b<this.length;b+=1)if(a=g(this[b]),f=a.getLayerGroup(d))for(k=0;k<f.length;k+=1)e=f[k],a.stopLayer(e,c);return this};(function(d){var c;for(c=0;c<d.length;c+=1)g.fx.step[d[c]]=Ta})("color backgroundColor borderColor borderTopColor borderRightColor borderBottomColor borderLeftColor fillStyle outlineColor strokeStyle shadowColor".split(" "));
Y.touchEvents={mousedown:"touchstart",mouseup:"touchend",mousemove:"touchmove"};Y.mouseEvents={touchstart:"mousedown",touchend:"mouseup",touchmove:"mousemove"};(function(d){var c;for(c=0;c<d.length;c+=1)Wa(d[c])})("click dblclick mousedown mouseup mousemove mouseover mouseout touchstart touchmove touchend".split(" "));g.event.fix=function(d){var c,a;d=Za.call(g.event,d);if(c=d.originalEvent)if(a=c.changedTouches,d.pageX!==v&&d.offsetX===v){if(c=g(d.currentTarget).offset())d.offsetX=d.pageX-c.left,
d.offsetY=d.pageY-c.top}else a&&(c=g(d.currentTarget).offset())&&(d.offsetX=a[0].pageX-c.left,d.offsetY=a[0].pageY-c.top);return d};Y.drawings={arc:"drawArc",bezier:"drawBezier",ellipse:"drawEllipse","function":"draw",image:"drawImage",line:"drawLine",path:"drawPath",polygon:"drawPolygon",slice:"drawSlice",quadratic:"drawQuadratic",rectangle:"drawRect",text:"drawText",vector:"drawVector",save:"saveCanvas",restore:"restoreCanvas",rotate:"rotateCanvas",scale:"scaleCanvas",translate:"translateCanvas"};
g.fn.draw=function c(a){var b,f,e=new H(a);if(Y.drawings[e.type]&&"function"!==e.type)this[Y.drawings[e.type]](a);else for(b=0;b<this.length;b+=1)if(g(this[b]),f=L(this[b]))e=new H(a),P(this[b],e,a,c),e.visible&&e.fn&&e.fn.call(this[b],f,e);return this};g.fn.clearCanvas=function a(b){var f,e,k=new H(b);for(f=0;f<this.length;f+=1)if(e=L(this[f]))k.width===h||k.height===h?(e.save(),e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,this[f].width,this[f].height),e.restore()):(P(this[f],k,b,a),S(this[f],e,k,
k.width,k.height),e.clearRect(k.x-k.width/2,k.y-k.height/2,k.width,k.height),k._transformed&&e.restore());return this};g.fn.saveCanvas=function b(f){var e,k,g,h,t;for(e=0;e<this.length;e+=1)if(k=L(this[e]))for(h=F(this[e]),g=new H(f),P(this[e],g,f,b),t=0;t<g.count;t+=1)fa(k,h);return this};g.fn.restoreCanvas=function f(e){var k,g,h,t,M;for(k=0;k<this.length;k+=1)if(g=L(this[k]))for(t=F(this[k]),h=new H(e),P(this[k],h,e,f),M=0;M<h.count;M+=1){var B=g,z=t;0===z.savedTransforms.length?z.transforms=ka(na):
(B.restore(),z.transforms=z.savedTransforms.pop())}return this};g.fn.rotateCanvas=function e(k){var g,h,t,M;for(g=0;g<this.length;g+=1)if(h=L(this[g]))M=F(this[g]),t=new H(k),P(this[g],t,k,e),t.autosave&&fa(h,M),ya(h,t,M.transforms);return this};g.fn.scaleCanvas=function k(g){var h,t,M,B;for(h=0;h<this.length;h+=1)if(t=L(this[h]))B=F(this[h]),M=new H(g),P(this[h],M,g,k),M.autosave&&fa(t,B),za(t,M,B.transforms);return this};g.fn.translateCanvas=function G(g){var h,M,B,z;for(h=0;h<this.length;h+=1)if(M=
L(this[h]))z=F(this[h]),B=new H(g),P(this[h],B,g,G),B.autosave&&fa(M,z),Aa(M,B,z.transforms);return this};g.fn.drawRect=function D(g){var h,B,z,A,m,u,p,x,K;for(h=0;h<this.length;h+=1)if(B=L(this[h]))z=new H(g),P(this[h],z,g,D),z.visible&&(T(this[h],B,z),S(this[h],B,z,z.width,z.height),B.beginPath(),z.width&&z.height&&(A=z.x-z.width/2,m=z.y-z.height/2,(x=Ya(z.cornerRadius))?(u=z.x+z.width/2,p=z.y+z.height/2,0>z.width&&(K=A,A=u,u=K),0>z.height&&(K=m,m=p,p=K),0>u-A-2*x&&(x=(u-A)/2),0>p-m-2*x&&(x=(p-
m)/2),B.moveTo(A+x,m),B.lineTo(u-x,m),B.arc(u-x,m+x,x,3*E/2,2*E,y),B.lineTo(u,p-x),B.arc(u-x,p-x,x,0,E/2,y),B.lineTo(A+x,p),B.arc(A+x,p-x,x,E/2,E,y),B.lineTo(A,m+x),B.arc(A+x,m+x,x,E,3*E/2,y),z.closed=q):B.rect(A,m,z.width,z.height)),U(this[h],B,z),X(this[h],B,z));return this};g.fn.drawArc=function t(g){var h,z,A;for(h=0;h<this.length;h+=1)if(z=L(this[h]))A=new H(g),P(this[h],A,g,t),A.visible&&(T(this[h],z,A),S(this[h],z,A,2*A.radius),z.beginPath(),Ia(this[h],z,A,A),U(this[h],z,A),X(this[h],z,A));
return this};g.fn.drawEllipse=function M(g){var h,A,m,u,p;for(h=0;h<this.length;h+=1)if(A=L(this[h]))m=new H(g),P(this[h],m,g,M),m.visible&&(T(this[h],A,m),S(this[h],A,m,m.width,m.height),u=4/3*m.width,p=m.height,A.beginPath(),A.moveTo(m.x,m.y-p/2),A.bezierCurveTo(m.x-u/2,m.y-p/2,m.x-u/2,m.y+p/2,m.x,m.y+p/2),A.bezierCurveTo(m.x+u/2,m.y+p/2,m.x+u/2,m.y-p/2,m.x,m.y-p/2),U(this[h],A,m),m.closed=q,X(this[h],A,m));return this};g.fn.drawPolygon=function B(h){var g,m,u,p,x,K,I,w,n,l;for(g=0;g<this.length;g+=
1)if(m=L(this[g]))if(u=new H(h),P(this[g],u,h,B),u.visible){T(this[g],m,u);S(this[g],m,u,2*u.radius);x=2*E/u.sides;K=x/2;p=K+E/2;I=u.radius*N(K);m.beginPath();for(l=0;l<u.sides;l+=1)w=u.x+u.radius*N(p),n=u.y+u.radius*R(p),m.lineTo(w,n),u.concavity&&(w=u.x+(I+-I*u.concavity)*N(p+K),n=u.y+(I+-I*u.concavity)*R(p+K),m.lineTo(w,n)),p+=x;U(this[g],m,u);u.closed=q;X(this[g],m,u)}return this};g.fn.drawSlice=function z(h){var m,u,p,x,K;for(m=0;m<this.length;m+=1)if(g(this[m]),u=L(this[m]))p=new H(h),P(this[m],
p,h,z),p.visible&&(T(this[m],u,p),S(this[m],u,p,2*p.radius),p.start*=p._toRad,p.end*=p._toRad,p.start-=E/2,p.end-=E/2,p.start=Ha(p.start),p.end=Ha(p.end),p.end<p.start&&(p.end+=2*E),x=(p.start+p.end)/2,K=p.radius*p.spread*N(x),x=p.radius*p.spread*R(x),p.x+=K,p.y+=x,u.beginPath(),u.arc(p.x,p.y,p.radius,p.start,p.end,p.ccw),u.lineTo(p.x,p.y),U(this[m],u,p),p.closed=q,X(this[m],u,p));return this};g.fn.drawLine=function A(h){var g,p,x;for(g=0;g<this.length;g+=1)if(p=L(this[g]))x=new H(h),P(this[g],x,
h,A),x.visible&&(T(this[g],p,x),S(this[g],p,x),p.beginPath(),Ka(this[g],p,x,x),U(this[g],p,x),X(this[g],p,x));return this};g.fn.drawQuadratic=function m(g){var h,x,K;for(h=0;h<this.length;h+=1)if(x=L(this[h]))K=new H(g),P(this[h],K,g,m),K.visible&&(T(this[h],x,K),S(this[h],x,K),x.beginPath(),La(this[h],x,K,K),U(this[h],x,K),X(this[h],x,K));return this};g.fn.drawBezier=function u(h){var g,K,I;for(g=0;g<this.length;g+=1)if(K=L(this[g]))I=new H(h),P(this[g],I,h,u),I.visible&&(T(this[g],K,I),S(this[g],
K,I),K.beginPath(),Ma(this[g],K,I,I),U(this[g],K,I),X(this[g],K,I));return this};g.fn.drawVector=function p(g){var h,I,w;for(h=0;h<this.length;h+=1)if(I=L(this[h]))w=new H(g),P(this[h],w,g,p),w.visible&&(T(this[h],I,w),S(this[h],I,w),I.beginPath(),Pa(this[h],I,w,w),U(this[h],I,w),X(this[h],I,w));return this};g.fn.drawPath=function x(h){var g,w,n,l,C;for(g=0;g<this.length;g+=1)if(w=L(this[g]))if(n=new H(h),P(this[g],n,h,x),n.visible){T(this[g],w,n);S(this[g],w,n);w.beginPath();for(l=1;q;)if(C=n["p"+
l],C!==v)C=new H(C),"line"===C.type?Ka(this[g],w,n,C):"quadratic"===C.type?La(this[g],w,n,C):"bezier"===C.type?Ma(this[g],w,n,C):"vector"===C.type?Pa(this[g],w,n,C):"arc"===C.type&&Ia(this[g],w,n,C),l+=1;else break;U(this[g],w,n);X(this[g],w,n)}return this};g.fn.drawText=function K(I){var w,n,l,C,V,s,O,q,v,y;for(w=0;w<this.length;w+=1)if(g(this[w]),n=L(this[w]))if(l=new H(I),C=P(this[w],l,I,K),l.visible){T(this[w],n,l);n.textBaseline=l.baseline;n.textAlign=l.align;ra(this[w],n,l);V=l.maxWidth!==h?
Qa(n,l):l.text.toString().split("\n");sa(this[w],n,l,V);C&&(C.width=l.width,C.height=l.height);S(this[w],n,l,l.width,l.height);O=l.x;"left"===l.align?l.respectAlign?l.x+=l.width/2:O-=l.width/2:"right"===l.align&&(l.respectAlign?l.x-=l.width/2:O+=l.width/2);if(l.radius)for(O=ea(l.fontSize),l.letterSpacing===h&&(l.letterSpacing=O/500),s=0;s<V.length;s+=1){n.save();n.translate(l.x,l.y);C=V[s];q=C.length;n.rotate(-(E*l.letterSpacing*(q-1))/2);for(y=0;y<q;y+=1)v=C[y],0!==y&&n.rotate(E*l.letterSpacing),
n.save(),n.translate(0,-l.radius),n.fillText(v,0,0),n.restore();l.radius-=O;l.letterSpacing+=O/(1E3*E);n.restore()}else for(s=0;s<V.length;s+=1)C=V[s],q=l.y+s*l.height/V.length-(V.length-1)*l.height/V.length/2,n.shadowColor=l.shadowColor,n.fillText(C,O,q),"transparent"!==l.fillStyle&&(n.shadowColor="transparent"),0!==l.strokeWidth&&n.strokeText(C,O,q);q=0;"top"===l.baseline?q+=l.height/2:"bottom"===l.baseline&&(q-=l.height/2);l._event&&(n.beginPath(),n.rect(l.x-l.width/2,l.y-l.height/2+q,l.width,
l.height),U(this[w],n,l),n.closePath());l._transformed&&n.restore()}ba.propCache=l;return this};g.fn.measureText=function(g){var h,w;h=this.getLayer(g);if(!h||h&&!h._layer)h=new H(g);if(g=L(this[0]))ra(this[0],g,h),w=Qa(g,h),sa(this[0],g,h,w);return h};g.fn.drawImage=function I(w){function n(l,n,s,r,w){return function(){var C=g(l);T(l,n,r);r.width===h&&r.sWidth===h&&(r.width=r.sWidth=J.width);r.height===h&&r.sHeight===h&&(r.height=r.sHeight=J.height);w&&(w.width=r.width,w.height=r.height);r.sWidth!==
h&&r.sHeight!==h&&r.sx!==h&&r.sy!==h?(r.width===h&&(r.width=r.sWidth),r.height===h&&(r.height=r.sHeight),r.cropFromCenter&&(r.sx+=r.sWidth/2,r.sy+=r.sHeight/2),0>r.sy-r.sHeight/2&&(r.sy=r.sHeight/2),r.sy+r.sHeight/2>J.height&&(r.sy=J.height-r.sHeight/2),0>r.sx-r.sWidth/2&&(r.sx=r.sWidth/2),r.sx+r.sWidth/2>J.width&&(r.sx=J.width-r.sWidth/2),S(l,n,r,r.width,r.height),n.drawImage(J,r.sx-r.sWidth/2,r.sy-r.sHeight/2,r.sWidth,r.sHeight,r.x-r.width/2,r.y-r.height/2,r.width,r.height)):(S(l,n,r,r.width,r.height),
n.drawImage(J,r.x-r.width/2,r.y-r.height/2,r.width,r.height));n.beginPath();n.rect(r.x-r.width/2,r.y-r.height/2,r.width,r.height);U(l,n,r);n.closePath();r._transformed&&n.restore();xa(n,s,r);r.layer?Q(C,s,w,"load"):r.load&&r.load.call(C[0],w);r.layer&&(w._masks=s.transforms.masks.slice(0),r._next&&C.drawLayers({clear:y,resetFire:q,index:r._next}))}}var l,C,V,s,O,v,J,E,N,R=ba.imageCache;for(C=0;C<this.length;C+=1)if(l=this[C],V=L(this[C]))s=F(this[C]),O=new H(w),v=P(this[C],O,w,I),O.visible&&(N=O.source,
E=N.getContext,N.src||E?J=N:N&&(R[N]&&R[N].complete?J=R[N]:(J=new va,J.crossOrigin=O.crossOrigin,J.src=N,R[N]=J)),J&&(J.complete||E?n(l,V,s,O,v)():(J.onload=n(l,V,s,O,v),J.src=J.src)));return this};g.fn.createPattern=function(I){function w(){s=l.createPattern(q,C.repeat);C.load&&C.load.call(n[0],s)}var n=this,l,C,q,s,v;(l=L(n[0]))?(C=new H(I),v=C.source,da(v)?(q=g("<canvas />")[0],q.width=C.width,q.height=C.height,I=L(q),v.call(q,I),w()):(I=v.getContext,v.src||I?q=v:(q=new va,q.crossOrigin=C.crossOrigin,
q.src=v),q.complete||I?w():(q.onload=w(),q.src=q.src))):s=h;return s};g.fn.createGradient=function(g){var w,n=[],l,q,y,s,O,E,J;g=new H(g);if(w=L(this[0])){g.x1=g.x1||0;g.y1=g.y1||0;g.x2=g.x2||0;g.y2=g.y2||0;w=g.r1!==h&&g.r2!==h?w.createRadialGradient(g.x1,g.y1,g.r1,g.x2,g.y2,g.r2):w.createLinearGradient(g.x1,g.y1,g.x2,g.y2);for(s=1;g["c"+s]!==v;s+=1)g["s"+s]!==v?n.push(g["s"+s]):n.push(h);l=n.length;n[0]===h&&(n[0]=0);n[l-1]===h&&(n[l-1]=1);for(s=0;s<l;s+=1){if(n[s]!==h){E=1;J=0;q=n[s];for(O=s+1;O<
l;O+=1)if(n[O]!==h){y=n[O];break}else E+=1;q>y&&(n[O]=n[s])}else n[s]===h&&(J+=1,n[s]=q+(y-q)/E*J);w.addColorStop(n[s],g["c"+(s+1)])}}else w=h;return w};g.fn.setPixels=function w(g){var l,q,v,s,y,E,J,F,N;for(q=0;q<this.length;q+=1)if(l=this[q],v=L(l)){s=new H(g);P(l,s,g,w);S(this[q],v,s,s.width,s.height);if(s.width===h||s.height===h)s.width=l.width,s.height=l.height,s.x=s.width/2,s.y=s.height/2;if(0!==s.width&&0!==s.height){E=v.getImageData(s.x-s.width/2,s.y-s.height/2,s.width,s.height);J=E.data;
N=J.length;if(s.each)for(F=0;F<N;F+=4)y={r:J[F],g:J[F+1],b:J[F+2],a:J[F+3]},s.each.call(l,y,s),J[F]=y.r,J[F+1]=y.g,J[F+2]=y.b,J[F+3]=y.a;v.putImageData(E,s.x-s.width/2,s.y-s.height/2);v.restore()}}return this};g.fn.getCanvasImage=function(g,n){var l,q=h;0!==this.length&&(l=this[0],l.toDataURL&&(n===v&&(n=1),q=l.toDataURL("image/"+g,n)));return q};g.fn.detectPixelRatio=function(h){var n,l,v,y,s,E,H;for(l=0;l<this.length;l+=1)n=this[l],g(this[l]),v=L(n),H=F(this[l]),H.scaled||(y=window.devicePixelRatio||
1,s=v.webkitBackingStorePixelRatio||v.mozBackingStorePixelRatio||v.msBackingStorePixelRatio||v.oBackingStorePixelRatio||v.backingStorePixelRatio||1,y/=s,1!==y&&(s=n.width,E=n.height,n.width=s*y,n.height=E*y,n.style.width=s+"px",n.style.height=E+"px",v.scale(y,y)),H.pixelRatio=y,H.scaled=q,h&&h.call(n,y));return this};$.clearCache=function(){for(var g in ba)ba.hasOwnProperty(g)&&(ba[g]={})};g.support.canvas=g("<canvas />")[0].getContext!==v;Z($,{defaults:la,prefs:void 0,setGlobalProps:T,transformShape:S,
detectEvents:U,closePath:X,setCanvasFont:ra,measureText:sa});g.jCanvas=$;g.jCanvasObject=H})(jQuery,document,Image,Array,Math,parseFloat,window.console,!0,!1,null);