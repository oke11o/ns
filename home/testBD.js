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

try {
    // Test Firestore connection
    db.collection("test").add({
        testField: "testValue"
    })
    .then((docRef) => {
        logMessage("Document written with ID: " + docRef.id);
    })
    .catch((error) => {
        logMessage("Error adding document: " + error);
    });

    // Read from Firestore
    db.collection("test").get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            logMessage("No documents found.");
        } else {
            querySnapshot.forEach((doc) => {
                logMessage(`Document data: ${JSON.stringify(doc.data())}`);
            });
        }
    }).catch((error) => {
        logMessage("Error getting documents: " + error);
    });
} catch (error) {
    logMessage("Error in Firestore operations: " + error);
}
