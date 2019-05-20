var languages = [
    { id: 'tamil', label: 'தமிழ் (Tamil)' },
    { id: 'english', label: 'English' },
    { id: 'hindi', label: 'हिंदी (Hindi)' },
    { id: 'telugu', label: 'తెలుగు (Telugu)' },
    { id: 'malayalam', label: 'മലയാളം (Malayalam)' },
    { id: 'nepali', label: 'नेपाली (Nepali)' },
    { id: 'kannada', label: 'ಕನ್ನಡ (Kannada)' }
];

var batchSize = 100;
var cont, pagination;
var alphabetsCont = jQuery('#alphabets');
var albumsCont = jQuery('#albums');
var artistsCont = jQuery('#artists');
var songbookTitle = jQuery('#songbookTitle');
var downloadApp = jQuery('#downloadApp');
var langSongs = [], map = {};
var fuse;
var currentLanguage = '';

function fetchCurrentLanguage() {
    HTTP_GET = getQueryParams(window.location.search);
    if(HTTP_GET['lang']) {
        currentLanguage = HTTP_GET['lang'];
    } else {
        currentLanguage = localStorage.getItem('lang');
        var url = window.location.href + (window.location.href.indexOf('.php') != -1 ? '' : 'index.php') + (Object.keys(HTTP_GET).length == 0 ? '?' : '&') + 'lang=' + currentLanguage;
        window.history.pushState('Christian Songbook - ' + currentLanguage, currentLanguage + ' Songbook', url);
    }
    return currentLanguage;
};

function loadData() {
    HTTP_GET = getQueryParams(window.location.search);
    fetchCurrentLanguage();
    langPicker.hide();
    langSongs = songs;
    
    var page = window.location.pathname.split('/').pop();
    if (page === 'index.php' || page === '') {
        data = songs;
    } else if (page === 'albums.php') {
        genCategories(albums, 'albums.php', 'handleAlbumClick(event);', 'https://aagjxwfhen.cloudimg.io/width/800/none/https://samsolomonprabu.github.io/cdn/albums/' + currentLanguage + '/');
        data = [];
        HTTP_GET['id'] && filterAlbum();
    } else if (page === 'artists.php') {
        genCategories(artists, 'artists.php', 'handleArtistClick(event);', 'https://aagjxwfhen.cloudimg.io/width/800/none/https://samsolomonprabu.github.io/cdn/artists/' + currentLanguage + '/');
        data = [];
        HTTP_GET['id'] && filterArtist();
    } else if (page === 'video-songs.php') {
        genVideos(videoSongs);
        data = videoSongs;
        HTTP_GET['title'] && jQuery('#lyricTitle').text(HTTP_GET['title']);
        HTTP_GET['id'] && jQuery('#ytube').show().find('iframe').attr('src', 'https://www.youtube.com/embed/' + HTTP_GET['id']);
    } else if (page === 'karaoke-songs.php') {
        genVideos(karaokeSongs, true);
        data = karaokeSongs;
        HTTP_GET['title'] && jQuery('#lyricTitle').text(HTTP_GET['title']);
        HTTP_GET['id'] && jQuery('#ytube').show().find('iframe').attr('src', 'https://www.youtube.com/embed/' + HTTP_GET['id']);
    } else if (page === 'songlist.php') {
        if(Object.keys(songlistData).length == 0) {
            setTimeout(loadData, 100);
            return;
        }
        var songsObj = songlistData[HTTP_GET['id']].songs;
        var listSongs = [];
        for(var key in songsObj) {
            songsObj[key].id = key;
            listSongs.push(songsObj[key]);
        }
        data = listSongs;
    }

    // Initialise Fuse
    var options = { keys: ['title'], id: 'id' };
    fuse = new Fuse(data, options);

    // Generate Map
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

function genVideos(videos, isKaroake) {

    if(!Array.isArray(videos)) {
        var page = window.location.pathname.split('/').pop();
        if(page === 'video-songs.php') {
            videos = videoSongs;
        } else if(page === 'karaoke-songs.php') {
            videos = karaokeSongs;
            isKaroake = true;
        }
    }

    data = videos;

    HTTP_GET = getQueryParams(window.location.search);
    if(HTTP_GET['s']) {
        videos = filterAlphabets();
    }

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
        if(i !== start -1 && i % 15 == 0) {
            insertAd(videoCont);
        }
        var video = template.clone(true);
        video.find('img').attr('src', 'https://img.youtube.com/vi/' + (isKaroake ? videos[i].karoke : videos[i].youtube) + '/0.jpg').attr('id', 'vid_' + md5(i));
        video.find('.data-song-title').text(videos[i].title);
        video.attr('data-id', (isKaroake ? videos[i].karoke : videos[i].youtube)).attr('data-title', videos[i].title).show();
        videoCont.append(video);
    }

    var pagination = jQuery('#paginationContainer');
    pagination.html('');
    for(var i = 1; i <= totalLength; i++) {
        pagination.append(jQuery('<a class="' + (pageNo == i ? 'active' : '') + ' btn btn-rounded btn-sm btn-icon btn-default" href="#' + i + '">' + i + '</a>'));
    }
};

function playVideo(event) {
    var el = jQuery(event.currentTarget);
    var panel = jQuery('#videoPanel').fadeIn();
    panel.find('.video-song-title').text(el.attr('data-title'));
    panel.find('iframe').attr('src', 'https://www.youtube.com/embed/' + el.attr('data-id'));
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
        var a = jQuery('<a href="' + page + 's=' + item + '" data-index="' + index + '" class="btn btn-rounded btn-sm btn-icon btn-default">' + item + '</a>');
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
    var page = window.location.pathname.split('/').pop();
    if(page === '' || page === 'index.php' || page === 'albums.php' || page === 'artists.php') {
        fetch();
    } else if(page === 'video-songs.php' || page === 'karaoke-songs.php') {
        genVideos();
    }
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

function handleSongClick(event, showYoutube) {
    jQuery('#songsContainer > li.active').removeClass('active');
    var el = jQuery(event.currentTarget);
    if(el.is('.fab')) {
        el = el.parents('.list-group-item').eq(0);
    }
    el.addClass('active');
    var info = data[el.attr('data-index')];
    window.history.pushState('song', el.text(), el.attr('href'));
    initDisqus();
    fetchSong(showYoutube);
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function initDisqus() {
    HTTP_GET = getQueryParams(window.location.search);
    var disqus_config = function () {
        this.page.url = window.location.href;
        this.page.identifier = HTTP_GET['song'];
    };
    var d = document, s = d.createElement('script');
    s.src = 'https://https-christiansongbook-in.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
};

function handleSongListClick(event) {
    var el = jQuery(event.currentTarget);
    var page = window.location.pathname.split('/').pop();
    window.history.pushState('song', el.text(), 'songlist.php?id=' + el.find('a').eq(0).attr('data-id'));
    if (page !== 'songlist.php') {
        jQuery.ajax({
            url: 'partials/index.php',
            method: 'GET'
        }).done(function(response) {
            jQuery('#songbook-target').html(response);
            loadData();
        });
    } else {
        fetch();
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function handleVideoClick(event) {
    var el = jQuery(event.currentTarget);
    var page = window.location.pathname.split('/').pop();
    window.history.pushState('song', el.text(), page + '?id=' + el.attr('data-id') + '&title=' + el.attr('data-title'));
    jQuery('#lyricTitle').text(el.attr('data-title'));
    document.title = el.attr('data-title') + ' | Christian Song Book | Part of APA Mission';
    jQuery('#ytube').show().find('iframe').attr('src', 'https://www.youtube.com/embed/' + el.attr('data-id'));
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function handleYoutube(event) {
    var el = jQuery(event.currentTarget);
    jQuery('#ytube').show().find('iframe').attr('src', 'https://www.youtube.com/embed/' + el.attr('data-youtube'));
    handleSongClick(event, true);
    event.preventDefault();
    event.stopPropagation();
    return false;
};

function filterAlphabets() {
    var alphabet = HTTP_GET['s'];
    if(alphabet) {
        var filteredData = data.filter(function(item) {
            return item.title.startsWith(alphabet);
        });
        var alphaEl = '[href="' + window.location.pathname.split('/').pop() + '?s=' + alphabet + '"]';
        jQuery('#alphabets ' + alphaEl).addClass('active');
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
    jQuery('#categoryTitle').text(albumInfo.title);
    document.title = albumInfo.title + ' | Christian Song Book | Part of APA Mission';
};

function filterArtist() {
    var artistId = HTTP_GET['id'];
    data = langSongs.filter(function(item) {
        return item.artist == artistId;
    });
    artistInfo = artists.filter(function(item) {
        return item.id == artistId;
    })[0];
    jQuery('#categoryTitle').text(artistInfo.title);
    document.title = artistInfo.title + ' | Christian Song Book | Part of APA Mission';
};

function filterSongList() {
    HTTP_GET = getQueryParams(window.location.search);
    jQuery('#pageInfoEl').text(songlistData[HTTP_GET['id']].name);
    var songsObj = songlistData[HTTP_GET['id']].songs;
    var songs = [];
    for(var key in songsObj) {
        songsObj[key].id = key;
        songs.push(songsObj[key]);
    }
    return songs;
};

function searchSongs(el) {
    el = jQuery(el);
    HTTP_GET = getQueryParams(window.location.search);
    var keyword = el.val();
    if(keyword !== '') {
        HTTP_GET.k = el.val();
    } else {
        delete HTTP_GET.k;
    }
    var params = '';
    for(var key in HTTP_GET) { params += key + '=' + HTTP_GET[key] + '&'; }
    params = params.substr(0, params.length - 1);
    window.history.pushState('search_song', el.val(), 'index.php?' + params);
    fetch();
};

function filterSongs() {
    HTTP_GET = getQueryParams(window.location.search);
    var results = fuse.search(HTTP_GET['k']);
    var filtered = [];
    results.forEach(function(item, index) {
        filtered.push(map[item]);
    });
    return filtered;
};

function fetch() {
    var page = window.location.pathname.split('/').pop();

    if(HTTP_GET['s']) {
        filtered = filterAlphabets();
    } else if(HTTP_GET['k']) {
        filtered = filterSongs();
    } else if(page === 'songlist.php') {
        filtered = filterSongList();
    } else {
        filtered = data;
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
    var url = page + '?';
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
        var songURL = url + (url.indexOf('.php') != -1 ? '' : 'index.php') + 'song=' + md5(filtered[i].id) + '&title=' + filtered[i].title + '&lang=' + fetchCurrentLanguage();
        song.attr('id', md5(filtered[i].id))
            .attr('data-index', filtered[i].id)
            .attr('data-i', i)
            .attr('href', songURL)
            .attr('onclick', 'handleSongClick(event);');
        song.find('a.data-link').attr('href', songURL);
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
    if((page === '' || page === 'index.php') && totalLength > 1) {
        pageInfoEl.text('All Songs (Page ' + pageNo + '/' + totalLength + ')');
    } else if(page === '' || page === 'index.php') {
        pageInfoEl.text('All Songs');
    }
    appendSonglistDropdown();
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

function fetchSong(showYoutube) {
    !showYoutube && jQuery('#ytube').hide();
    HTTP_GET = getQueryParams(window.location.search);
    jQuery('#lyricTitle').text(HTTP_GET['title']);
    document.title = HTTP_GET['title'] + ' | Christian Song Book | Part of APA Mission';
    var canvasCont = jQuery('#canvasContainer');
    canvasCont.html('');
    jQuery('#lyricStatus').show().text('Loading song...');
    jQuery('#downloadOptions').hide();
    jQuery('#downloadOptions a').eq(0).attr('href', 'https://verkkonet.com/slide/index.php?id=' + HTTP_GET['song']);
    jQuery('#downloadOptions a').eq(1).attr('href', 'https://verkkonet.com/slide/export.php?type=pdf&id=' + HTTP_GET['song']);
    jQuery('#downloadOptions a').eq(2).attr('href', 'https://verkkonet.com/slide/export.php?type=image&id=' + HTTP_GET['song']);
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
        initDisqus();
        if(isMobile()) {
            document.getElementById('lyricsCont').scrollIntoView({ behavior: 'smooth' });
        }
    });
};

function isMobile = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

var adIndex = 0;
function insertAd(cont) {
    cont.append(getAdSnippet(adIndex));
    adIndex;
};

function init() {
    jQuery('#preloader').hide();
    cont = jQuery('#songsContainer');
    pagination = jQuery('#paginationContainer');
    pageInfoEl = jQuery('#pageInfoEl');

    var currURL = window.location.href;
    var page = window.location.pathname.split('/').pop();
    if(page === '' || page === 'index.php' || page === 'albums.php' || page === 'artists.php' || page === 'songlist.php') {
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
    var slides = song.content.split('\n\r');
    slides.forEach(function(item, index) {
        item = item.trim();
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
        langList.append(jQuery('<a href="index.php?lang=' + item.id + '" class="list-group-item" onclick="handleLangClick(event, \'' + item.id + '\');">' + item.label + '</a>'));
    });
})();

var basepath = 'https://samsolomonprabu.github.io/cdn/cs/data/';
var androidBaseURL = 'https://play.google.com/store/apps/details?id=sam.songbook.';
function handleLangClick(event, lang) {
    var el = jQuery(event.currentTarget);
    window.history.pushState('song', el.text(), el.attr('href'));
    var filename = basepath + lang + '-songs.js';
    jQuery('#songdata').remove();
    var script = jQuery('<script id="songdata" type="text/javascript" src="' + filename + '"></script>');
    jQuery(document.body).append(script);
    langPicker.find('.lang-info').hide();
    langProgress.show().find('.loading-text').text('Loading ' + lang[0].toUpperCase() + lang.substr(1, lang.length - 1) + ' Songs...');
    localStorage.setItem('lang', lang);

    jQuery('#androidApp').attr('href', androidBaseURL + lang);
    jQuery('#allSongsEl').attr('href', 'index.php?lang=' + lang).click();
    jQuery('#albumNav a').attr('href', 'albums.php?lang=' + lang);
    jQuery('#artistNav a').attr('href', 'artists.php?lang=' + lang);
    jQuery('#videoNav a').attr('href', 'video-songs.php?lang=' + lang);
    jQuery('#karaokeNav a').attr('href', 'karaoke-songs.php?lang=' + lang);

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
    var lang = fetchCurrentLanguage();
    var page = window.location.pathname.split('/').pop();
    if (lang) {
        localStorage.setItem('lang', lang);
        jQuery('#androidApp').attr('href', androidBaseURL + lang);
        if(!HTTP_GET['lang']) {
            window.location.href = page + '?lang=' + lang;
        }
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
    var castMiniPlayer = jQuery('.cast-mini-player');
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

//loadData();

window.addEventListener('keydown', handleSlideshow);
