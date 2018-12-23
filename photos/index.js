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
    listPhotos();
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
    const photo_big = parent.leftframe.document.getElementById('photo_big');
    let el;
    if (mediaItem.mimeType.indexOf('image/') === 0) {
        const url = buildFullUrl(mediaItem);
        el = document.createElement('img');
        el.src = url;
    } else if (mediaItem.mimeType.indexOf('video/') === 0) {
        const url = mediaItem.baseUrl + "=dv";
        el = document.createElement('video');
        el.autoplay = true;
        el.height = parent.document.body.scrollHeight;
        el.width = parent.document.body.scrollWidth * 0.8;
        el.src = url;
        el.addEventListener('loadstart', function (event) {
            photo_big.classList.add('loading');
            photo_big.poster = '';
        });
        el.addEventListener('canplay', function (event) {
            photo_big.classList.remove('loading');
            photo_big.poster = '';
        });
    } else {
        return;
    }
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
function listPhotos() {
    listing = true;
    // Example 2: Use gapi.client.request(args) function
    var request = gapi.client.request({
    'method': 'GET',
    'path': 'https://photoslibrary.googleapis.com/v1/mediaItems',
    'params': {pageToken: nextPageToken}
    });
    // Execute the API request.
    request.execute(function(response) {
        let mediaItems = response.mediaItems;
        const photos_list = document.getElementById('photos_list');
        if (nextPageToken === null) {
            setPhoto(mediaItems[0]);
        }
        nextPageToken = response.nextPageToken;
        for (let i=0; i<mediaItems.length; i++) {
            let mediaItem = mediaItems[i];
            let el = document.createElement('a')
            el.href = "#"
            el.onclick = function(event) {
                event.preventDefault();
                setPhoto(mediaItem);
                return false;
            }
            let img = document.createElement('IMG');
            img.src = thumbnail(mediaItem);
            el.appendChild(img);
            photos_list.appendChild(el);
            preloadMediaItem(mediaItem);
        }
        listing = false;
        console.log(response);
    });   
}

window.onscroll = function(ev) {
    if ((document.body.scrollTop) >= document.body.scrollHeight - 5000) {
        if (!listing){
            listPhotos();
        }
    }
};

document.onload = function() {
    let deferredPrompt;
btnAdd = document.getElementById('btnAdd');
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can add to home screen
  btnAdd.style.display = 'block';
});

btnAdd.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    btnAdd.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
  });

}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }