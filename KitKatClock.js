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
        var clock, hand, numerals, hour_display, minute_display, canvas_container, am_pm;
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
            am_pm=$("<input type='checkbox'>");
            if (input.val().toUpperCase().indexOf("AM")!=-1)
                am_pm[0].checked=true;
            container.css({
                width:clock_dim, height:clock_dim+70,
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
            time_display.append(hour_display).append($("<span>:</span>").css("fontSize", fontSize)).append(minute_display).append(am_pm).css({
                position:"absolute",
                top:clock_dim+10, left:0,
                width:"100%", textAlign:"center"
            });
            canvas_container.append(clock).append(hand).append(numerals)
            container.append(canvas_container).append(time_display);
            am_pm.flipswitch({
                onText:"AM", offText:"PM",
                mini:true, wrapperClass:"kitkat-clock-am-pm",
                theme:"a"
            });
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
                //alert(event.type);
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
                    else {
                        finalize_time();
                    }
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