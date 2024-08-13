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

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('notepad-password');
    const passwordSubmit = document.getElementById('password-submit');
    const notepadContentContainer = document.getElementById('notepad-content-container');
    const textarea = document.getElementById('notepad-content');
    const imageUpload = document.getElementById('image-upload');
    const imageContainer = document.getElementById('image-container');

    const notepadId = window.location.pathname.substring(1) || 'default';

    passwordSubmit.addEventListener('click', () => {
        const enteredPassword = passwordInput.value;

        db.collection('notes').doc(notepadId).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data.password && data.password === btoa(enteredPassword)) {
                    // Password matches, show the notepad content
                    textarea.value = data.content || '';
                    if (data.images) {
                        data.images.forEach(imageSrc => {
                            const img = document.createElement('img');
                            img.src = imageSrc;
                            imageContainer.appendChild(img);
                        });
                    }
                    passwordInput.style.display = 'none';
                    passwordSubmit.style.display = 'none';
                    notepadContentContainer.style.display = 'block';
                } else {
                    alert('Incorrect password!');
                }
            } else {
                // If no document exists, allow the user to set a password for a new note
                const newPassword = prompt('Set a password for your notepad:');
                if (newPassword) {
                    db.collection('notes').doc(notepadId).set({
                        password: btoa(newPassword),
                        content: '',
                        images: [],
                    });
                    passwordInput.style.display = 'none';
                    passwordSubmit.style.display = 'none';
                    notepadContentContainer.style.display = 'block';
                }
            }
        }).catch(error => {
            console.error("Error fetching document: ", error);
        });
    });

    function saveNote() {
        const images = [];
        document.querySelectorAll('#image-container img').forEach(img => {
            images.push(img.src);
        });

        db.collection('notes').doc(notepadId).update({
            content: textarea.value,
            images: images,
        }).catch(error => {
            console.error("Error writing document: ", error);
        });
    }

    textarea.addEventListener('input', saveNote);

    imageUpload.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            for (let file of files) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    imageContainer.appendChild(img);
                    saveNote();
                };
                reader.readAsDataURL(file);
            }
        }
    });
});
