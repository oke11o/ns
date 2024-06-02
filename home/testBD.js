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

function writeTestMessage() {
    var now = new Date();
    var timestamp = now.toISOString();
    db.collection("test_messages").add({
        message: "Привет, как слышно, прием прием",
        timestamp: timestamp
    })
    .then((docRef) => {
        logMessage("Test message written with ID: " + docRef.id);
    })
    .catch((error) => {
        logMessage("Error adding test message: " + error);
    });
}

writeTestMessage();

// Загрузка данных из коллекции test_messages
function loadMessages() {
    db.collection("test_messages").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            logMessage(`Document data: ${JSON.stringify(doc.data())}`);
        });
    }).catch((error) => {
        logMessage("Error getting documents: " + error);
    });
}

loadMessages();

// Прослушивание изменений в коллекции test_messages
db.collection("test_messages").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            logMessage(`New message: ${JSON.stringify(change.doc.data())}`);
        }
        if (change.type === "modified") {
            logMessage(`Modified message: ${JSON.stringify(change.doc.data())}`);
        }
        if (change.type === "removed") {
            logMessage(`Removed message: ${change.doc.id}`);
        }
    });
});
