//Variables for controlling loop
var videoIsPlaying = false;
var playbackRates;
var timeoutIds = [];

//Initialising player
//https://developers.google.com/youtube/iframe_api_reference
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '270',
    width: '480',
    videoId: '-JKDFD1PZ8Y',
    playerVars: {'controls': 0, 'showinfo': 0, 'modestbranding': 0 },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}



function onPlayerReady(event) {
    playbackRates = player.getAvailablePlaybackRates();
    $("#playback-rate-slider").slider({
        min: 0,
        max: playbackRates.length - 1,
        value: [playbackRates.indexOf(1)],
        slide: function(event, ui) {
          $('#current-playback-rate').text("Playback Rate: "+ playbackRates[ui.value])
        }
    });
}

//set timeout for loop to restart, if video is still playing
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    if(!videoIsPlaying || timeoutIds.length > 0){
      if(timeoutIds.length > 0){
        player.pauseVideo();

        //if iframe clicks > 1, multiple timeouts are set
        //clear all timeouts then restart loop
        timeoutIds.map(timeoutID => clearTimeout(timeoutID));
        timeoutIds=[];
        startVideo();
      }
      else{
        startVideo();
      }
    }
    else{
      let start = $( "#youtube-range-slider" ).slider( "values", 0 );
      let end = $( "#youtube-range-slider" ).slider( "values", 1 );
      let playbackRate = playbackRates[$( "#playback-rate-slider" ).slider( "value" )];
      let duration = ((end - start) / playbackRate) * 1000;

      player.setPlaybackRate(playbackRate);
      timeoutIds.push(window.setTimeout(restartVideoSection, duration));
    }
  }

}

function startVideo() {
  videoIsPlaying = false;
  player.pauseVideo();

  clearTimeout(timeoutIds[0]);
  timeoutIds.shift();

  let start = $( "#youtube-range-slider" ).slider( "values", 0 );
  let playbackRate = playbackRates[$( "#playback-rate-slider" ).slider( "value" )];
  player.setPlaybackRate(playbackRate);
  player.seekTo(start);
  videoIsPlaying = true;
  player.playVideo();
}

function stopVideo() {
  videoIsPlaying = false;
  player.pauseVideo();
  clearTimeout(timeoutIds[0])
  timeoutIds.shift();
}

function restartVideoSection() {
    timeoutIds.shift();
    let start = $( "#youtube-range-slider" ).slider( "values", 0 );
    player.seekTo(start);
}

$("#youtube-range-slider").slider({
  min: 0,
  max: 180,
  values: [ 65, 69 ],
  slide: function( event, ui ) {
    if(ui.values[0] < ui.values[1]){
     $('#range-times').text(
      "Start: " +Math.floor(ui.values[0]/60)+":"+
       ((ui.values[0]%60)>=10 ? (ui.values[0]%60) : '0'+(ui.values[0]%60))+
       " End: "+Math.floor(ui.values[1]/60)+":"+
       ((ui.values[1]%60)>=10 ? (ui.values[1]%60) : '0'+(ui.values[1]%60))
    )
      return true
    }
    else{
      return false
    }
  }
});

$('#play-button').click(startVideo);
$('#stop-button').click(stopVideo);
$('#reset-loop-button').click(()=>{
  $( "#youtube-range-slider" ).slider({
    values: [ 65, 69 ]
  });
  $('#range-times').text("Start: 1:05 End: 1:09")
});
