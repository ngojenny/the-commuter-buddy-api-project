//MUST HAVES:
//allow user to enter in their start address and end address
//use google API (or map api?) to calculate the users commute time
// allow users to input their preference for their playlist
// generate a list of songs and create a playlist that the user can list to in its entirety during the duration of their trip
// BONUS: instead of just providing a list of items, allow user to save the playlist on spotify or allow people to individually purchase songs?

// GOOGLE MAP API
//retrieved user commute duration; display it on the page
//store the duration in a variable
//values returned by google api will be in seconds, will need to convert seconds into milliseconds to match spotify track lengths

// spotify
// field filters
// Get local time of user
var today = new Date();
var todayHour = today.getHours();
var localTimeRead = today.toTimeString();

function greetUser() {
	//if local time is between 5am to 11:59 am print "Good Morning! Hope you have a lovely early commute"
	if(todayHour >= 5 && todayHour < 12) {
		var printGreet = $('<h3>').text('Good Morning! Hope you have a lovely early commute.');
	}
	//else if local time is between 12pm to  4:59pm print "Good afternoon! Hope you have a great commute"
	else if(todayHour >= 12 && todayHour < 17) {
		var printGreet = $('<h3>').text('Good afternoon! Hope you have a great commute.');

	}
	//if local time is between 5pm to 4:59am print "Good Evening! Hope you have a safe commute!" 
	else {
		var printGreet = $('<h3>').text('Good Evening! Hope you have a safe commute.');
	}

	$('.greeting').append(printGreet);
}

var commuteTime = {

};

commuteTime.apiURL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

commuteTime.init = function() {
	//my code to initialize app
	$('form.calculateCommuterTime').on('submit', function(e) {
		e.preventDefault();
		// console.log('does this work?');
		//retrieve user's input, pass their starting location and end location as parameters in .getData
		var userStartLoc = $('input[name=origin_addresses]').val();
		var userEndLoc = $('input[name=destination_addresses]').val();
		var userMode = $('input[type=radio]:checked').val();
		commuteTime.getData(userStartLoc, userEndLoc, userMode);
	});
}

//AIzaSyCYftS0F8KQC27SruOQeshBFUab_UwnNXY

//this function will help us get information
commuteTime.getData = function(start, end, style) {
	$.ajax({
		url: 'http://proxy.hackeryou.com',
		data: {
			reqUrl: commuteTime.apiURL,
			params: {
				units: 'imperial',
				origins: start,
				destinations: end,
				key:'AIzaSyBOycu2FIPU5XuhpYz2eCIlEgCMnrSropk',
				mode: style,
			}
		},
		method: 'GET',
		dataType: 'json'
	})
	.then(function(distanceTimeData) {
		console.log(distanceTimeData.rows[0].elements[0].duration.value);
		var durationTime = distanceTimeData.rows[0].elements[0].duration.value; 
		commuteTime.displayTime(durationTime);
		commuteTime.calculateTimeMilli(durationTime);
	});
};

//this function will display and store commuter's duration (retrieved from google MAPS API)
//passing commuteTime.displayTime "time" will allow it to accept a parameter which in this case is refering to duration which is an array that includes one object, and in that object they have a key/value which is duration:object and in that object has the key/value pair of duration: object, they have another key/value pair of value: #, which is what we need to select

//convert value received from google API from seconds to minutes and display that
commuteTime.displayTime = function(time) {
	var commuterTimeMin = Math.round(time / 60);
	var printTime = $('<p>').addClass('commuterTimeMin').text('Your commute will take ' + commuterTimeMin + 'mins');
	var commuteTimeResultsDiv = $('<div>').addClass('commuteTimeResults').append(printTime)
	$('.userInput .calculateCommuterTime').append(commuteTimeResultsDiv);

	//smooth scroll plugin
	$.smoothScroll( {
		scrollTarget: '.commuteTimeResults',
		speed: 400
	});

	//make .createPlaylist appear
	$('.createPlaylist').addClass('show');
}

//convert value received from google API from seconds to milliseconds (for later use)
commuteTime.calculateTimeMilli = function(time) {
	commuteTime.commuterTimeMilli = Math.round(time * 1000);
}

var searchItem = {};

searchItem.init = function() {
	$('form.createPlaylist').on('submit', function(e) {
		e.preventDefault();
		// console.log('does this work?');
		//retrieve user's genre preference and stick it in array called genreChoice
		var genreChoice = [];

		$('input[name=genre]').each(function(){
			if(this.checked) {
				genreChoice.push(this.value);
			}
		});
		console.log(genreChoice);
		// searchItem.getData(genreChoice);
		if(genreChoice.length === 1) {
			searchItem.getSingleArtist(genreChoice[0]);
			console.log(genreChoice[0]);
		}
		else {
			searchItem.getArtistsInfo(genreChoice);
		}
	});
}


//this function will pull artists from spotify that are associated with the single genre user chose (THIS FUNCTION WILL RUN OR getArtistsInfo() will run depending on user's input)
searchItem.getSingleArtist = function(genre) {
	var artists = $.ajax({
		url: 'https://api.spotify.com/v1/search',
		dataType: 'json',
		method: 'GET',
		data: {
			q: 'genre:' + genre,
			type: 'artist'
		}
	}).then(function(res) {
		console.log(res.artists.items);
		var singleGenreRes = res.artists.items;
		searchItem.getArtistsIDOneGenre(singleGenreRes);
	});
}
searchItem.getArtistsIDOneGenre = function(artist) {
	var idArray = artist.map(function(item){
		return item.id
	});
	console.log(idArray)
	searchItem.getArtistsTrack(idArray);
};

/******************
---------OR-------
******************/

//this function will pull artists from spotify that are associated with the multiple genres user chose (THIS FUNCTION WILL RUN OR getSingleArtist() will run depending on user's input)
searchItem.getArtistsInfo = function(genreChoice) { 
	var getArtists = genreChoice.map(function(genre){
		return $.ajax({
			url: 'https://api.spotify.com/v1/search',
			dataType: 'json',
			method: 'GET',
			data: {
				q: 'genre:' + genre,
				type: 'artist'
			}
		});
		console.log(getArtists);
	}); 

	$.when.apply(null, getArtists)
		.then(function() {
			var artists = Array.prototype.slice.call(arguments);
			searchItem.getArtistsID(artists);
			console.log(artists);

	});

	//now I have an array with three arrays in them and in each array I have 3 objects, in each object there is a property called artists which is an object that has the property of items which consists of an array of 20 other objects, 

	//create an array with just the name of the artists in the 20 objects

}

//I will...go into genre choice, go to the first object item which will have a property of artists which will each be store in an object, and in that object extract the ID:value, push the ids into an empty array, do that for each array in the main array (genreChoice)

searchItem.getArtistsID = function(artist) {
	var idArray = artist.map(function(item){
		return item[0];
	});
	console.log(artist);
	idArray = idArray.map(function(item){
		return item.artists.items
	});
		idArray = flatten(idArray);
	idArray = idArray.map(function(item){
		return item.id
	})
	// console.log(idArray);
	searchItem.getArtistsTrack(idArray);
};

// take that array of artist ids, map through it and make an ajax call for each to find the top ten tracks for each artist pulled
searchItem.getArtistsTrack = function(idArray) {
	var artistTop = idArray.map(function(id){
		return $.ajax({
			url: 'https://api.spotify.com/v1/artists/'+ id + '/top-tracks',
			dataType: 'json',
			method: 'GET',
			data: {
				country: 'CA',
				type: 'track'
			}
		});
	});
	$.when.apply(null, artistTop)
		.then(function() {
			var topTracks = Array.prototype.slice.call(arguments);
			searchItem.joinTopTracks(topTracks);
			// console.log(topTracks);
		},function(err) {
			console.log('error',err);
	});
};


//take new array of arrays of 3 objects, grab the first object, grab track array which consists of 10 objects/tracks, in each object i need to grab song's id?

//create a large array of track ids

searchItem.joinTopTracks = function(topTracks) {
	//take array and map through it: get mentor to explain [0]
	var topTracksArray = topTracks.map(function(trackArrayItem){
		return trackArrayItem[0];
	});

	topTracksArray = topTracksArray.map(function(trackArrayItem){
		return trackArrayItem.tracks
		// console.log(topTracksArray);
	});

	//now topTracksArray is a array of arrays of artists, each artists/array has 10 toptracks/10 objects

	topTracksArray = flatten(topTracksArray); 
	console.log(topTracksArray);

	//now topTracksArray is a giant array of 600 object, each object holds property of a song
	// topTracksArray = topTracksArray.map(function(trackArrayItem){
	// 	return trackArrayItem.id
	// });


	//now I need to randomize the list of song objects

	// var randomizeTrackIndex = Math.floor(Math.random() * topTracksArray.length);
	// console.log(topTracksArray);
	searchItem.randomizeArray(topTracksArray);

}

//I need a new array of object songs that are in a randomized order

searchItem.randomizeArray = function(topTracksArray) {
	var shuffledArray = _.shuffle(topTracksArray);
	console.log(shuffledArray);
	// searchItem.createLeftOverCommute(shuffledArray)
	searchItem.playlistTimeFrame(shuffledArray);
}

//now i need to create a new array that will hold the song objects that will eventually become my playlist

// now i need to map through shuffledArray and pass song objects into filteredShuffledArray if the object has a duration that is shorter than the LEFTOVER commuteTime

//now i need to determine the leftover commuteTime
// i need to take the current commuteTime, convert it to milliseconds. make a variable that stores the leftOver commute time starts like 0 - duration_ms


//this function will push the randomized Song Objects into a playlist array, 
searchItem.playlistTimeFrame = function(shuffledArray) {
	var leftOverCommute = commuteTime.commuterTimeMilli;
	var commutePlaylist = [];
	console.log(leftOverCommute);

	shuffledArray.forEach(function(shuffledArrayItem){
		if(leftOverCommute >= 1) {
			commutePlaylist.push(shuffledArrayItem)
			leftOverCommute -= shuffledArrayItem.duration_ms;
		}
	});
	searchItem.pullTrackIDs(commutePlaylist);
	console.log(commutePlaylist);
} 


//then ill end up with an array of selected song objects, and from each object i want to pull the track ID (to push into widget), track name(needs to be displayed), track artist(s).
searchItem.pullTrackIDs = function(customizedPlaylistArray) {
	var arrayOfTrackID = customizedPlaylistArray.map(function(trackObject){
		return trackObject.id;
	});
	console.log(arrayOfTrackID);
	searchItem.displayWidget(arrayOfTrackID);
}

searchItem.displayWidget = function(arrayOfTrackID) {
	var widgetCode = '<iframe src="https://embed.spotify.com/?uri=spotify:trackset:Commuter Playlist:' + arrayOfTrackID + 'width="300" height="400" frameborder="0" allowtransparency="true"></iframe>'
	var iphoneOutline = $('<img>').attr('src', 'images/iphone2.svg');
	$('.spotifyWidget').append(iphoneOutline, widgetCode);
	//smoothScroll plugin
	$.smoothScroll( {
		scrollTarget: '.customizedPlaylist',
		speed: 400
	});

	//goodbye message to user
	var printEndGreet = $('<h3>').text('Thanks for using The Commuter Buddy');

	var refreshButton = $('<button>').addClass('btn').text('One more time!');

	$('.customizedPlaylist .wrapper').append(printEndGreet, refreshButton);
	$('.customizedPlaylist button').on('click', function(){
			location.reload();
	});
}


//flatten the arrays in the array so that it makes one big array
function flatten(arrayToFlatten) {
	return arrayToFlatten.reduce(function(a,b){
		return a.concat(b);
	}, []);
}

//Make an array of artist names;

//this function will help us display the playlist on the DOM


$(document).ready(function(){
	greetUser()
	commuteTime.init();
	searchItem.init();

	//smoothscroll
	$('a.btn').smoothScroll({
		speed: 400
	});
});