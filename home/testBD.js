// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAk68Jk6DvWUZAlGfu-tOKmC45fo1sX18w",
    authDomain: "voroshilovdo-39efc.firebaseapp.com",
    projectId: "voroshilovdo-39efc",
    storageBucket: "voroshilovdo-39efc.appspot.com",
    messagingSenderId: "859981515674",
    appId: "1:859981515674:web:c4a6120186614d24a78823"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

function logMessage(message) {
    var logDiv = document.getElementById('log');
    logDiv.innerHTML += `<p>${message}</p>`;
    console.log(message);
}

logMessage("Firebase initialized.");

// Прослушивание изменений в коллекции "buildings"
db.collection("buildings").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            logMessage(`New building: ${JSON.stringify(change.doc.data())}`);
        }
        if (change.type === "modified") {
            logMessage(`Modified building: ${JSON.stringify(change.doc.data())}`);
        }
        if (change.type === "removed") {
            logMessage(`Removed building: ${change.doc.id}`);
        }
    });
});
