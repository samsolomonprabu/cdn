var songs = [];
var albums = [];
var artists = [];
var videoSongs = songs.filter(function(song) {
    return song.youtube && song.youtube !== "";
});
var karaokeSongs = songs.filter(function(song) {
    return song.karoke && song.karoke !== "";
});
loadData();
