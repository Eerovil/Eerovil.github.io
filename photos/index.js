console.log("Hello world!");

var GoogleAuth;
var SCOPE = "https://www.googleapis.com/auth/photoslibrary.readonly";
function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load("client:auth2", initClient);
}

function initClient() {
  // Retrieve the discovery document for version 3 of Google Drive API.
  // In practice, your app can retrieve one or more discovery documents.
  var discoveryUrl =
    "https://photoslibrary.googleapis.com/$discovery/rest?version=v1";

  // Initialize the gapi.client object, which app uses to make API requests.
  // Get API key and client ID from API Console.
  // 'scope' field specifies space-delimited list of access scopes.
  gapi.client
    .init({
      apiKey: "AIzaSyBLgTeDjqm0X3800xEQzxo9bCa3HYIfpns",
      discoveryDocs: [discoveryUrl],
      clientId: "734651298434-6lukaeulk76bjmj4pkv456lt1bbd1f8v.apps.googleusercontent.com",
      scope: SCOPE
    })
    .then(function() {
      GoogleAuth = gapi.auth2.getAuthInstance();

      // Listen for sign-in state changes.
      GoogleAuth.isSignedIn.listen(updateSigninStatus);

      // Handle initial sign-in state. (Determine if user is already signed in.)
      var user = GoogleAuth.currentUser.get();
      setSigninStatus();

      // Call handleAuthClick function when user clicks on
      //      "Sign In/Authorize" button.
      $("#sign-in-or-out-button").click(function() {
        handleAuthClick();
      });
      $("#revoke-access-button").click(function() {
        revokeAccess();
      });
    });
}

function handleAuthClick() {
  if (GoogleAuth.isSignedIn.get()) {
    // User is authorized and has clicked 'Sign out' button.
    GoogleAuth.signOut();
  } else {
    // User is not signed in. Start Google auth flow.
    GoogleAuth.signIn();
  }
}

function revokeAccess() {
  GoogleAuth.disconnect();
}

function setSigninStatus(isSignedIn) {
  var user = GoogleAuth.currentUser.get();
  var isAuthorized = user.hasGrantedScopes(SCOPE);
  if (isAuthorized) {
    $("#sign-in-or-out-button").css("display", "none")//.html("Sign out");
    $("#revoke-access-button").css("display", "none");//"inline-block");
    $("#auth-status").html('');
    //   "You are currently signed in and have granted " + "access to this app."
    // );
    listAlbums();
  } else {
    $("#sign-in-or-out-button").html("Sign In/Authorize");
    $("#revoke-access-button").css("display", "none");
    $("#auth-status").html(
      "You have not authorized this app or you are " + "signed out."
    );
  }
}

function updateSigninStatus(isSignedIn) {
  setSigninStatus();
}

function setPhoto(mediaItem) {
    const photo_big = document.getElementById('photo_big');
    if (mediaItem == null) {
        if (!get_prevent_taps()) {
            return;
        }
        photo_big.removeChild(photo_big.firstChild);
        photo_big.classList.add('hidden')
        return;
    }
    photo_big.classList.remove('hidden')
    let el;
    if (mediaItem.mimeType.indexOf('image/') === 0) {
        const url = buildFullUrl(mediaItem);
        el = document.createElement('img');
        el.src = url;
    } else if (mediaItem.mimeType.indexOf('video/') === 0) {
        const url = mediaItem.baseUrl + "=dv";
        el = document.createElement('video');
        el.autoplay = true;
        el.controls = "true";
        el.loop = "true"
        el.height = window.innerHeight;
        el.width = window.innerWidth;
        el.src = url;
        el.addEventListener('loadstart', function (event) {
            photo_big.classList.add('loading');
            photo_big.poster = '';
        });
        el.addEventListener('canplay', function (event) {
            photo_big.classList.remove('loading');
            photo_big.poster = '';
        });
        el.addEventListener('touchend touchstart touchup', function(event) {
            setPhoto(null);
            event.stopPropagation();
        })
    } else {
        return;
    }
    el.id = mediaItem.id;
    if (photo_big.firstChild) {
        photo_big.replaceChild(el, photo_big.firstChild);
    } else {
        photo_big.appendChild(el);
    }
    // console.log(img.offsetWidth);
    // img.style['margin-left'] = `-${img.offsetWidth / 2}px`;
}

function preloadMediaItem(mediaItem) {
    if (mediaItem.mimeType.indexOf('image/') === 0) {
        (new Image()).src = buildFullUrl(mediaItem);
    } else if (mediaItem.mimeType.indexOf('video/') === 0) {
        return;
    }
}

function buildFullUrl(mediaItem) {
    return mediaItem.baseUrl + "=w2048-h1024";
}
function thumbnail(mediaItem) {
    return mediaItem.baseUrl;
}
var nextPageToken = null; 
var listing = true;
var albumId = null;
function listAlbums() {
    let request = gapi.client.request({
        'method': 'GET',
        'path': 'https://photoslibrary.googleapis.com/v1/albums',
        'params': {pageSize: 50}
    });
    request.execute(function(response) {
        console.log(response)
        const container = document.getElementById('photos_list')
        let createAlbum = function(title, id) {
            let el = document.createElement('a');
            el.id = id
            el.innerHTML = title
            el.href = "#"
            el.onclick = function(event) {
                event.preventDefault();
                albumId = event.target.id !== "null" ? event.target.id : null
                container.innerHTML = ""
                while ((document.body.scrollTop) >= document.body.scrollHeight - 1500) {
                    listPhotos();
                }
                return false;
            }
            container.appendChild(el)
            container.appendChild(document.createElement('br'))
        }
        createAlbum("Kaikki kuvat", null);
        for (let i=0; i<response.albums.length; i++) {
            let album = response.albums[i];
            createAlbum(album.title, album.id);
        }
    });
}

class queueObj {
    constructor() {
        this.queue = [];
        this.running = false;
    }
    addToQueue(url) {
        this.queue.push(url);
        this.run();
    }
    run() {
        if (this.running || this.queue.length == 0) {
            return;
        }
        this.running = true;
        const item = this.queue.pop();
        this.handleItem(item);
    }
    handleItem(item) {
        let img = item.el || new Image();
        img.src = item.url;
        const self = this;
        if(img.width){
            this.deQueue();
        }else{
            img.onload = function(){
                self.deQueue();
            }
        }
    }
    deQueue() {
        this.running = false;
        this.run();
    }
}
thumbnailQueue = new queueObj();
preloadlQueue = new queueObj();
requestQueue = new queueObj();
requestQueue.handleItem = function(item) {
    let request;
    if (albumId === null){
        request = gapi.client.request({
        'method': 'GET',
        'path': 'https://photoslibrary.googleapis.com/v1/mediaItems',
        'params': {pageToken: nextPageToken, pageSize: 100}
        });
    } else {
        request = gapi.client.request({
        'method': 'POST',
        'path': 'https://photoslibrary.googleapis.com/v1/mediaItems:search',
        'params': {pageToken: nextPageToken, pageSize: 100, albumId: albumId}
        });
    }
    const containers = item.containers;
    const self = this;
    request.execute(function(response) {
        let mediaItems = response.mediaItems;
        const photos_list = document.getElementById('photos_list');
        nextPageToken = response.nextPageToken || "stop";
        for (let i=0; i<mediaItems.length; i++) {
            let mediaItem = mediaItems[i];
            let el = document.createElement('a')
            el.href = "#"
            el.onclick = function(event) {
                if (!get_prevent_taps()) {
                    return;
                }

                event.preventDefault();
                setPhoto(mediaItem);
                return false;
            }
            const container = containers[i];
            container.mediaItem = mediaItem;
            container.element.appendChild(el);
            container.a = el;
            if (isScrolledIntoView(container.element)) {
                loadContainer(container)
            }
        }
        // for (let i=mediaItems.length; i<containers.length; i++) {
        //     console.log("WARNING: got too few items: " + containers.length);
        //     try {
        //         photos_list.removeChild(containers[i].element);
        //     } catch (e) {
        //         console.log(e)
        //     }
        // }
        // containers.splice(mediaItems.length, containers.length);
        console.log(response);
        self.deQueue();
    });
}

function loadContainer(container) {
    if (container.loaded || container.a == undefined) {
        return
    }
    console.log("loadcontainer " + container)
    const el = container.a;
    let img = document.createElement('IMG');
    thumbnailQueue.addToQueue({el: img, url: thumbnail(container.mediaItem)});
    el.appendChild(img);
    if (container.element == undefined) {
        container.element = document.createElement('div');
        console.log("WARNING: containers list is empty");
    }
    container.element.appendChild(el);
    container.img = img;
    container.loaded = true;
    //preloadlQueue.addToQueue({el: null, url: buildFullUrl(mediaItem)});
}
function unloadContainer(container) {
    if (!container.loaded) {
        return
    }
    console.log("unloadcontainer " + container)
    container.a.removeChild(container.img);
    container.loaded = false;
    
}

function isScrolledIntoView(el) {
    var rect = el.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;

    // Only completely visible elements return true:
    var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    // Partially visible elements return true:
    //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
    return isVisible;
}

var all_containers = [];

var prevent_taps = false;
function get_prevent_taps() {
    if (prevent_taps) {
        return false;
    }
    prevent_taps = true;
    setTimeout(function() {
        prevent_taps = false;
    }, 500);
    return true;
}

function listPhotos() {
    console.log("listPhotos called")
    const photos_list = document.getElementById('photos_list');
    // Example 2: Use gapi.client.request(args) function
    if (nextPageToken === "stop") {
        return;
    }
    let subcontainers = [];
    // Create the containers right away
    for (let i=0; i<100; i++) {
        let container = document.createElement('div');
        photos_list.appendChild(container);
        subcontainers.push({element: container});
    }
    all_containers.push(subcontainers);
    requestQueue.addToQueue({containers: subcontainers});
}

window.onscroll = function(ev) {
    if ((document.body.scrollTop) >= document.body.scrollHeight - 1500) {
        listPhotos();
    }
    for (let i=0; i<all_containers.length; i++) {
        for (let j=0; j<all_containers[i].length; j++) {
            const container = all_containers[i][j];
            if (isScrolledIntoView(container.element)) {
                loadContainer(container);
            } else {
                unloadContainer(container)
            }
        }
    }
};


