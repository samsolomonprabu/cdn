var userInfoLogin = jQuery('#userInfoLogin');
var userInfoHeader = jQuery('#userInfoHeader');
var userInfoFooter = jQuery('#userInfoFooter');
var userData = null;
var user = firebase.auth().currentUser;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        userData = user;
        userInfoLogin.hide();
        updateUI(userInfoHeader, user);
        updateUI(userInfoFooter, user);

        jQuery('#userImage').attr('src', user.photoURL);
        jQuery('#userFullName').text(user.displayName);
        jQuery('#userEmail').text(user.email);

        jQuery('.data-user-name').val(user.displayName);
        jQuery('.data-user-email').val(user.email);

        jQuery('#liveChat').html(`
            <script type="text/javascript">
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            Tawk_API.visitor = {
                name: '${user.displayName}',
                email: '${user.email}'
            };
            (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/5c987dca1de11b6e3b04fe2f/default';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
                })();
            </script>
        `);

        addFavoritesList();
        updateSongListUI();
    }
});

var nameUpdated = false, emailUpdated = false;
function updateProfileChanges(el) {
    var user = firebase.auth().currentUser;
    user.updateProfile({
        displayName: jQuery(el).find('.data-user-name').val()
    }).then(function() {
        nameUpdated = true;
        profileUpdated();
    }).catch(function(error) {});
    user.updateEmail(jQuery(el).find('.data-user-email').val()).then(function() {
        emailUpdated = true;
        profileUpdated();
    }).catch(function(error) {});
    return false;
};

function profileUpdated() {
    if (nameUpdated && emailUpdated) {
        nameUpdated = false;
        emailUpdated = false;
        window.location.reload();
    }
};

function setPassword(el) {
    jQuery(el).find('.alert-danger').hide();
    jQuery(el).find('.alert-success').hide();

    var user = firebase.auth().currentUser;
    var password = jQuery(el).find('.data-password').val();
    var confirm = jQuery(el).find('.data-confirm').val();

    if (password === confirm) {
        var newPassword = getASecureRandomPassword();
        user.updatePassword(newPassword).then(function() {
            jQuery(el).find('.alert-success').slideDown();
        }).catch(function(error) {});
    } else {
        jQuery(el).find('.alert-danger').slideDown();
    }
    return false;
};

function updateUI(parent, user) {
    parent.find('.data-user-name').text(user.displayName);
    parent.find('.data-user-img').attr('src', user.photoURL);
    if(parent.find('.data-user-email').length > 0) {
        parent.find('.data-user-email').text(user.email);
    }
    parent.show();
};

function logout() {
    firebase.auth().signOut().then(function() {
        userInfoHeader.hide();
        userInfoFooter.hide();
        userInfoLogin.show();
    }, function(error) {
    });
};

var db = firebase.database();

function addFavoritesList() {
    if (userData.metadata.a === userData.metadata.b) {
        addSongList('Favorite Songs');
    }
};

function showAddSongList() {
    if(userData) {
        jQuery('#songListModal').modal('show');
    } else {
        alert('Please login / register to create your song list.')
    }
};

function addSongList(listName) {
    var listData = {
        uid: userData.uid,
        name: listName,
        songs: {}
    };
    var newListKey = db.ref().child('songlist').push().key;
    var updates = {};
    updates['songlist/' + newListKey] = listData;
    db.ref().update(updates, function(error) {
        if (error) {
        } else {
            updateSongListUI();
        }
    });
};

var songlistData = {};
var dummyEl = null;
function updateSongListUI() {
    var songlist = jQuery('#songlist');
    db.ref().child('songlist').orderByChild('uid').equalTo(userData.uid).on('value', function(snapshot) {
        songlist.find('.data').remove();
        songlistData = snapshot.val();
        dummyEl = jQuery('<ul>');
        for (var key in songlistData) {
            var info = songlistData[key];
            var li = jQuery('<li class="data" onclick="handleSongListClick(event);">' + '<a href="#" data-id="' + key + '"><b class="badge bg-success dker pull-right">' + (info.songs ? Object.keys(info.songs).length : '') + '</b><span>' + info.name + '</span></a></li>');
            songlist.append(li);

            dummyEl.append(jQuery('<li><a href="#" onclick="addSongToList(this, event);" data-id="' + key + '">' + info.name + '</a></li>'));
        }
        appendSonglistDropdown();
    });

};

function appendSonglistDropdown() {
    var page = window.location.pathname.split('/').pop();
    if(dummyEl && page !== 'songlist.php') {
        var cont = jQuery('#songsContainer');
        cont.find('.data-song-menu').html('').html(dummyEl.html());
        cont.find('.dropdown').show();
    }
};

function addSongToList(el, event) {
    jQuery(el).parents('.dropdown.open').removeClass('open');
    var listKey = jQuery(el).attr('data-id');
    var songId = jQuery(el).parents('li.list-group-item').eq(0).attr('data-index');
    var data = songlistData[listKey].songs || {};
    data[songId] = { title: map[songId].title, youtube: map[songId].youtube || '', karoke: map[songId].karoke || '' };
    var listData = { uid: userData.uid, name: songlistData[listKey].name, songs: data };
    var updates = {};
    updates['songlist/' + listKey] = listData;
    db.ref().update(updates, function(error) {
        if (error) {
        } else {
            updateSongListUI();
        }
    });
    event.preventDefault();
    event.stopPropagation();
    return false;
};

