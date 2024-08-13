// Firebase configuration (replace with your own config)
const firebaseConfig = {
    apiKey: "AIzaSyAN4XEXDi8_RQI-dR3TJWT_n9mCGzBl1Oo",
    authDomain: "notepad-5aeb5.firebaseapp.com",
    projectId: "notepad-5aeb5",
    storageBucket: "notepad-5aeb5.appspot.com",
    messagingSenderId: "408674885479",
    appId: "1:408674885479:web:b2f7aa747d669e20c419c2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('notepad-content');
    const imageUpload = document.getElementById('image-upload');
    const imageContainer = document.getElementById('image-container');
    
    const notepadId = window.location.pathname.substring(1) || 'default';

    // Fetch content from Firestore
    db.collection('notes').doc(notepadId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            textarea.value = data.content || '';
            if (data.images) {
                data.images.forEach(imageSrc => {
                    const img = document.createElement('img');
                    img.src = imageSrc;
                    imageContainer.appendChild(img);
                });
            }
        }
    }).catch(error => {
        console.error("Error fetching document: ", error);
    });

    function saveNote() {
        const images = [];
        document.querySelectorAll('#image-container img').forEach(img => {
            images.push(img.src);
        });

        db.collection('notes').doc(notepadId).set({
            content: textarea.value,
            images: images,
        }).then(() => {
            console.log("Document successfully written!");
        }).catch((error) => {
            console.error("Error writing document: ", error);
        });
    }

    textarea.addEventListener('input', saveNote);

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                imageContainer.appendChild(img);
                saveNote();
            };
            reader.readAsDataURL(file);
        }
    });
});
