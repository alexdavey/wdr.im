var track = new (function(){
    
    // Change the time range
    var tOpen = false;
    var time = 3;
    window.addEvent('mousedown', function(e){       
        if (e.target !== $('time-range') && !e.target.getParent('#time-range')){
            tOpen = false;
            $('time-range').removeClass('open');
        }
    });
    $('time-range').addEvent('click', function(e){
        if (e.target != this){
            time = e.target.value;
            e.target.getSiblings('.selected')[0].removeClass('selected');
            e.target.addClass('selected');
            var ul = this.getChildren('ul')[0];
            this.set('text', e.target.innerText);
            ul.inject(this, 'bottom');
        }
        tOpen = !tOpen;
        if (tOpen)
            this.addClass('open');
        else
            this.removeClass('open');
    });
    
    // Callback function for the Google Maps API
    this.mapsLoaded = function(){
	var myLatlng = new google.maps.LatLng(20, 0);
	var myOptions = {
	    zoom: 2,
	    center: myLatlng,
	    mapTypeId: google.maps.MapTypeId.HYBRID,
		disableDefaultUI : true,
	}
	this.map.map = new google.maps.Map($("map"), myOptions);
    }
    
    this.map = {};
    
    // Add a marker to the map
    this.map.addMarker = function(lat, lng){
	var latlng = new google.maps.LatLng(lat, lng);
	var marker = new google.maps.Marker({
	    position: latlng,
	    map: this.map,
	    zIndex: Math.round(latlng.lat()*-100000)<<5
        });
    }
    
    // Initiate the charts
    $('charts').getChildren().each(function(chart){
        chart.store('r', Raphael(chart.getElement('div'), 392, 212));
    });
    
    // Set chart data
    this.setChart = function(name, data){
	var r = $(name + '-chart').retrieve('r');
        r.clear();
	var pie = r.g.piechart(85, 85, 70, Object.values(data), {legend:Object.values(Object.map(data, function(val, key){return '%% - ' + key}))});
        pie.hover(function () {
            this.sector.stop();
            this.sector.scale(1.1, 1.1, this.cx, this.cy);
            if (this.label) {
                this.label[0].stop();
                this.label[0].scale(1.5);
                this.label[1].attr({"font-weight": 800});
            }
        }, function () {
            this.sector.animate({scale: [1, 1, this.cx, this.cy]}, 500, "bounce");
            if (this.label) {
                this.label[0].animate({scale: 1}, 500, "bounce");
                this.label[1].attr({"font-weight": 400});
            }
        });
    }
    
    // Init the 
    window.addEvent('load', function(){
        new MooClip('#copy-url', {
            onCopy: function(e){
                var fx = new Fx.Morph($('copy-bubble'), {
                    duration: 200,
                    transition: Fx.Transitions.linear
                });
                fx.start({
                    'opacity'   : [0, 1],
                    'left'      : [-15, 0]
                });
                setTimeout(function(){
                    fx.start({
                        'opacity'   : [1, 0]
                    });
                }, 2000);
            }
        });
    });
    
    var hits = {
        location    : {},
        referrer    : {},
        browser     : {},
        os          : {}
    };
    var socket = io.connect(location.domain);
    socket.on('connect', function(){
        socket.emit('id', window.pageID);
        
        socket.on('update', function(data){
			console.dir(data);
            data = JSON.decode(data);
            
            // Add a marker on the map
            track.map.addMarker(data.lat, data.lng);
            
            data.country.each(function(val, i){
                // Add a hit to the country
                if (!hits.location[val])
                    hits.location[val] = 0;
                hits.location[val]++;
            });
            track.setChart('location', hits.location);
            
            data.referrer.each(function(val, i){
                // Add a hit to the referrer
                if (!hits.referrer[val])
                    hits.referrer[val] = 0;
                hits.referrer[val]++;
            });
            track.setChart('referrer', hits.referrer);
            
            data.browser.each(function(val, i){
                // Add a hit to the browser
                if (!hits.browser[val])
                    hits.browser[val] = 0;
                hits.browser[val]++;
            });
            track.setChart('browser', hits.browser);
            
            data.os.each(function(val, i){
                // Add a hit to the os
                if (!hits.os[val])
                    hits.os[val] = 0;
                hits.os[val]++;
            });
            track.setChart('os', hits.os);
        });
    });
});

// Debugging & looks awesome :)
track.setChart('location', {
    'United States'     : 100,
    'United Kingdom'    : 20,
    'Netherlands'       : 10,
    'Candy Mountain'    : 10
});

track.setChart('referrer', {
    'yahoo.com'             : 40,
    'webdevrefinery.com'    : 45,
    'nodeknockout.com'      : 15
});

track.setChart('browser', {
    'Chrome'            : 40,
    'FireFox'           : 30,
    'Safari'            : 10,
    'Opera'             : 7,
    'Internet Explorer' : 13
});

track.setChart('os', {
    'Mac OSX'   : 20,
    'Windows'   : 70,
    'Ubuntu'    : 10
});
