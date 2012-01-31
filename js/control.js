control = {

    startOfWeek: null,
    endOfWeek: null,
    page: 1,
    pages: null,
	
	init: function() {
		
		$('#currentaction h1').html('Fetching recent article');


        //  I know getting the date for today is easy, but I want to know what
        //  the Guardian thinks the date is, and I'll do this by getting the most recent
        //  article and then we can work it out from that
        $.getJSON("http://content.guardianapis.com/search?page-size=1&format=json&callback=?",
            //  TODO: add error checking to this response
            function(json) {
                //  extract the year, month, day part of the webPublicationDate
                var d = json.response.results[0].webPublicationDate.split('T')[0].split('-');
                //  convert it into a proper date object
                d = new Date(parseInt(d[0],10), parseInt(d[1],10)-1, parseInt(d[2],10));
                //  work back to the first day of the week (and just for utility the end of the week)
                control.startOfWeek = new Date(d.getTime() - (1000*60*60*24*d.getDay()) - (1000*60*60*24*7));
                control.endOfWeek = new Date(control.startOfWeek.getTime() + (1000*60*60*24*7));

                //  Stupidly long way to display the week we are currently looking at
                $('#topfeedback').html('Video published in the week ' + control.startOfWeek.toString().split('00:00:00')[0] + ' - ' + new Date(control.endOfWeek.getTime() - 1000).toString().split('23:59:59')[0]);

                //  Now add the dates onto the top of each row
                control.displayDates();

                //  Now grab the video that has been published during that time.
                control.fetchVideoFeed();

            }
        );

	},

    //  this is going to start at the first day and loop over until
    //  we've put all the dates at the top of each day column
    displayDates: function() {
        
        var d = null;
        for (var i = 0; i < 7; i++) {
            d = new Date(this.startOfWeek.getTime() + (1000*60*60*24*i));
            d = d.toString().split(' ');
            $($('#week .dayholder')[i]).children('h6').html(d[2] + ' ' + d[1]);
        }

    },

    fetchVideoFeed: function() {

        if (this.pages === null) {
            $('#currentaction h1').html('Counting Video');
        } else {
            $('#currentaction h1').html('Counting Video ' + this.page + '/' + this.pages);
        }

        var fromdate = (control.startOfWeek.getYear() + 1900) + '-' + (control.startOfWeek.getMonth()+1) + '-' + control.startOfWeek.getDate();
        var todate = (control.endOfWeek.getYear() + 1900) + '-' + (control.endOfWeek.getMonth()+1) + '-' + control.endOfWeek.getDate();
        $.getJSON('http://content.guardianapis.com/search?page=' + control.page + '&tag=type/video&from-date=' + fromdate + '&to-date=' + todate + '&show-tags=series&order-by=oldest&format=json&show-fields=shortUrl,thumbnail&callback=?',
            //  TODO: add error checking to this response
            function(json) {
                for (var i in json.response.results) {
                    control.plotVideo(json.response.results[i]);
                }

                //  now we need to see if we should get another page
                control.pages = json.response.pages;
                if (control.page < control.pages) {
                    control.page++;
                    control.fetchVideoFeed();
                } else {
                    if (json.response.total == 1) {
                        $('#currentaction h1').html('Done, 1 video');
                    } else {
                        control.finishPlotting();
                    }
                }

            }
        );


    },

    plotVideo: function(json) {
        
        //  Ok, now we want to get the publish date of each video, same as before...
        var d = json.webPublicationDate.split('T')[0].split('-');
        var dow = new Date(parseInt(d[0],10), parseInt(d[1],10)-1, parseInt(d[2],10));

        //  and the time, at some point timezones will get thrown into the mix
        //  we're just going to ignore that for the moment because timezones suck
        //  and they can mess around with the time (and we're not *that* fussed about
        //  being spot-on)
        d = json.webPublicationDate.split('T')[1].split('Z')[0].split(':');
        var tod = parseInt(d[0]*60,10) + parseInt(d[1],10);

        var todpos = 0;
        if (tod > 1200){
            todpos+=((tod-1200)/4)+(12*60)+(8*15);
        } else if (tod > 480) {
            todpos+=(tod-480)+(8*15);
        } else {
            todpos=parseInt(tod/4,10);
        }
        todpos+=15;

        //  Now we know the day and the time of day, we can add the thumbnail onto the page
        var th = $('<div>').addClass('thumbholder').addClass('section_' + json.sectionId).css('top', todpos-12);
        var dtime = $('<div>').addClass('time').addClass('tinyfont').html(d[0] + ':' + d[1]);
        var dsection = $('<div>').addClass('sectionname').addClass('tinyfont').html(json.sectionName);
        var i = $('<img>').addClass('thumbnail').attr('src', json.fields.thumbnail).attr('title', d[0] + ':' + d[1]);

        if (json.tags.length > 0) {
            var dseries = $('<div>').addClass('series').addClass('tinyfont').html('series');
            th.append(dseries);
        }

        th.append(dtime);
        th.append(i);
        th.append(dsection);

        $($('#week .dayholder')[dow.getDay()]).children('.fullday').append(th);
        i.attr('style', '');


    },

    finishPlotting: function() {
        $('#currentaction h1').html('Done');
        $('#currentaction').slideUp('slow');

        setTimeout(function() {
            $('.thumbnail').each(function(i, el) {
                if ($(el).css('display') == 'none') {
                    $(el).parent().remove();
                }
            });
        }, 1000);
    }

};

utils = {
	
	log: function(msg) {
		try {
			console.log(msg);
		} catch(er) {
			
		}
	}
};