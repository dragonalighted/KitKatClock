/*
=================================================
KitKatClock jQuery Plugin

Author: Bryan Iddings
http://iddings.co/KitKatClock

****MAINTAIN THIS HEADER WHEN REDISTRIBUTING****

This work is licensed under the Creative
Commons Attribution-NonCommercial-ShareAlike
4.0 International License. To view a copy of
this license, visit
http://creativecommons.org/licenses/by-nc-sa/4.0/
=================================================
*/
(function( $ ) {
    $.fn.kitkatclock=function(options){
        return this.each(function(){
            options=options||{};
            var clock_dim=options.size||350;
            var fontSize=options.fontSize||48;
            var colors=options.colors||{};
            colors.clock=colors.clock||"#050505";
            colors.numerals=colors.numerals||"#fff";
            colors.hand=colors.hand||'#960000';
            colors.background=colors.background||"#222222";
            var padding=10;
            var radius=clock_dim/2;
            var pi=Math.PI;
            var mouse_down=false;
            var hour_mode=true;
            var allow_draw=true;
            var clock, hand, numerals, hour_display, minute_display, canvas_container, am, pm, am_pm, am_pm_text;
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
                container.show();
                var input_offset=input.offset();
                var window_size={
                    width:$(window).width(),
                    height:$(window).height()
                }
                var plugin_size={
                    width:container.outerWidth(),
                    height:container.outerHeight()
                }
                var plugin_position={
                    top:input_offset.top,
                    left:input_offset.left
                }
                while (plugin_position.top+plugin_size.height>window_size.height &&
                        plugin_position.top>0){
                    plugin_position.top-=1;
                }
                while (plugin_position.left+plugin_size.width>window_size.width &&
                        plugin_position.left>0){
                    plugin_position.left-=1;
                }
                container.css({
                    position:"absolute",
                    top: plugin_position.top, left: plugin_position.left
                });
                var am_pm_position={
                    top:minute_display.height()+minute_display.position().top-am_pm_text.height()-5,
                    left:minute_display.width()+minute_display.position().left
                }
                am_pm_text.css({
                    position:"absolute",
                    top: am_pm_position.top,
                    left: am_pm_position.left
                })
                $("body").on("click", function(event){
                    var target=event.target;
                    if (!$(target).is(container) &&
                        container.has(target).length==0 &&
                        !$(target).is(input))
                        finalize_time();
                })
                $("*", container).css("textShadow", "none");
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
                        am_pm_text.html("AM");
                    }
                    else{
                        pm.css("background", "#960000");
                        am.css("background", "#500000");
                        am_pm_text.html("PM");
                    }
                }).hide();
                am=$("<canvas>");
                pm=$("<canvas>");
                var am_text=$("<div>AM</div>").css({
                    position:"absolute",
                    top:fontSize+clock_dim-25, left:padding+5,
                    width:50, textAlign:"center",
                    fontSize:"24px", fontFamily:"Verdana, sans-serif",
                    cursor:"pointer"
                }).on("click", function(){
                    am.trigger("click");
                });
                var pm_text=$("<div>PM</div>").css({
                    position:"absolute",
                    top:fontSize+clock_dim-25, right:padding+5,
                    width:50, textAlign:"center",
                    fontSize:"24px", fontFamily:"Verdana, sans-serif",
                    cursor:"pointer"
                }).on("click", function(){
                    pm.trigger("click");
                });
                am_pm_text=$("<div>").css({
                    color:"white",
                    display:"inline-block"
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
                        this.css("left", padding+5);
                    else
                        this.css("right", padding+5);
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
                    borderRadius:"3px", padding:"3px "+padding+"px",
                    border: "3px solid #ccc",
                    fontFamily: "Verdana, sans-serif", color:"white"
                });
                canvas_container=$("<div>").css({
                    position:"absolute",
                    top:fontSize+10, left:padding,
                    width:clock_dim, height:clock_dim,
                    cursor:"hand"
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
                }).css({
                    fontSize: fontSize,
                    cursor: "pointer"
                });
                minute_display=$("<span>").html("00").on("click", function(){
                    hour_mode=false;
                    draw_minutes();
                }).css({
                    fontSize: fontSize,
                    cursor: "pointer"
                });
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
                container.append(canvas_container).append(time_display).append(done_button).append(am).append(pm).append(am_text).append(pm_text).append(am_pm_text);
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
                        var cur_offset=canvas_container.offset();
                        event.offsetX-=cur_offset.left;
                        event.offsetY-=cur_offset.top;
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
    };
} ) (jQuery);