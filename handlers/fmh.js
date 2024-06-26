var fms = [
     { src: '<iframe src="https://embed.radio.co/player/d69edcc.html" width="100%" allow="autoplay" scrolling="no" style="border: none; overflow: hidden; max-width: 350px; margin: 0px auto; height: 450px;"></iframe>', name: 'Thuthi FM', img: 'thudhi-fm.png'},
     { src: '<iframe src="https://embed.radio.co/player/8b91153.html" width="100%" allow="autoplay" scrolling="no" style="border: none; overflow: hidden; max-width: 300px; margin: 0px auto; height: 100px;"></iframe>', name: 'Inbam FM', img: 'inbam-fm.png'},
     { src: '<iframe src="http://cdn.voscast.com/player/player.php?host=s4.voscast.com&amp;port=7110&amp;autoplay=true" width="150" height="30" frameborder="0" scrolling="no" allow="autoplay"></iframe>', name: 'Kirubai FM', img: 'kirubai-fm.png'},
     { src: '', name: 'Amen FM', img: 'amen-fm.png'},
     { src: '<script type="text/javascript" src="http://hosted.musesradioplayer.com/mrp.js"></script><script type="text/javascript">MRP.insert({"url":"http://66.55.145.43:7364/;","codec":"aac","volume":65,"autoplay":true,"buffering":5,"title":"Vaanmalar FM","welcome":"WELCOME TO...","wmode":"transparent","skin":"limed","width":397,"height":115});</script>', name: 'Vaanmalar FM', img: 'vaanmalar.png'},
     { src: '<iframe src="http://fgpcfm.com/player.html"></iframe>', name: 'FGPC FM', img: ''},
     { src: '<iframe width="720" height="120" src="https://player.magicstreams.gr/iframe/index.php?autoplay=play&amp;name=IRAI ISAI Tamil Christian Radio&amp;logo=&amp;bgcolor=FFFFFF&amp;textcolor=000000&amp;v=1&amp;stream=http://janus.shoutca.st:9366/; " frameborder="0" scrolling="no" style="border-radius: 8px;" allow="autoplay;"></iframe>', name: 'Iraiisai FM', img: ''},
     { src: '', name: 'Waves Of Power FM', img: 'fgpc-fm.png'},
     { src: '<audio controls="" autoplay="autoplay"><source src="http://162.244.80.20:4712/stream" type="audio/mp3"></audio>', name: 'Uthamiyae FM', img: 'uthamiyae-fm.png'},
     { src: '<audio controls="" autoplay="autoplay"><source src="http://209.133.216.3:7126/stream" type="audio/mp3"></audio>', name: 'Theophony FM', img: 'theopony.png'},
     { src: '<audio controls="" autoplay="autoplay"><source src="http://195.154.217.103:8704/;stream.mp3" type="audio/mp3"></audio>', name: 'Devaprasannam FM', img: 'devaprasannam-fm.png'},
     { src: '<iframe src="http://player.streamguys.com/christianfm/sgplayer/player.php"></iframe>', name: 'Christian FM', img: 'christian-fm.png'},
     { src: '<audio controls="" autoplay="autoplay"><source src="http://50.7.70.66:8575/;" type="audio/mp3"></audio>', name: 'Jesus FM', img: 'jesus-fm.png'},
     { src: '<audio controls="" src="http://188.165.212.154:8449/;" autoplay=""></audio>', name: 'Zion FM', img: 'zion-fm.png'},
     { src: '<audio width="260" height="32" controls="controls" autoplay="autoplay"><source src="http://198.178.123.20:8302/;stream.mp3" type="audio/mpeg"></audio>', name: 'Vallamayinthoni FM', img: 'vallamayin-thoni-fm.png'},
     { src: '<audio controls="" src="http://66.55.145.43:7329/stream?1550374790072" autoplay=""></audio>', name: 'Sweety FM', img: 'sweety-fm.png'},
     { src: '<audio controls="" id="myaudio" autoplay="true"><source src="http://108.166.161.221:7160/;stream.mp3"></audio>', name: 'Ruah FM', img: 'ruah-fm.png'},
     { src: '', name: 'Manna FM', img: 'manna-fm.png'},
     { src: '', name: 'Luminous FM', img: 'luminous-fm.png'},
     { src: '', name: 'Divyam FM', img: 'divyam-fm.png'},
     { src: '', name: 'Rosary FM', img: 'rosary-fm.png'},
     { src: '', name: 'Joel FM', img: 'joel-fm.pnga'},
     { src: '', name: 'Evangel FM', img: 'evangel-fm.png'},
     { src: '', name: 'Arulvakku FM', img: 'arulvakku-fm.png'},
     { src: '', name: 'Kross FM', img: 'kross-fm.png'},
     { src: '', name: 'Galeed FM', img: 'galeed-fm.png'}
];

jQuery(function() {
     fmContainer = jQuery('#fmContainer');
     fmTitle = jQuery('#fmName');
     mediaContainer = jQuery('#mediaShows');
     fmTemplate = jQuery('#fmTemplate');
     construct();
});

var adIndex = 0;

function construct() {
     var hash = window.location.hash.split('#')[1];
     mediaContainer.html('');
     var count = 0;
     fms.forEach(function(item, index) {
          if(index != 0 && count % 4 == 0) {
               insertAd();
          }
          count++;

          var fm = fmTemplate.clone(true);
          fm.attr('id', md5(index));

          var imgEl = fm.find('img');
          imgEl.attr('src', imgEl.attr('src') + item.img);
          imgEl.attr('alt', item.name);

          fm.find('.card-text').text(item.name);

          if(hash === md5(index)) {
               fm.find('.card').addClass('bg-dark');
               fm.find('a').attr('href', '#' + md5(index)).text('Currently Listening');
               fmContainer.css('display', 'flex').html('<h3 style="text-align: center;padding-bottom: 30px;">' + item.name + '</h3>' + item.src);
               document.title = item.name + ' | ' + document.title;
               fmTitle = jQuery('#fmName');
               window.scroll({ top: fmTitle.scrollTop, behavior: 'smooth' });
          } else {
               fm.find('a').attr('href', '#' + md5(index)).text('Listen Now');
          }

          fm.show();
          mediaContainer.append(fm);
     });
};

function changeFM() {
     construct();
};

function insertAd() {
     var fm = fmTemplate.clone(true);
     fm.attr('id', md5('ad' + adIndex));
     fm.html(getAdSnippet(adIndex));
     fm.show();
     mediaContainer.append(fm);
     adIndex++;
};

window.onhashchange = changeFM;