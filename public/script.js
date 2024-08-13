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

    // Get the current path (notepad ID)
    const notepadId = window.location.pathname.substring(1) || 'default';

    // Fetch content and images from Firestore for the specific notepad
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
    });

    // Save content and images to Firestore for the specific notepad
    function saveNote() {
        const images = [];
        document.querySelectorAll('#image-container img').forEach(img => {
            images.push(img.src);
        });

        db.collection('notes').doc(notepadId).set({
            content: textarea.value,
            images: images,
        });
    }

    imageUpload.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            for (let file of files) {
                const storageRef = storage.ref(`${notepadId}/${file.name}`);
                const uploadTask = storageRef.put(file);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Progress function (optional)
                    },
                    (error) => {
                        console.error('Image upload failed:', error);
                    },
                    () => {
                        // Get the uploaded file's URL and save it in Firestore
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            const img = document.createElement('img');
                            img.src = downloadURL;
                            imageContainer.appendChild(img);
                            saveNote();
                        });
                    }
                );
            }
        }
    });
});
