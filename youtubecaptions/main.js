var getSubtitles = require('youtube-captions-scraper').getSubtitles;

(function() {
    var cors_api_host = 'eerovil-cors-proxy.herokuapp.com';
    var cors_api_url = 'https://' + cors_api_host + '/';
    var slice = [].slice;
    var origin = window.location.protocol + '//' + window.location.host;
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        var args = slice.call(arguments);
        var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[1] = cors_api_url + args[1];
        }
        return open.apply(this, args);
    };
})();

// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.colorLoop = null
window.captions = []

window.loadVideo = function(id) {
    const container = document.querySelector('#captions')
    var player;
    container.innerHTML = 'Loading captions...'
    getSubtitles({
    videoID: id, // youtube video id
    lang: 'en' // default: `en`
    }).then(function(captions) {
        container.innerHTML = ''
        window.captions = captions.map((caption, i) => {
            return {
                id: i + "",
                start: parseFloat(caption.start),
                dur: parseFloat(caption.dur),
                text: caption.text,
            }
        })
        let i = 0;
        for (const line of captions) {
            let el = document.createElement('p')
            el.innerHTML = line.text
            el.setAttribute('captionid', i)
            el.setAttribute('start', line.start)
            el.setAttribute('dur', line.dur)
            container.append(el)
            i++;
            el.addEventListener('click', function(e) {
                player.seekTo(line.start)
            });
        }
    }).catch((err) => {
        container.innerHTML = err
    });

    player = new YT.Player('ytplayer', {
        width: window.innerWidth,
        videoId: id,
        events: {
            'onReady': function() {
                player.playVideo();
            }
        }
    });

    window.clearInterval(window.colorLoop);
    window.colorLoop = window.setInterval(function() {
        if (!player) {
            return;
        }
        if (player.getPlayerState() != 1) {
            return;
        }
        const currTime = player.getCurrentTime()
        if (!currTime || currTime == 0) {
            return
        }
        const currentCaptions = window.captions.filter((caption) => {
            return (caption.start < currTime && (caption.start + caption.dur) > currTime)
        }).map(caption => caption.id).slice(-1)
        document.querySelectorAll('#captions p').forEach((el) => {
            if (currentCaptions.includes(el.getAttribute('captionid'))) {
                el.classList.add('active')
                if (window.autoScroll) {
                    el.scrollIntoView()
                    window.scrollBy({top: -500})
                    window.autoScroll = true
                }
            } else {
                el.classList.remove('active')
            }
        })
    }, 100)
}

function playUrl(url) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
        window.loadVideo(match[2]);
        return true;
    }
    return false;
}

window.onYouTubeIframeAPIReady = function() {
    const input = document.querySelector('#ytlink')
    input.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            if (playUrl(event.target.value)) {
                input.classList.add('hidden')
            }
            
        }
    });

    window.autoScroll = true
    window.addEventListener('scroll', function(e) {
        window.autoScroll = false;
        window.clearTimeout(window.autoScrollTimeout)
        window.autoScrollTimeout =  window.setTimeout(function() {
            window.autoScroll = true
        }, 5000)
    });

    if (window.location.search.startsWith('?url=')) {
        playUrl(window.location.search.slice(5))
        input.classList.add('hidden')
    }
}
