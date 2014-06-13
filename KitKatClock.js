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
;(function( $ ) {
    window["__kkc"]=[];
    var vendor_prefixes="webkit moz ms o".split(" ");
    var supported={'css3':false, 'canvas':false};
    var test=document.createElement("canvas");
    for (var i=0;i<vendor_prefixes.length;i++){
        if (test.style["-"+vendor_prefixes[i]+"-transform"]!==undefined){
            supported.css3=true;
            break;
        }
    }
    if (test.style["transform"]!==undefined)
        supported.css3=true;
    if (!!test.getContext)
        supported.canvas=true;
    if (!supported.css3){
        console.log("KitKatClock disabled, no CSS3 support");
        __kkc="KitKatClock Disabled";
        $.fn.kitkatclock=function(){return this;};
        return;
    }
    if (!supported.canvas){
        console.log("KitKatClock disabled, no canvas support");
        __kkc="KitKatClock Disabled";
        $.fn.kitkatclock=function(){return this;};
        return;
    }
    __kkc.allow_draw=true;
    __kkc.hour_mode=true;
    __kkc.mouse_down=false;
    __kkc.finalize=false;
    __kkc.degrade=true;
    __kkc.finalize_wrap=function(){
        if (__kkc.finalize!==false)
            __kkc.finalize();
    }
    __kkc.opener;
    __kkc.setup=function(options){
        __kkc.finalize=function(){
            if (__kkc.opener===null)
                return;
            var h=hours.html().replace("&nbsp;", "");
            var m=minutes.html();
            var is_am=am_pm.html();
            __kkc.opener.value=h+":"+m+" "+is_am;
            var id=parseInt($(__kkc.opener).attr("kkc-id"));
            __kkc[id].time=h+":"+m+" "+is_am;
            container.hide();
        }
        function draw_hours(options){
            var colors=options.colors;
            numbers.clearRect(0, 0, options.size, options.size);
            numbers.textBaseline="middle";
            numbers.fillStyle=colors.numerals;
            numbers.font=options.fontSize+"px "+options.fontFamily;
            numbers.textAlign="center";
            var radians=Math.PI/2;
            for (var i=0;i<12;i++){
                var x=radius+(Math.cos(radians)*(-1)*(radius-options.fontSize/1.75));
                var y=radius+(Math.sin(radians)*(-1)*(radius-options.fontSize/1.75));
                numbers.fillText(i==0?12:i, x, y);
                radians+=Math.PI/6;
            }
            move_hand(parseInt(container.attr("hour"))*Math.PI/6, options);
            hours.css("color", colors.hand);
            minutes.css("color", "");
        }
        function draw_minutes(options){
            var colors=options.colors;
            numbers.clearRect(0, 0, options.size, options.size);
            numbers.textBaseline="middle";
            numbers.fillStyle=colors.numerals;
            numbers.font=options.fontSize+"px "+options.fontFamily;
            numbers.textAlign="center";
            var radians=Math.PI/2;
            for (var i=0;i<12;i++){
                var x=radius+(Math.cos(radians)*(-1)*(radius-options.fontSize/1.6));
                var y=radius+(Math.sin(radians)*(-1)*(radius-options.fontSize/1.6));
                numbers.fillText(i*5, x, y);
                radians+=Math.PI/6;
            }
            move_hand(parseInt(container.attr("minute"))*Math.PI/30, options);
            hours.css("color", "");
            minutes.css("color", colors.hand);
        }
        function move_hand(radians, options){
            $("#kitkatclock .kkc-canvas-hand").css({
                    '-webkit-transform': "rotate("+(radians*180/Math.PI)+"deg)",
                    '-moz-transform': "rotate("+(radians*180/Math.PI)+"deg)",
                    '-ms-transform': "rotate("+(radians*180/Math.PI)+"deg)",
                    '-o-transform': "rotate("+(radians*180/Math.PI)+"deg)",
                    'transform': "rotate("+(radians*180/Math.PI)+"deg)"
            });
        }
        var colors=options.colors;
        var container=$("#kitkatclock");
        $("*", container).off();
        var time_cont=$("#kitkatclock .kkc-time-cont");
        var hours=$("#kitkatclock .kkc-hour");
        var minutes=$("#kitkatclock .kkc-minute");
        var am_pm=$("#kitkatclock .kkc-am-pm");
        var canvas_cont=$("#kitkatclock .kkc-canvas-cont");
        var clock=$("#kitkatclock .kkc-canvas-clock").attr({
            width:options.size, height:options.size
        }).css({
            position:"absolute", top:0, left:0,
            padding:"0px 10px"
        })[0].getContext("2d");
        var hand=$("#kitkatclock .kkc-canvas-hand").attr({
            width:options.fontSize*1.35, height:options.size
        }).css({
            position:"absolute", top:0, left:"calc(50% - "+(options.fontSize*1.35/2)+"px + 2px)",
        })[0].getContext("2d");
        var numbers=$("#kitkatclock .kkc-canvas-numbers").attr({
            width:options.size, height:options.size
        }).css({
            position:"absolute", top:0, left:0,
            padding:"0px 10px"
        })[0].getContext("2d");
        var am_btn=$("#kitkatclock .kkc-am-btn");
        var pm_btn=$("#kitkatclock .kkc-pm-btn");
        var done=$("#kitkatclock .kkc-done-btn");
        time_cont.css({
            height:options.fontSize, width:"100%",
            padding:"0px 0px 12px 0px",
            color:colors.text, background:colors.top_indicator_background
        });
        am_pm.css({
            fontSize:options.fontSize/2
        });
        canvas_cont.css({
            position:"relative", marginTop:4,
            height:options.size, cursor:"pointer"
        });
        var time=options.time.split(":");
        var h=parseInt(time[0]);
        var m=parseInt(time[1].split(" ")[0]);
        var is_am=time[1].toUpperCase().indexOf("AM")!=-1;
        container.attr({
            hour:h, minute:m
        })
        am_btn.css({
            position:"absolute",
            bottom:0, left:10,
            width:options.fontSize, height:options.fontSize,
            fontSize:options.fontSize/2, lineHeight:options.fontSize+"px",
            textAlign:"center", border:"1px solid transparent",
            borderRadius:options.fontSize/2, cursor:"pointer"
        });
        pm_btn.css({
            position:"absolute",
            bottom:0, right:10,
            width:options.fontSize, height:options.fontSize,
            fontSize:options.fontSize/2, lineHeight:options.fontSize+"px",
            textAlign:"center", border:"1px solid transparent",
            borderRadius:options.fontSize/2, cursor:"pointer"
        });
        hours.on("click", function(){
            draw_hours(options);
            __kkc.hour_mode=true;
        }).css({
            cursor:"pointer"
        });
        minutes.on("click", function(){
            draw_minutes(options);
            __kkc.hour_mode=false;
        }).css({
            cursor:"pointer"
        });
        if (is_am){
            am_btn.css("background", colors.meridian_background_on);
            pm_btn.css("background", colors.meridian_background_off);
        }
        else {
            pm_btn.css("background", colors.meridian_background_on);
            am_btn.css("background", colors.meridian_background_off);
        }
        hours.html(h);
        minutes.html((m<10?"0":"")+m);
        am_pm.html(is_am?"AM":"PM");
        done.css({
            borderTop:"1px solid "+colors.border,
            marginTop:"4px", cursor:"pointer"
        });
        var radius=options.size/2;
        clock.clearRect(0, 0, options.size, options.size);
        clock.fillStyle=colors.clock;
        clock.arc(radius, radius, radius, 0, 2*Math.PI);
        clock.fill();
        hand.clearRect(0, 0, options.size, options.size);
        var hand_width=options.fontSize*1.35;
        var a_x=hand_width/2;
        var a_y=radius+(-1*(radius-options.fontSize/1.5));
        hand.beginPath();
        hand.moveTo(hand_width/2, radius);
        hand.lineTo(a_x, a_y);
        hand.strokeStyle=colors.hand;
        hand.lineWidth=8;
        hand.stroke();
        hand.closePath();
        hand.arc(a_x, a_y, options.fontSize*(1.35/2), 0, 2*Math.PI);
        hand.fillStyle=colors.hand;
        hand.fill();
        __kkc.allow_draw=true;
        __kkc.hour_mode=true;
        __kkc.mouse_down=false;
        draw_hours(options);
        move_hand((h==12?0:h)*(Math.PI/6), options);
        am_btn.on("click", function(){
            am_pm.html("AM");
            am_btn.css("background", colors.meridian_background_on);
            pm_btn.css("background", colors.meridian_background_off);
        });
        pm_btn.on("click", function(){
            am_pm.html("PM");
            pm_btn.css("background", colors.meridian_background_on);
            am_btn.css("background", colors.meridian_background_off);
        });
        canvas_cont.on("mousemove mousedown mouseup touchstart touchend touchcancel click touchmove", function(event){
            if (!__kkc.allow_draw)
                return;
            if ($(event.target).is(am_btn)||
                $(event.target).is(pm_btn))
                return;
            var use_event;
            var el_offset=canvas_cont.offset();
            var event_offset={
                left:event.pageX,
                top:event.pageY
            };
            if (!event_offset.left){
                event_offset.left=event.originalEvent.touches[0].pageX;
                event_offset.top=event.originalEvent.touches[0].pageY;
            }
            var offsetX=event_offset.left-el_offset.left;
            var offsetY=event_offset.top-el_offset.top;
            switch (event.type){
                case "touchmove":use_event="mousemove";event.preventDefault();break;
                case "touchend":use_event="mouseup";break;
                case "touchcancel":use_event="mouseup";break;
                case "touchstart":use_event="mousedown";break;
                default:use_event=event.type;
            }
            if (use_event=="mousedown")
                __kkc.mouse_down=true;
            if (use_event=="mouseup")
                __kkc.mouse_down=false;
            if (use_event=="click" ||
                use_event=="mousedown" ||
                (use_event=="mousemove" && __kkc.mouse_down)){
                var pieces=__kkc.hour_mode?12:60;
                var x=offsetX-radius;
                var y=offsetY-radius;
                x/=radius*-1;
                y/=radius*-1;
                if (x>1 || y>1 || (x==0&&y==0))
                    return;
                var theta=Math.atan2(x,y);
                if (theta>0)
                    theta=(2*Math.PI)-theta;
                theta=Math.abs(theta);
                var number=(Math.PI/(pieces/2))*Math.round(theta/(Math.PI/(pieces/2)))/(Math.PI/(pieces/2));
                var radians=0;
                radians+=number*Math.PI/(__kkc.hour_mode?6:30);
                radians=(radians>2*Math.PI)?radians-(2*Math.PI):radians;
                move_hand(radians, options);
                if (__kkc.hour_mode){
                    container.attr("hour", number);
                    var minute=container.attr("minute")||0;
                    minute=parseInt(minute);
                    var hour=number;
                    minute=Math.round(minute);
                    minute=minute==60?0:minute;
                    hours.html(((hour<10&&hour!=0)?"&nbsp;":"")+(hour==0?12:hour));
                    minutes.html((minute<10?"0":"")+minute);
                }
                else {
                    container.attr("minute", number);
                    var hour=container.attr("hour")||0;
                    hour=parseInt(hour);
                    var minute=number;
                    minute=Math.round(minute);
                    minute=minute==60?0:minute;
                    hours.html(((hour<10&&hour!=0)?"&nbsp;":"")+(hour==0?12:hour));
                    minutes.html((minute<10?"0":"")+minute);
                }
            }
            if (use_event=="mouseup"){
                if (__kkc.hour_mode){
                    __kkc.hour_mode=false;
                    draw_minutes(options);
                    __kkc.allow_draw=false;
                    setTimeout(function(){__kkc.allow_draw=true;}, 100);
                }
            }
        });
        done.on("click", __kkc.finalize);
        container.css({
            width:options.size+20,
            border:"3px solid "+colors.border,
            fontSize:options.fontSize, textAlign:"center",
            color:colors.text, background:colors.background,
            fontFamily:options.fontFamily, position:"absolute"
        });
        var input_offset=$(__kkc.opener).offset();
        var window_size={
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
            top: plugin_position.top, left: plugin_position.left
        }).show();
    }

    $.fn.kitkatclock=function(options){
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
        var html_colors={"aliceblue":"rgba(240,248,255,1)","antiquewhite":"rgba(250,235,215,1)","aqua":"rgba(0,255,255,1)","aquamarine":"rgba(127,255,212,1)","azure":"rgba(240,255,255,1)","beige":"rgba(245,245,220,1)","bisque":"rgba(255,228,196,1)","black":"rgba(0,0,0,1)","blanchedalmond":"rgba(255,235,205,1)","blue":"rgba(0,0,255,1)","blueviolet":"rgba(138,43,226,1)","brown":"rgba(165,42,42,1)","burlywood":"rgba(222,184,135,1)","cadetblue":"rgba(95,158,160,1)","chartreuse":"rgba(127,255,0,1)","chocolate":"rgba(210,105,30,1)","coral":"rgba(255,127,80,1)","cornflowerblue":"rgba(100,149,237,1)","cornsilk":"rgba(255,248,220,1)","crimson":"rgba(220,20,60,1)","cyan":"rgba(0,255,255,1)","darkblue":"rgba(0,0,139,1)","darkcyan":"rgba(0,139,139,1)","darkgoldenrod":"rgba(184,134,11,1)","darkgray":"rgba(169,169,169,1)","darkgreen":"rgba(0,100,0,1)","darkkhaki":"rgba(189,183,107,1)","darkmagenta":"rgba(139,0,139,1)","darkolivegreen":"rgba(85,107,47,1)","darkorange":"rgba(255,140,0,1)","darkorchid":"rgba(153,50,204,1)","darkred":"rgba(139,0,0,1)","darksalmon":"rgba(233,150,122,1)","darkseagreen":"rgba(143,188,143,1)","darkslateblue":"rgba(72,61,139,1)","darkslategray":"rgba(47,79,79,1)","darkturquoise":"rgba(0,206,209,1)","darkviolet":"rgba(148,0,211,1)","deeppink":"rgba(255,20,147,1)","deepskyblue":"rgba(0,191,255,1)","dimgray":"rgba(105,105,105,1)","dodgerblue":"rgba(30,144,255,1)","firebrick":"rgba(178,34,34,1)","floralwhite":"rgba(255,250,240,1)","forestgreen":"rgba(34,139,34,1)","fuchsia":"rgba(255,0,255,1)","gainsboro":"rgba(220,220,220,1)","ghostwhite":"rgba(248,248,255,1)","gold":"rgba(255,215,0,1)","goldenrod":"rgba(218,165,32,1)","gray":"rgba(128,128,128,1)","green":"rgba(0,128,0,1)","greenyellow":"rgba(173,255,47,1)","honeydew":"rgba(240,255,240,1)","hotpink":"rgba(255,105,180,1)","indianred":"rgba(205,92,92,1)","indigo":"rgba(75,0,130,1)","ivory":"rgba(255,255,240,1)","khaki":"rgba(240,230,140,1)","lavender":"rgba(230,230,250,1)","lavenderblush":"rgba(255,240,245,1)","lawngreen":"rgba(124,252,0,1)","lemonchiffon":"rgba(255,250,205,1)","lightblue":"rgba(173,216,230,1)","lightcoral":"rgba(240,128,128,1)","lightcyan":"rgba(224,255,255,1)","lightgoldenrodyellow":"rgba(250,250,210,1)","lightgray":"rgba(211,211,211,1)","lightgreen":"rgba(144,238,144,1)","lightpink":"rgba(255,182,193,1)","lightsalmon":"rgba(255,160,122,1)","lightseagreen":"rgba(32,178,170,1)","lightskyblue":"rgba(135,206,250,1)","lightslategray":"rgba(119,136,153,1)","lightsteelblue":"rgba(176,196,222,1)","lightyellow":"rgba(255,255,224,1)","lime":"rgba(0,255,0,1)","limegreen":"rgba(50,205,50,1)","linen":"rgba(250,240,230,1)","magenta":"rgba(255,0,255,1)","maroon":"rgba(128,0,0,1)","mediumaquamarine":"rgba(102,205,170,1)","mediumblue":"rgba(0,0,205,1)","mediumorchid":"rgba(186,85,211,1)","mediumpurple":"rgba(147,112,219,1)","mediumseagreen":"rgba(60,179,113,1)","mediumslateblue":"rgba(123,104,238,1)","mediumspringgreen":"rgba(0,250,154,1)","mediumturquoise":"rgba(72,209,204,1)","mediumvioletred":"rgba(199,21,133,1)","midnightblue":"rgba(25,25,112,1)","mintcream":"rgba(245,255,250,1)","mistyrose":"rgba(255,228,225,1)","moccasin":"rgba(255,228,181,1)","navajowhite":"rgba(255,222,173,1)","navy":"rgba(0,0,128,1)","oldlace":"rgba(253,245,230,1)","olive":"rgba(128,128,0,1)","olivedrab":"rgba(107,142,35,1)","orange":"rgba(255,165,0,1)","orangered":"rgba(255,69,0,1)","orchid":"rgba(218,112,214,1)","palegoldenrod":"rgba(238,232,170,1)","palegreen":"rgba(152,251,152,1)","paleturquoise":"rgba(175,238,238,1)","palevioletred":"rgba(219,112,147,1)","papayawhip":"rgba(255,239,213,1)","peachpuff":"rgba(255,218,185,1)","peru":"rgba(205,133,63,1)","pink":"rgba(255,192,203,1)","plum":"rgba(221,160,221,1)","powderblue":"rgba(176,224,230,1)","purple":"rgba(128,0,128,1)","red":"rgba(255,0,0,1)","rosybrown":"rgba(188,143,143,1)","royalblue":"rgba(65,105,225,1)","saddlebrown":"rgba(139,69,19,1)","salmon":"rgba(250,128,114,1)","sandybrown":"rgba(244,164,96,1)","seagreen":"rgba(46,139,87,1)","seashell":"rgba(255,245,238,1)","sienna":"rgba(160,82,45,1)","silver":"rgba(192,192,192,1)","skyblue":"rgba(135,206,235,1)","slateblue":"rgba(106,90,205,1)","slategray":"rgba(112,128,144,1)","snow":"rgba(255,250,250,1)","springgreen":"rgba(0,255,127,1)","steelblue":"rgba(70,130,180,1)","tan":"rgba(210,180,140,1)","teal":"rgba(0,128,128,1)","thistle":"rgba(216,191,216,1)","tomato":"rgba(255,99,71,1)","turquoise":"rgba(64,224,208,1)","violet":"rgba(238,130,238,1)","wheat":"rgba(245,222,179,1)","white":"rgba(255,255,255,1)","whitesmoke":"rgba(245,245,245,1)","yellow":"rgba(255,255,0,1)","yellowgreen":"rgba(154,205,50,1)"};
        return this.each(function(){
            options=options||{};
            options.time=options.time||"12:00 AM";
            this.value=options.time;
            var clock_dim=options.size||350;
            if (typeof clock_dim !== "number"){
                if (clock_dim.indexOf("pt"))
                    clock_dim=parseFloat(clock_dim)*(4/3);
                else
                    clock_dim=parseFloat(clock_dim);
            }
            clock_dim-=20;
            options.size=clock_dim;
            var fontSize=options.fontSize||40;
            if (typeof fontSize !== "number"){
                if (fontSize.indexOf("pt"))
                    fontSize=parseFloat(fontSize)*(4/3);
                else
                    fontSize=parseFloat(fontSize);
            }
            options.fontSize=fontSize;
            options.fontFamily=options.fontFamily||"Verdana, sans-serif";
            var colors=options.colors||{};
            colors.text=colors.text||"#FFFFFF";
            colors.clock=colors.clock||"#050505";
            colors.numerals=colors.numerals||colors.text;
            colors.hand=colors.hand||'#960000';
            colors.background=colors.background||"#222222";
            colors.meridian_background_on=colors.meridian_background_on||colors.hand;
            colors.meridian_background_off=colors.meridian_background_off||null;
            colors.meridian_text=colors.meridian_text||colors.text;
            colors.top_indicator_selected=colors.top_indicator_selected||colors.hand;
            colors.top_indicator_deselected=colors.top_indicator_deselected||colors.text;
            colors.top_indicator_background=colors.top_indicator_background||colors.clock;
            colors.border=colors.border||"#CCCCCC";
            for (var key in colors){
                colors[key]=normalize_color(colors[key]);
            }
            if (!colors.meridian_background_off){
                colors.meridian_background_off=calculate_from_alpha(colors.meridian_background_on, colors.background, .6);
            }
            options.colors=colors;
            __kkc.push(options);
            $(this).attr("kkc-id", __kkc.length-1).on("mouseup", function(){
                if (!$(this).is(":focus"))
                    return;
                this.blur();
                __kkc.finalize_wrap();
                __kkc.opener=this;
                __kkc.setup(__kkc[parseInt($(this).attr("kkc-id"))]);
            });
        })
    };
    $.fn.kitkatclock.noDegrade=function(b){
        if (b!==true){
            __kkc.degrade=false;
            return;
        }
        else if (__kkc.degrade) {
            $("input[data-role='time']").kitkatclock();
        }
    };

    $(function(){
        var container=$("<div id='kitkatclock'>").hide();
        var time_cont=$("<div class='kkc-time-cont'>");
        var hours=$("<span class='kkc-hour'>");
        var minutes=$("<span class='kkc-minute'>");
        var am_pm=$("<span class='kkc-am-pm'>");
        time_cont.append(hours).append(":").append(minutes).append(am_pm);
        var canvas_cont=$("<div class='kkc-canvas-cont'>");
        var clock=$("<canvas class='kkc-canvas-clock'>");
        var hand=$("<canvas class='kkc-canvas-hand'>");
        var numbers=$("<canvas class='kkc-canvas-numbers'>");
        var am_btn=$("<div class='kkc-am-btn'>AM</div>");
        var pm_btn=$("<div class='kkc-pm-btn'>PM</div>");
        canvas_cont.append(clock).append(hand).append(numbers).append(am_btn).append(pm_btn);
        var done=$("<div class='kkc-done-btn'>Done</div>");
        container.append(time_cont).append(canvas_cont).append(done);
        $("body").append(container).on("click", function(event){
            var attr=$(event.target).attr("kkc-id");
            if ($("#kitkatclock").has(event.target).length==0 &&
                (typeof attr === 'undefined' || attr === false))
                __kkc.finalize_wrap();
        });
        $().kitkatclock.noDegrade(true);
    })
}(jQuery));