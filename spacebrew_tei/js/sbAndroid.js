var WebSocketAndroid;
if (typeof(WebSocketInterface) != undefined || true) {
	WebSocket = function(url) {
		WebSocketInterface.createWebSocket(url);
		WebSocketAndroid = {
			close: WebSocketInterface.Close,
			onopen: function() {},
			onclose: function() {},
			onmessage: function(message) {},
			send: function(text) {
				WebSocketInterface.send(text);
			}

		};

		return WebSocketAndroid;
	};
}
function onOpenWebSocket() {
	WebSocketAndroid.onopen();
}

function onCloseWebSocket() {
	WebSocketAndroid.onclose();
}

function onMessageWebSocket(message) {
	WebSocketAndroid.onmessage(message);
}


function onErrorWebSocket() {
	var error = WebSocketInterface.onError(); 
	
}
