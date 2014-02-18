// when page loads call spacebrew setup function 
$(window).on("load", setupSpacebrew);

// wher the jquery mobile is ready to initialize the UI call the setUI function 
$(document).bind("pageinit", setupUI);

// Spacebrew Object
var sb
	, app_name = "hue light picker"
	, values = {} 
	, hueAddress = window.getQueryString('hue') || "http://192.168.0.100";

/**
 * setupSpacebrew Function that creates and configures the connection to the Spacebrew server.
 * 				  It is called when the page loads.
 */
function setupSpacebrew (){
	var random_id = "0000";

	app_name = app_name + ' ' + random_id.substring(random_id.length-4);

	console.log("Setting up spacebrew connection");
	sb = new Spacebrew.Client();

	sb.name(app_name);
	sb.description("Sliders for sending and displaying SpaceBrew range messages.");

	// configure the publication and subscription feeds
	sb.addSubscribe("bri", "range");
	sb.addSubscribe("sat", "range");
	sb.addSubscribe("hue", "range");

	// override Spacebrew events - this is how you catch events coming from Spacebrew
	sb.onRangeMessage = onRangeMessage;
	sb.onOpen = onOpen;

	// connect to spacbrew
	sb.connect();
};

/**
 * Function that is called when Spacebrew connection is established
 */
function onOpen() {
	var message = "Connected as <strong>" + sb.name() + "</strong>. ";
	if (sb.name() === app_name) {
		message += "<br>You can customize this app's name in the query string by adding <strong>name=your_app_name</strong>."
	}
	$("#name").html( message );
}


/**
 * setupUI Function that create the event listeners for the sliders. It creates an callback
 * 		   function that sends a spacebrew message whenever an slide event is received.
 */
function setupUI() {
	console.log("Setting up the UI listeners");
	// when the slider state changes it sends a message to spacebrew
	$(".slider").bind( "change", function(event, ui) {
		if (values[event.target.id] != event.target.value) {
			sb.send(event.target.id, "range", event.target.value);
			values[event.target.id] = event.target.value;
		}
	});
}

hueSliderHack.onSaturationChange(onSaturationChange);

function onSaturationChange(sat) {
	onRangeMessage("sat", sat*2.55);
}
hueSliderHack.onHueChange(function(hue) {
	onRangeMessage("hue", hue/360.0*65535);
});

hueSliderHack.onBrightnessChange(function(bri) {
	onRangeMessage("bri", bri*255);
});

/**
 * onRangeMessage Function that is called whenever new spacebrew range messages are received.
 * 				  It accepts two parameters:
 * @param  {String} name  	Holds name of the subscription feed channel
 * @param  {Integer} value 	Holds value received from the subscription feed
 */
function onRangeMessage(name, value) {
	var message = {};
	message[name] = parseInt(value);
	// This is just an example
	httpRequest(hueAddress + "/api/webuser123/lights/2/state","PUT", JSON.stringify(message));
};

function httpRequest(theUrl, method, content)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( method, theUrl, false );
    xmlHttp.send( content );
    return xmlHttp.responseText;
}