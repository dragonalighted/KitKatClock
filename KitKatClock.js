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
            var html_colors={"aliceblue":"rgba(240,248,255,1)","antiquewhite":"rgba(250,235,215,1)","aqua":"rgba(0,255,255,1)","aquamarine":"rgba(127,255,212,1)","azure":"rgba(240,255,255,1)","beige":"rgba(245,245,220,1)","bisque":"rgba(255,228,196,1)","black":"rgba(0,0,0,1)","blanchedalmond":"rgba(255,235,205,1)","blue":"rgba(0,0,255,1)","blueviolet":"rgba(138,43,226,1)","brown":"rgba(165,42,42,1)","burlywood":"rgba(222,184,135,1)","cadetblue":"rgba(95,158,160,1)","chartreuse":"rgba(127,255,0,1)","chocolate":"rgba(210,105,30,1)","coral":"rgba(255,127,80,1)","cornflowerblue":"rgba(100,149,237,1)","cornsilk":"rgba(255,248,220,1)","crimson":"rgba(220,20,60,1)","cyan":"rgba(0,255,255,1)","darkblue":"rgba(0,0,139,1)","darkcyan":"rgba(0,139,139,1)","darkgoldenrod":"rgba(184,134,11,1)","darkgray":"rgba(169,169,169,1)","darkgreen":"rgba(0,100,0,1)","darkkhaki":"rgba(189,183,107,1)","darkmagenta":"rgba(139,0,139,1)","darkolivegreen":"rgba(85,107,47,1)","darkorange":"rgba(255,140,0,1)","darkorchid":"rgba(153,50,204,1)","darkred":"rgba(139,0,0,1)","darksalmon":"rgba(233,150,122,1)","darkseagreen":"rgba(143,188,143,1)","darkslateblue":"rgba(72,61,139,1)","darkslategray":"rgba(47,79,79,1)","darkturquoise":"rgba(0,206,209,1)","darkviolet":"rgba(148,0,211,1)","deeppink":"rgba(255,20,147,1)","deepskyblue":"rgba(0,191,255,1)","dimgray":"rgba(105,105,105,1)","dodgerblue":"rgba(30,144,255,1)","firebrick":"rgba(178,34,34,1)","floralwhite":"rgba(255,250,240,1)","forestgreen":"rgba(34,139,34,1)","fuchsia":"rgba(255,0,255,1)","gainsboro":"rgba(220,220,220,1)","ghostwhite":"rgba(248,248,255,1)","gold":"rgba(255,215,0,1)","goldenrod":"rgba(218,165,32,1)","gray":"rgba(128,128,128,1)","green":"rgba(0,128,0,1)","greenyellow":"rgba(173,255,47,1)","honeydew":"rgba(240,255,240,1)","hotpink":"rgba(255,105,180,1)","indianred":"rgba(205,92,92,1)","indigo":"rgba(75,0,130,1)","ivory":"rgba(255,255,240,1)","khaki":"rgba(240,230,140,1)","lavender":"rgba(230,230,250,1)","lavenderblush":"rgba(255,240,245,1)","lawngreen":"rgba(124,252,0,1)","lemonchiffon":"rgba(255,250,205,1)","lightblue":"rgba(173,216,230,1)","lightcoral":"rgba(240,128,128,1)","lightcyan":"rgba(224,255,255,1)","lightgoldenrodyellow":"rgba(250,250,210,1)","lightgray":"rgba(211,211,211,1)","lightgreen":"rgba(144,238,144,1)","lightpink":"rgba(255,182,193,1)","lightsalmon":"rgba(255,160,122,1)","lightseagreen":"rgba(32,178,170,1)","lightskyblue":"rgba(135,206,250,1)","lightslategray":"rgba(119,136,153,1)","lightsteelblue":"rgba(176,196,222,1)","lightyellow":"rgba(255,255,224,1)","lime":"rgba(0,255,0,1)","limegreen":"rgba(50,205,50,1)","linen":"rgba(250,240,230,1)","magenta":"rgba(255,0,255,1)","maroon":"rgba(128,0,0,1)","mediumaquamarine":"rgba(102,205,170,1)","mediumblue":"rgba(0,0,205,1)","mediumorchid":"rgba(186,85,211,1)","mediumpurple":"rgba(147,112,219,1)","mediumseagreen":"rgba(60,179,113,1)","mediumslateblue":"rgba(123,104,238,1)","mediumspringgreen":"rgba(0,250,154,1)","mediumturquoise":"rgba(72,209,204,1)","mediumvioletred":"rgba(199,21,133,1)","midnightblue":"rgba(25,25,112,1)","mintcream":"rgba(245,255,250,1)","mistyrose":"rgba(255,228,225,1)","moccasin":"rgba(255,228,181,1)","navajowhite":"rgba(255,222,173,1)","navy":"rgba(0,0,128,1)","oldlace":"rgba(253,245,230,1)","olive":"rgba(128,128,0,1)","olivedrab":"rgba(107,142,35,1)","orange":"rgba(255,165,0,1)","orangered":"rgba(255,69,0,1)","orchid":"rgba(218,112,214,1)","palegoldenrod":"rgba(238,232,170,1)","palegreen":"rgba(152,251,152,1)","paleturquoise":"rgba(175,238,238,1)","palevioletred":"rgba(219,112,147,1)","papayawhip":"rgba(255,239,213,1)","peachpuff":"rgba(255,218,185,1)","peru":"rgba(205,133,63,1)","pink":"rgba(255,192,203,1)","plum":"rgba(221,160,221,1)","powderblue":"rgba(176,224,230,1)","purple":"rgba(128,0,128,1)","red":"rgba(255,0,0,1)","rosybrown":"rgba(188,143,143,1)","royalblue":"rgba(65,105,225,1)","saddlebrown":"rgba(139,69,19,1)","salmon":"rgba(250,128,114,1)","sandybrown":"rgba(244,164,96,1)","seagreen":"rgba(46,139,87,1)","seashell":"rgba(255,245,238,1)","sienna":"rgba(160,82,45,1)","silver":"rgba(192,192,192,1)","skyblue":"rgba(135,206,235,1)","slateblue":"rgba(106,90,205,1)","slategray":"rgba(112,128,144,1)","snow":"rgba(255,250,250,1)","springgreen":"rgba(0,255,127,1)","steelblue":"rgba(70,130,180,1)","tan":"rgba(210,180,140,1)","teal":"rgba(0,128,128,1)","thistle":"rgba(216,191,216,1)","tomato":"rgba(255,99,71,1)","turquoise":"rgba(64,224,208,1)","violet":"rgba(238,130,238,1)","wheat":"rgba(245,222,179,1)","white":"rgba(255,255,255,1)","whitesmoke":"rgba(245,245,245,1)","yellow":"rgba(255,255,0,1)","yellowgreen":"rgba(154,205,50,1)"};
            function normalize_color(c){
                if (c==null)
                    return null;
                c=c.replace("#", "").replace(/grey/i, "gray");
                if (c.indexOf("rgb")!=-1){
                    if (c.indexOf("rgba")!=-1)
                        return c;
                    else {
                        rgb=c.split("(")[1].split(")")[0];
                        return "rgba("+rgb+",1)";
                    }
                }
                else if (!!html_colors[c.toLowerCase()]){
                    return html_colors[c.toLowerCase()];
                }
                else {
                    if (c.length==3){
                        var r=c.substring(0,1);
                        var g=c.substring(1,2);
                        var b=c.substring(2,3);
                        r+=r;
                        g+=g;
                        b+=b;
                    }
                    else {
                        var r=c.substring(0,2);
                        var g=c.substring(2,4);
                        var b=c.substring(4,6);
                    }
                    return "rgba("+parseInt(r,16)+","+parseInt(g,16)+","+parseInt(b,16)+",1)";
                }
            }
            function calculate_from_alpha(fg, bg, a){
                bg=bg.replace(/rgba|\(|\)/g, "");
                fg=fg.replace(/rgba|\(|\)/g, "");
                bg=bg.split(",");
                fg=fg.split(",");
                return "rgba(" +
                    Math.round((1 - a) * parseInt(bg[0]) + parseInt(fg[0]) * a) + "," +
                    Math.round((1 - a) * parseInt(bg[1]) + parseInt(fg[1]) * a) + "," +
                    Math.round((1 - a) * parseInt(bg[2]) + parseInt(fg[2]) * a) + ",1)";
            }
            options=options||{};
            var clock_dim=options.size||350;
            if (typeof clock_dim !== "number"){
                if (clock_dim.indexOf("pt"))
                    clock_dim=parseFloat(clock_dim)*(4/3);
                else
                    clock_dim=parseFloat(clock_dim);
            }
            clock_dim-=26;
            var fontSize=options.fontSize||40;
            if (typeof fontSize !== "number"){
                if (fontSize.indexOf("pt"))
                    fontSize=parseFloat(fontSize)*(4/3);
                else
                    fontSize=parseFloat(fontSize);
            }
            var fontFamily=options.fontFamily||"Verdana, sans-serif";
            var colors=options["colors"]||{};
            colors.text=colors["text"]||"#FFFFFF";
            colors.clock=colors["clock"]||"#050505";
            colors.numerals=colors["numerals"]||colors["text"];
            colors.hand=colors["hand"]||'#960000';
            colors.background=colors["background"]||"#222222";
            colors.meridian_background_on=colors["meridian_background_on"]||colors["hand"];
            colors.meridian_background_off=colors["meridian_background_off"]||null;
            colors.meridian_text=colors["meridian_text"]||colors["text"];
            colors.top_indicator_selected=colors["top_indicator_selected"]||colors["hand"];
            colors.top_indicator_deselected=colors["top_indicator_deselected"]||colors["text"];
            colors.top_indicator_background=colors["top_indicator_background"]||colors["clock"];
            colors.border=colors["border"]||"#CCCCCC";
            for (var key in colors){
                colors[key]=normalize_color(colors[key]);
            }
            if (!colors.meridian_background_off){
                colors.meridian_background_off=calculate_from_alpha(colors.meridian_background_on, colors.background, .6);
            }
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
                var document_size={
                    width:$(document).width(),
                    height:$(document).height()
                }
                var plugin_size={
                    width:container.outerWidth(),
                    height:container.outerHeight()
                }
                var plugin_position={
                    top:input_offset.top,
                    left:input_offset.left
                }
                var current_scroll={
                    top:$("body").scrollTop(),
                    left:$("body").scrollLeft()
                }
                var current_viewport={
                    top:current_scroll.top,
                    bottom:current_scroll.top+window_size.height,
                    left:current_scroll.left,
                    right:current_scroll.left+window_size.width
                };
                while (plugin_position.top+plugin_size.height>document_size.height &&
                        plugin_position.top>0){
                    plugin_position.top-=1;
                }
                while (plugin_position.left+plugin_size.width>document_size.width &&
                        plugin_position.left>0){
                    plugin_position.left-=1;
                }
                if (plugin_size.width<=window_size.width){
                    while (plugin_position.left<current_viewport.left){
                        plugin_position.left++;
                    }
                    while (plugin_position.left+plugin_size.width>current_viewport.right){
                        plugin_position.left--;
                    }
                }
                else {
                    plugin_position.left=current_viewport.left-(plugin_size.width-window_size.width)/2;
                }
                if (plugin_size.height<=window_size.height){
                    while (plugin_position.top<current_viewport.top){
                        plugin_position.top++;
                    }
                    while (plugin_position.top+plugin_size.height>current_viewport.bottom){
                        plugin_position.top--;
                    }
                }
                else {
                    plugin_position.top=current_viewport.top-(plugin_size.height-window_size.height)/2;
                }

                container.css({
                    position:"absolute",
                    top: plugin_position.top, left: plugin_position.left
                });
                var hour_display_back=hour_display.html();
                hour_display.html("12");
                var am_pm_position={
                    top:minute_display.height()+minute_display.position().top-am_pm_text.height()-5,
                    left:minute_display.width()+minute_display.position().left
                }
                am_pm_text.css({
                    position:"absolute",
                    top: am_pm_position.top,
                    left: am_pm_position.left
                });
                hour_display.html(hour_display_back);
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
                        //alert(colors.meridian_background_off);
                        draw_am_pm(am[0], colors.meridian_background_on);
                        draw_am_pm(pm[0], colors.meridian_background_off);
                        am_pm_text.html("AM");
                    }
                    else{
                        draw_am_pm(pm[0], colors.meridian_background_on);
                        draw_am_pm(am[0], colors.meridian_background_off);
                        am_pm_text.html("PM");
                    }
                }).hide();
                am=$("<canvas>");
                pm=$("<canvas>");
                var am_text=$("<div>AM</div>").css({
                    position:"absolute",
                    top:10+clock_dim, left:padding,
                    width:fontSize, height:fontSize,
                    textAlign:"center", lineHeight:fontSize+"px",
                    fontSize:fontSize/2, fontFamily:fontFamily,
                    cursor:"pointer"
                }).on("click", function(){
                    am.trigger("click");
                });
                var pm_text=$("<div>PM</div>").css({
                    position:"absolute",
                    top:10+clock_dim, right:padding,
                    width:fontSize, height:fontSize,
                    textAlign:"center", lineHeight:fontSize+"px",
                    fontSize:fontSize/2, fontFamily:fontFamily,
                    cursor:"pointer"
                }).on("click", function(){
                    pm.trigger("click");
                });
                am_pm_text=$("<div>").css({
                    color:colors.top_indicator_deselected,
                    display:"inline-block"
                });
                $([am, pm]).each(function(){
                    this.attr({
                        height:fontSize,
                        width:fontSize
                    }).on("click", function(){
                        am_pm[0].checked=$(this).is(am);
                        am_pm.trigger("change");
                    }).css({
                        position:"absolute",
                        top:clock_dim+10
                    });
                    if (this==am)
                        this.css("left", padding);
                    else
                        this.css("right", padding);
                    draw_am_pm(this[0], colors.meridian_background_on);
                });
                if (input.val().toUpperCase().indexOf("AM")!=-1){
                    am_pm[0].checked=true;
                }
                am_pm.trigger("change");
                container.css({
                    width:clock_dim, height:clock_dim+(fontSize*2)+10,
                    zIndex:9999999,
                    backgroundColor:colors.background,
                    borderRadius:"3px", padding:"3px "+padding+"px",
                    border: "3px solid "+colors.border,
                    fontFamily: fontFamily, color:colors.text
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
                    background:colors.top_indicator_background, color:colors.top_indicator_deselected
                });          
                var done_button=$("<div>Done</div>").css({
                    width:"100%", cursor:"pointer",
                    textAlign:"center",
                    fontSize:fontSize*(2/3),
                    position:"absolute",
                    borderTop:"1px solid "+colors.border,
                    color:colors.text,
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
            function draw_am_pm(el, color){
                //alert("");
                var ctx=el.getContext("2d");
                ctx.fillStyle=color;
                ctx.clearRect(0,0,fontSize*2, fontSize*2);
                ctx.arc(fontSize/2, fontSize/2, fontSize/2, 0, 2*pi);
                ctx.fill();
            }
            function finalize_time(){
                input.val(hour_display.html().replace("&nbsp;", "")+":"+minute_display.html()+" "+(am_pm[0].checked?"AM":"PM"));
                container.hide();
            }
            function draw_hours(){
                //numerals.clearCanvas();
                hour_display.css("color", colors.top_indicator_selected);
                minute_display.css("color", "");
                var ctx=numerals[0].getContext("2d");
                ctx.clearRect(0, 0, clock_dim, clock_dim);
                ctx.fillStyle=colors.numerals;
                ctx.font=fontSize+'px '+fontFamily;
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
                minute_display.css("color", colors.top_indicator_selected);
                hour_display.css("color", "");
                var ctx=numerals[0].getContext("2d");
                ctx.clearRect(0, 0, clock_dim, clock_dim);
                ctx.fillStyle=colors.numerals;
                ctx.font=fontSize+'px '+fontFamily;
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