var languages = [
    { id: 'tamil', label: 'தமிழ் (Tamil)' },
    { id: 'english', label: 'English' },
    { id: 'hindi', label: 'हिंदी (Hindi)' },
    { id: 'telugu', label: 'తెలుగు (Telugu)' },
    { id: 'malayalam', label: 'മലയാളം (Malayalam)' },
    { id: 'nepali', label: 'नेपाली (Nepali)' }
    //{ id: 'kannada', label: 'ಕನ್ನಡ (Kannada)' }
];

var batchSize = 100;
var cont, pagination;
var alphabetsCont = jQuery('#alphabets');
var albumsCont = jQuery('#albums');
var artistsCont = jQuery('#artists');
var songbookTitle = jQuery('#songbookTitle');
var downloadApp = jQuery('#downloadApp');
var langSongs = [], map = {};

/*
if (page === 'index.php') {
        data = tamilSongs;
        songbookTitle.text('கிறிஸ்தவ பாடல்கள்');
        document.title = 'கிறிஸ்தவ பாடல்கள் | Tamil Christian Songs';
        downloadApp.attr('href', 'https://play.google.com/store/apps/details?id=sam.songbook.tamil');
    } else if (page === 'english') {
        data = englishSongs;
        songbookTitle.text('English Christian Songs');
        document.title = 'English Christian Songs';
        downloadApp.attr('href', 'https://play.google.com/store/apps/details?id=sam.songbook.english');
    } else if (page === 'malayalam') {
        data = malayalamSongs;
    } else if (page === 'hindi') {
        data = hindiSongs;
        songbookTitle.text('क्रिश्तिया गीत');
        document.title = 'क्रिश्तिया गीत | Hindi Christian Songs';
        downloadApp.attr('href', 'https://play.google.com/store/apps/details?id=sam.songbook.hindi');
    } else 
*/

function loadData() {
    langPicker.hide();
    langSongs = songs;
    var page = window.location.pathname.split('/').pop();
    var currURL = window.location.href;
    if (page === 'index.php') {
        data = songs;
    } else if (page === 'albums.php') {
        genCategories(albums, 'albums.php', 'handleAlbumClick(event);', 'https://aagjxwfhen.cloudimg.io/width/800/none/https://samsolomonprabu.github.io/cdn/albums/');
        data = [];
    } else if (page === 'artists.php') {
        genCategories(artists, 'artists.php', 'handleArtistClick(event);', 'https://aagjxwfhen.cloudimg.io/width/800/none/https://samsolomonprabu.github.io/cdn/artists/');
        data = [];
    } else if (page === 'video-songs.php') {
        genVideos(videoSongs);
        data = videoSongs;
    } else if (page === 'karaoke-songs.php') {
        genVideos(karaokeSongs);
        data = karaokeSongs;
    }

    genMap();

    albums.length == 0 ? jQuery('#albumNav').hide() : jQuery('#albumNav').show();
    artists.length == 0 ? jQuery('#artistNav').hide() : jQuery('#artistNav').show();
    videoSongs.length == 0 ? jQuery('#videoNav').hide() : jQuery('#videoNav').show();
    karaokeSongs.length == 0 ? jQuery('#karaokeNav').hide() : jQuery('#karaokeNav').show();

    constructAlphabets();
    init();
};

function genMap() {
    data.forEach(function(item, index) {
        map[item.id] = item;
    });
};

function genCategories(categories, link, handler, imgBaseURL) {
    genSongsCount();
    var categoryCont = jQuery('#categoryCont');
    var categoryTemplate = jQuery('#categoryTemplate');
    categories.forEach(function(item, index) {
        var category = categoryTemplate.clone(true);
        category.find('.data-category-link').attr('href', link + '?id=' + item.id).attr('onclick', handler).attr('data-index', index);
        category.find('.data-category-img').attr('src', imgBaseURL + item.id + '.jpg');
        category.find('.data-category-title').text(item.title);
        category.find('.data-category-songs').text('(' + item.count + ' Songs)');
        category.show();
        categoryCont.append(category);
    });
};

function genVideos(videos) {
    var hash = window.location.hash;
    var pageNo = 1, batchSize = 60;
    if(hash !== '') {
        pageNo = parseInt(hash.split('#')[1]);
    }
    var start = ((pageNo - 1) * batchSize) + 1;
    var totalLength = Math.ceil(videos.length / batchSize);

    var template = jQuery('#videoTemplate');
    var params = getQueryParams(window.location.search);
    var url = 'index.php?';
    for(var key in params) {
        url += key + '=' + params[key] + '&';
    }

    var videoCont = jQuery('#videoContainer');
    videoCont.html('');
    for(var i = start - 1; (i < (start + batchSize - 1) && i < videos.length); i++) {
        if(i !== start -1 && i % 30 == 0) {
            insertAd(videoCont);
        }
        var video = template.clone(true);
        video.find('img').attr('src', 'https://img.youtube.com/vi/' + videos[i].youtube + '/0.jpg');
        video.find('.data-song-title').text(videos[i].title);
        video.show();
        videoCont.append(video);
    }

    var pagination = jQuery('#paginationContainer');
    pagination.html('');
    for(var i = 1; i <= totalLength; i++) {
        pagination.append(jQuery('<a class="' + (pageNo == i ? 'active' : '') + ' btn btn-rounded btn-sm btn-icon btn-default" href="#' + i + '">' + i + '</a>'));
    }
};

function genSongsCount() {
    artists.forEach(function(artist, index) {
        artist.count = langSongs.filter(function(song) {
            return song.artist == artist.id;
        }).length;
    });
    albums.forEach(function(album, index) {
        album.count = langSongs.filter(function(song) {
            return song.album == album.id;
        }).length;
    });
};

function constructAlphabets() {
    var alphabets = [];
    data.forEach(function(item) {
        var letter = item.title[0];
        if(alphabets.indexOf(letter) === -1) {
            alphabets.push(letter);
        }
    });

    var page = window.location.pathname.split('/').pop() + '?';
    if(page.indexOf('album') !== -1 || page.indexOf('artist') !== -1) {
        page += 'id=' + HTTP_GET['id'] + '&';
    } 

    alphabetsCont.html('');
    alphabets.forEach(function(item, index) {
        var a = jQuery('<a href="' + page + 'lang=' + HTTP_GET['lang'] + '&' + 's=' + item + '" data-index="' + index + '" class="btn btn-rounded btn-sm btn-icon btn-default">' + item + '</a>');
        a.on('click', handleAlphabetClick);
        alphabetsCont.append(a);
    });
};

function handleSongbookClick(event) {
    var el = jQuery(event.currentTarget);
    HTTP_GET = getQueryParams(window.location.search);
    var lang = HTTP_GET['lang'];
    window.history.pushState('songbook_' + lang, lang[0].toUpperCase() + lang.substr(1, lang.length) + ' Christian Songs | APA Mission', el.attr('href'));
    loadData();
    constructAlphabets();
    fetch();
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function handleAlphabetClick(event) {
    jQuery('#alphabets a.active').removeClass('active');
    var el = jQuery(event.currentTarget);
    el.addClass('active');
    var index = el.attr('data-index');
    window.history.pushState('alpha' + index, el.text(), el.attr('href'));
    HTTP_GET = getQueryParams(window.location.search);
    fetch();
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function handleAlbumClick(event) {
    var el = jQuery(event.currentTarget);
    var index = el.attr('data-index');
    window.history.pushState('album' + index, el.text(), el.attr('href'));
    HTTP_GET = getQueryParams(window.location.search);
    filterAlbum();
    constructAlphabets();
    fetch();
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function handleArtistClick(event) {
    var el = jQuery(event.currentTarget);
    var index = el.attr('data-index');
    window.history.pushState('artist' + index, el.text(), el.attr('href'));
    HTTP_GET = getQueryParams(window.location.search);
    filterArtist();
    constructAlphabets();
    fetch();
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function handleSongClick(event) {
    jQuery('#songsContainer > li.active').removeClass('active');
    var el = jQuery(event.currentTarget);
    el.addClass('active');
    var info = data[el.attr('data-index')];
    window.history.pushState('song', el.text(), el.attr('href'));
    fetchSong();
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function handleSongListClick(event) {
    var el = jQuery(event.currentTarget);
    window.history.pushState('song', el.text(), 'songlist.php?id=' + el.find('a').eq(0).attr('data-id'));
    fetch();
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function handleYoutube(event) {
    var el = jQuery(event.currentTarget);
    jQuery('#ytube').show().find('iframe').attr('src', 'https://www.youtube.com/embed/' + el.attr('data-youtube'));
};

function filterAlphabets() {
    var alphabet = HTTP_GET['s'];
    if(alphabet) {
        var filteredData = data.filter(function(item) {
            return item.title.startsWith(alphabet);
        });
        return filteredData;
    }
};

function filterAlbum() {
    var albumId = HTTP_GET['id'];
    data = langSongs.filter(function(item) {
        return item.album == albumId;
    });
    albumInfo = albums.filter(function(item) {
        return item.id == albumId;
    })[0];
};

function filterArtist() {
    var artistId = HTTP_GET['id'];
    data = langSongs.filter(function(item) {
        return item.artist == artistId;
    });
    artistInfo = artists.filter(function(item) {
        return item.id == artistId;
    })[0];
};

function filterSongList() {
    HTTP_GET = getQueryParams(window.location.search);
    var songsObj = songlistData[HTTP_GET['id']].songs;
    var songs = [];
    for(var key in songsObj) {
        songs.push(langSongs[parseInt(key)]);
    }
    return songs;
};

function fetch() {
    var page = window.location.pathname.split('/').pop();

    if (page === 'index.php') {
        filtered = HTTP_GET['s'] ? filterAlphabets() : data;
    } else if (page === 'songlist.php') {
        filtered = filterSongList();
    }

    if(!data || data.length == 0) { return; }

    var hash = window.location.hash;
    var pageNo = 1;
    if(hash !== '') {
        pageNo = parseInt(hash.split('#')[1]);
    }
    var start = ((pageNo - 1) * batchSize) + 1;
    cont.attr('start', start);
    var totalLength = Math.ceil(filtered.length / batchSize);

    var template = jQuery('#categorySongTemplate');
    var params = getQueryParams(window.location.search);
    params.song && fetchSong();
    var url = 'index.php?';
    for(var key in params) {
        if (!(key === 'song' || key === 'title')) {
            url += key + '=' + params[key] + '&';
        }
    }

    cont.html('');
    for(var i = start - 1; (i < (start + batchSize - 1) && i < filtered.length); i++) {
        if(i !== start -1 && i % 30 == 0) {
            insertAd(cont);
        }
        var song = template.clone(true);
        song.attr('id', md5(filtered[i].id))
            .attr('data-index', filtered[i].id)
            .attr('data-i', i)
            .attr('href', url + 'song=' + md5(filtered[i].id) + '&title=' + filtered[i].title)
            .attr('onclick', 'handleSongClick(event);');
        if (filtered[i].karoke && filtered[i].karoke !== "") {
            var icon = jQuery('<i class="fas fa-microphone-alt" style="font-size: 16px; color: #007bff;margin-left:15px;"></i>');
            icon.attr('data-youtube', filtered[i].karoke).on('click', handleYoutube);
            song.find('span.data-opts').prepend(icon);
        }
        if (filtered[i].youtube && filtered[i].youtube !== "") {
            var icon = jQuery('<i class="fab fa-youtube" style="font-size: 16px;color: #f00;"></i>');
            icon.attr('data-youtube', filtered[i].youtube).on('click', handleYoutube);
            song.find('span.data-opts').prepend(icon);
        }
        song.find('span.data-title').text((i + 1) + '. ' + filtered[i].title);
        song.attr('style', '');
        cont.append(song);
    }

    pagination.html('');
    for(var i = 1; i <= totalLength; i++) {
        pagination.append(jQuery('<a class="' + (pageNo == i ? 'active' : '') + ' btn btn-rounded btn-sm btn-icon btn-default" href="#' + i + '">' + i + '</a>'));
    }
    if(totalLength > 1) {
        pageInfoEl.text('All Songs (Page ' + pageNo + '/' + totalLength + ')');
    } else {
        pageInfoEl.text('All Songs');
    }

    appendSonglistDropdown();
    window.scroll({ top: cont.scrollTop, behavior: 'smooth' });
};

function appendSongMenu(el) {
    jQuery('#dynSongMenu').remove();
    var menu = jQuery('<div id="dynSongMenu" class="dropdown-menu" aria-labelledby="songMenu"></div>');
    for(var key in songlistData) {
        var info = songlistData[key];
        var item = jQuery('<a class="dropdown-item" href="#">' + info.name + '</a>')
        menu.append(item);
    }
    jQuery(el).append(menu);
};

function fetchSong() {
    HTTP_GET = getQueryParams(window.location.search);
    jQuery('#lyricTitle').text(HTTP_GET['title']);
    var canvasCont = jQuery('#canvasContainer');
    canvasCont.html('');
    jQuery('#lyricStatus').show().text('Loading song...');
    jQuery.ajax({
        url: 'get-song.php',
        data: {
            id: HTTP_GET['song']
        },
        method: 'POST'
    }).done(function(response) {
        jQuery('#lyricStatus').hide();
        jQuery('#disqus_thread').show();
        jQuery('#lyrics').find('pre').text(response.content);
        TextToCanvas.init(canvasCont[0], response.content);
        jQuery('#slideOpts').slideDown();
        song = response.content;
        jQuery('#slides').html('');
        jQuery('#slideshow').html('');
        initSlide(response, HTTP_GET['song']);
    });
};

var adIndex = 0;
function insertAd(cont) {
    cont.append(getAdSnippet(adIndex));
    adIndex;
};

function init() {
    cont = jQuery('#songsContainer');
    pagination = jQuery('#paginationContainer');
    pageInfoEl = jQuery('#pageInfoEl');

    var currURL = window.location.href;
    var page = window.location.pathname.split('/').pop();
    if(page === 'index.php' || page === 'albums.php' || page === 'artists.php') {
        fetch();
        window.onhashchange = fetch;
    } else if(page === 'video-songs.php' || page === 'karaoke-songs.php') {
        window.onhashchange = genVideos;
    }

    albumsCont.html('');
    albums.forEach(function(item, index) {
        var li = jQuery('<li>');
        var a = jQuery('<a href="albums.php?id=' + item.id + '" data-index="' + index + '">' + item.title + '</a>');
        a.on('click', handleAlbumClick);
        li.append(a);
        albumsCont.append(li);
    });

    artistsCont.html('');
    artists.forEach(function(item, index) {
        var li = jQuery('<li>');
        var a = jQuery('<a href="artists.php?id=' + item.id + '" data-index="' + index + '">' + item.title + '</a>');
        a.on('click', handleArtistClick);
        li.append(a);
        artistsCont.append(li);
    });
};

function toggleSlideMenu() {
    jQuery('#slides').toggleClass('open');
    var template = jQuery('#slideOpts .data-slide-template');
};

function toggleSlideShow(el) {
    var slideshow = jQuery('#slideshow');
    slideshow.attr('data-slide', '0').fadeToggle().find('.slide').removeClass('active');
    slideshow.find('.slide').eq(0).addClass('active');
    var i = jQuery(el).find('i');
    if(i.hasClass('icon-control-play')) {
        i.removeClass('icon-control-play').addClass('fa fa-stop');
    } else {
        i.removeClass('fa fa-stop').addClass('icon-control-play');
    }
};

function nextSlide() {
    var slideshow = jQuery('#slideshow');
    var index = parseInt(slideshow.attr('data-slide'));
    var count = slideshow.find('.slide').length;
    index++;
    if(index < count) {
        slideshow.find('.active').removeClass('active');
        slideshow.attr('data-slide', index);
        slideshow.find('.slide').eq(index).addClass('active');
        slideshow.find('.slide-info').text('Slide ' + (index + 1) + ' / ' + slideshow.find('.slide').length);
    }
};

function previousSlide() {
    var slideshow = jQuery('#slideshow');
    var index = parseInt(slideshow.attr('data-slide'));
    var count = slideshow.find('.slide').length;
    index--;
    if(index > -1) {
        slideshow.find('.active').removeClass('active');
        slideshow.attr('data-slide', index);
        slideshow.find('.slide').eq(index).addClass('active');
        slideshow.find('.slide-info').text('Slide ' + (index + 1) + ' / ' + slideshow.find('.slide').length);
    }
};

function changeSlide(index) {
    var slideshow = jQuery('#slideshow');
    slideshow.find('.active').removeClass('active');
    slideshow.find('.slide').eq(index).addClass('active');
    slideshow.attr('data-slide', index).fadeIn();
    jQuery('#slides').removeClass('open');

    var i = jQuery('#slideInitBtn');
    if(i.hasClass('icon-control-play')) {
        i.removeClass('icon-control-play').addClass('fa fa-stop');
    }
    slideshow.find('.slide-info').text('Slide ' + (parseInt(index) + 1) + ' / ' + slideshow.find('.slide').length);
};

function hideSlideShow() {
    var slideshow = jQuery('#slideshow').fadeOut();
    var i = jQuery('#slideInitBtn');
    if(i.hasClass('fa-stop')) {
        i.removeClass('fa fa-stop').addClass('icon-control-play');
    }

    var element = slideshow[0];
    if (event instanceof HTMLElement) {
        element = event;
    }
    var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
    document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () { return false; };
    if(isFullscreen) {
        jQuery(slideshow).find('.icon-size-actual').removeClass('icon-size-actual').addClass('icon-size-fullscreen');
        document.cancelFullScreen();
    }
};

function handleSlideshow(event) {
    var slideshow = jQuery('#slideshow');
    if (slideshow.is(':visible')) {
        if (event.keyCode === 37 || event.keyCode === 38) {
            previousSlide();
        } else if (event.keyCode === 39 || event.keyCode === 40) {
            nextSlide();
        } else if (event.keyCode === 27) {
            hideSlideShow();
        } else if (event.key.toLowerCase() === 'f') {
            toggleFullscreen();
        } else if (event.keyCode === 32) {
            toggleSlideShow();
        }
    }
};

function toggleFullscreen(event) {
    var element = document.getElementById('slideshow');
    if (event instanceof HTMLElement) {
        element = event;
    }
    var isFullscreen = document.webkitIsFullScreen || document.mozFullScreen || false;
    element.requestFullScreen = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || function () { return false; };
    document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || function () { return false; };
    if(isFullscreen) {
        jQuery(slideshow).find('.icon-size-actual').removeClass('icon-size-actual').addClass('icon-size-fullscreen');
        document.cancelFullScreen();
    } else {
        jQuery(slideshow).find('.icon-size-fullscreen').removeClass('icon-size-fullscreen').addClass('icon-size-actual');
        element.requestFullScreen();
    }
    
};

function initSlide(song, id) {
    jQuery('.data-song-title').text('Slide show: ' + song.title);
    var template = jQuery('#slideOpts .data-slide-template');
    var slideCont = jQuery('#slides');
    var slideshow = jQuery('#slideshow');
    slideCont.html('');
    var ul = jQuery('<ul class="dropdown-menu aside-xl dker" style="display: block;"></ul>');
    var slides = song.content.split('\n\n');
    slides.forEach(function(item, index) {
        var slide = template.clone(true);
        slide.attr('onclick', 'changeSlide("' + index + '");');
        var fLine = item.split('\n')[0].trim() + ' ';
        var span = jQuery('<span class="jp-artist">Slide ' + (index + 1) + '</span>');
        slide.find('a').text(fLine);
        slide.find('a').append(span);
        slide.show();
        ul.append(slide);

        var slideEl = jQuery('<div class="slide"></div>').html(item.split('\n').join('<br>'));
        index == 0 && slideEl.addClass('active');
        slideshow.append(slideEl);
    });
    slideshow.append('<div class="slide-info">Slide 1 / ' + slides.length + '</div>');
    slideshow.append('<i class="slide-fullscreen icon-size-fullscreen" onclick="toggleFullscreen(event);"></i>');
    slideshow.append('<i class="slide-close icon-close" onclick="hideSlideShow();"></i>');
    var songId = parseInt(jQuery('#' + id).attr('data-index'));
    var info = data.filter(function(item) {
        return item.id === songId;
    });
    if(info.length > 0 && info[0].album && info[0].album !== "") {
        var title = albums.filter(function(item) {
            return item.id === parseInt(info[0].album);
        })[0].title;
        slideshow.append('<div class="album-info">' + title + '</div>');
    }
    if(info.length > 0 && info[0].artist && info[0].artist !== "") {
        var title = artists.filter(function(item) {
            return item.id === parseInt(info[0].artist);
        })[0].title;
        slideshow.append('<div class="artist-info">' + title + '</div>');
    }
    slideCont.append(ul);
};

var langPicker = jQuery('#langPicker');
var langProgress = jQuery('#langProgress');
(function() {
    var langList = langPicker.find('.lang-list').eq(0);
    languages.forEach(function(item, index) {
        langList.append(jQuery('<a href="index.php?lang=' + item.id + '" class="list-group-item" onclick="handleLangClick(event);">' + item.label + '</a>'));
    });
})();

var basepath = 'https://samsolomonprabu.github.io/cdn/songbook/';
function handleLangClick(event) {
    var el = jQuery(event.currentTarget);
    window.history.pushState('song', el.text(), el.attr('href'));
    var lang = el.attr('href').split('lang=')[1];
    var filename = basepath + lang + '-songs.js';
    var script = jQuery('<script id="songdata" type="text/javascript" src="' + filename + '"></script>');
    jQuery(document.body).append(script);
    langPicker.find('.lang-info').hide();
    langProgress.show().find('.loading-text').text('Loading ' + lang[0].toUpperCase() + lang.substr(1, lang.length - 1) + ' Songs...');
    localStorage.setItem('lang', lang);
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function changeLanguage() {
    langPicker.find('.icon-close').show();
    langPicker.fadeIn().find('.lang-info').show();
    langProgress.hide();
};

function closeLanguagePicker() {
    langPicker.fadeOut();
};

jQuery(document).ready(function() {
    HTTP_GET = getQueryParams(window.location.search);
    var lang = HTTP_GET['lang'] ? HTTP_GET['lang'] : localStorage.getItem('lang');
    var page = window.location.pathname.split('/').pop();
    if (lang && page === 'index.php') {
        localStorage.setItem('lang', lang);
        var filename = basepath + lang + '-songs.js';
        var script = jQuery('<script id="songdata" type="text/javascript" src="' + filename + '"></script>');
        jQuery(document.body).append(script);
        window.history.pushState('song', lang, 'index.php?lang=' + lang);
    } else {
        langPicker.show();
    }
});

function handleSongMenu(el, event) {
    jQuery(el).parent().toggleClass('open');
    event.preventDefault();
    event.stopPropagation();
    return false;
};

//loadData();

window.addEventListener('keydown', handleSlideshow);