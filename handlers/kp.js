jQuery(function(){
	jQuery.ajax({
		method: 'POST',
		url: 'get_song.php',
		data: { song: HTTP_GET['song'], id: HTTP_GET['id'], i: HTTP_GET['i'] },
		dataType: 'json',
		context: document.body,
		success: function(data) {
			var parent = document.getElementById(HTTP_GET['i']);
			TextToCanvas.init(parent, data.content);
			//var meta = 
			//jQuery('#metaDesc').attr('content', )
			//document.title = data.title + ' | ' + document.title;
		}
	});
});

window['__onGCastApiAvailable'] = function(isAvailable) {
	if (isAvailable) {
		initializeCastApi();
	}
};

initializeCastApi = function() {
	var context = cast.framework.CastContext.getInstance();
	context.setOptions({
		receiverApplicationId: '4375FEAA',
		autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
	});
	var castMiniPlayer = jQuery('#castMiniPlayer');
	context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, function(event) {
		switch (event.sessionState) {
			case cast.framework.SessionState.SESSION_STARTED:
				castSong();
				castMiniPlayer.show();
				break;
			case cast.framework.SessionState.SESSION_RESUMED:
				castMiniPlayer.show();
				break;
			case cast.framework.SessionState.SESSION_ENDED:
				castMiniPlayer.hide();
				break;
		}
	});

};

function castSong() {
	var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
	if(castSession){
		castSession.sendMessage('urn:x-cast:sam.songbook.tamil', {
			songId: HTTP_GET['i']
		});
	}
}

function prevStanza() {
	var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
	if(castSession){
		castSession.sendMessage('urn:x-cast:sam.songbook.tamil.prev', {
			songId: HTTP_GET['i']
		});
	}
}

function nextStanza() {
	var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
	if(castSession){
		castSession.sendMessage('urn:x-cast:sam.songbook.tamil.next', {
			songId: HTTP_GET['i']
		});
	}
}
