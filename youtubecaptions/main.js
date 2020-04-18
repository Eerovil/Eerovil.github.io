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
window.ytpadding = document.querySelector('#ytpadding')

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
            el.dataset.captionid = i
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
        height: Math.min(window.innerWidth * 9.0 / 16.0, window.innerHeight / 2),
        videoId: id,
        playerVars: {
            'playsinline': '1',
        },
        events: {
            'onReady': function() {
                player.playVideo();
            },
            'onStateChange': function(event) {
                if (event.data == YT.PlayerState.PLAYING) {
                    ytpadding.style.height = document.querySelector('#ytplayer').height + 'px';
                    window.scrollTo({top: -100})
                    autoScroll = true
                }
            }
        }
    });

    var currentCaption = null;
    window.clearInterval(window.colorLoop);
    window.colorLoop = window.setInterval(function() {
        if (!player || !player.getPlayerState || player.getPlayerState() != 1) {
            return;
        }
        const currTime = player.getCurrentTime()
        if (!currTime || currTime == 0) {
            return
        }
        let newCaption = binarySearch(window.captions, currTime, (time, caption) => {
            if (caption.start > time) { return -1; }
            if ((caption.start + caption.dur) > time) { return 0; }
            return 1;
        })
        // Since two captions will often match, check the next index for an even better match.
        const nextCaption = window.captions[newCaption + 1];
        if (nextCaption && nextCaption.start < currTime && (nextCaption.start + nextCaption.dur) > currTime) {
            newCaption = newCaption + 1;
        }
        if (!newCaption || newCaption < 0 || currentCaption == newCaption) {
            return;
        }
        document.querySelector('#captionStyle').innerHTML = 'p[data-captionid="' + newCaption + '"] {color: chartreuse;}' 
        if (window.autoScroll) {
            el = document.querySelector('p[data-captionid="' + newCaption + '"]')
            window.ignoreNextScrollEvent = true;
            window.scrollTo({top: (el.offsetTop - window.ytpadding.offsetHeight - 30)})
            console.log("Scrolled to", el.offsetTop - window.ytpadding.offsetHeight - 30)
        }
        currentCaption = newCaption;
    }, 100)
}

function binarySearch(ar, el, compare_fn) {
    var m = 0;
    var n = ar.length - 1;
    while (m <= n) {
        var k = (n + m) >> 1;
        var cmp = compare_fn(el, ar[k]);
        if (cmp > 0) {
            m = k + 1;
        } else if(cmp < 0) {
            n = k - 1;
        } else {
            return k;
        }
    }
    return -m - 1;
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
                input.parentElement.classList.add('hidden')
            }
            
        }
    });

    document.querySelector('#ytlinkbtn').addEventListener("click", function(event) {
        if (playUrl(input.value)) {
            input.parentElement.classList.add('hidden')
        }
    });

    window.autoScroll = true
    window.ignoreNextScrollEvent = false;
    window.addEventListener('scroll', function(e) {
        if (window.ignoreNextScrollEvent) {
            // Ignore this event because it was done programmatically
            window.ignoreNextScrollEvent = false;
            return;
        }
        window.autoScroll = false;
        if (this.scrollY <= 0) {
            window.autoScroll = true;
        }
    });

    if (window.location.search.startsWith('?url=')) {
        playUrl(window.location.search.slice(5))
        input.parentElement.classList.add('hidden')
    }
}
