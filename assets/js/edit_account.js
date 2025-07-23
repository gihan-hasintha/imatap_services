import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app-check.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAjv12MJilOWARxoe_YqEXB9YZ2i1QMTd0",
    authDomain: "imatap.firebaseapp.com",
    projectId: "imatap",
    storageBucket: "imatap.firebasestorage.app",
    messagingSenderId: "385083217755",
    appId: "1:385083217755:web:83334c40989a9032c8ac7e",
    measurementId: "G-43CKB8XJBF"
};
const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LdaQocrAAAAAEB7H0vhlojYmCpwpA_oN-lczPM2'),
  isTokenAutoRefreshEnabled: true
});
const db = getFirestore(app);
const auth = getAuth(app);

// Cloudinary config
const cloudName = 'dffhwv0m1';
const unsignedUploadPreset = 'avatars';

let avatarCropper, coverCropper, avatarBlob, coverBlob;
let galleryFiles = [];
let galleryDataUrls = [];
let userDocId = null;

function redirectToLogin() {
    window.location.href = '/client-login.html';
}

function dataUrlToWebpBlob(dataUrl, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth || height > maxHeight) {
                const scale = Math.min(maxWidth / width, maxHeight / height);
                width = width * scale;
                height = height * scale;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/webp', 0.92);
        };
        img.src = dataUrl;
    });
}

// Avatar Cropper
import Cropper from 'https://cdn.jsdelivr.net/npm/cropperjs@1.5.13/dist/cropper.esm.js';
document.getElementById('avatar').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = document.createElement('img');
        img.src = evt.target.result;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        const preview = document.getElementById('avatarPreview');
        preview.innerHTML = '';
        preview.appendChild(img);
        if (avatarCropper) avatarCropper.destroy();
        avatarCropper = new Cropper(img, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1,
            movable: true,
            zoomable: true,
            scalable: true,
            cropBoxResizable: true
        });
        document.getElementById('cropAvatarBtn').disabled = false;
    };
    reader.readAsDataURL(file);
});
document.getElementById('cropAvatarBtn').addEventListener('click', function() {
    if (!avatarCropper) return;
    avatarCropper.getCroppedCanvas({ width: 400, height: 400 }).toBlob(function(blob) {
        avatarBlob = blob;
        const url = URL.createObjectURL(blob);
        document.getElementById('avatarPreview').innerHTML = `<img src="${url}" style="width:100%;max-width:200px;">`;
    }, 'image/webp');
});
// Cover Cropper

document.getElementById('coverPhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = document.createElement('img');
        img.src = evt.target.result;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        const preview = document.getElementById('coverPreview');
        preview.innerHTML = '';
        preview.appendChild(img);
        if (coverCropper) coverCropper.destroy();
        coverCropper = new Cropper(img, {
            aspectRatio: 16/9,
            viewMode: 1,
            autoCropArea: 1,
            movable: true,
            zoomable: true,
            scalable: true,
            cropBoxResizable: true
        });
        document.getElementById('cropCoverBtn').disabled = false;
    };
    reader.readAsDataURL(file);
});
document.getElementById('cropCoverBtn').addEventListener('click', function() {
    if (!coverCropper) return;
    coverCropper.getCroppedCanvas({ width: 1280, height: 720 }).toBlob(function(blob) {
        coverBlob = blob;
        const url = URL.createObjectURL(blob);
        document.getElementById('coverPreview').innerHTML = `<img src="${url}" style="width:100%;max-width:300px;">`;
    }, 'image/webp');
});
// Gallery logic

document.getElementById('galleryPhotos').addEventListener('change', function(e) {
    const files = Array.from(e.target.files).slice(0, 4 - galleryFiles.length);
    files.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            galleryFiles.push(file);
            galleryDataUrls.push(evt.target.result);
            renderGalleryPreview();
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
});
function renderGalleryPreview() {
    const preview = document.getElementById('galleryPreview');
    preview.innerHTML = '';
    galleryDataUrls.forEach((dataUrl, idx) => {
        const card = document.createElement('div');
        card.className = 'card me-2 mb-2';
        card.style.width = '120px';
        card.innerHTML = `
            <img src="${dataUrl}" class="card-img-top" style="height:80px;object-fit:cover;">
            <div class="card-body p-2">
                <button type="button" class="btn btn-sm btn-danger w-100" data-idx="${idx}">Remove</button>
            </div>
        `;
        preview.appendChild(card);
    });
    preview.querySelectorAll('button[data-idx]').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            galleryFiles.splice(idx, 1);
            galleryDataUrls.splice(idx, 1);
            renderGalleryPreview();
        });
    });
}

// Auth and load user data
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        redirectToLogin();
        return;
    }
    // Find Firestore doc by email
    const q = await getDoc(doc(db, 'clients', user.uid));
    if (!q.exists()) {
        document.getElementById('status').textContent = 'No account data found.';
        return;
    }
    userDocId = user.uid;
    const data = q.data();
    // Pre-fill form
    document.getElementById('fullName').value = data.fullName || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('jobRole').value = data.jobRole || '';
    document.getElementById('company').value = data.company || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('business_phone').value = data.businessPhone || '';
    document.getElementById('whatsapp').value = data.whatsapp || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('school').value = data.school || '';
    document.getElementById('website').value = data.website || '';
    document.getElementById('shortBio').value = data.shortBio || '';
    // Avatar preview
    if (data.avatarUrl) {
        document.getElementById('avatarPreview').innerHTML = `<img src="${data.avatarUrl}" style="width:100%;max-width:200px;">`;
    }
    if (data.coverPhotoUrl) {
        document.getElementById('coverPreview').innerHTML = `<img src="${data.coverPhotoUrl}" style="width:100%;max-width:300px;">`;
    }
    if (Array.isArray(data.galleryUrls)) {
        galleryDataUrls = [...data.galleryUrls];
        renderGalleryPreview();
    }
});

// Save changes

document.getElementById('editAccountForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Saving changes...';
    let avatarUrl = null, coverPhotoUrl = null, galleryUrls = [];
    // Upload avatar if changed
    if (avatarBlob) {
        const avatarFormData = new FormData();
        avatarFormData.append('file', avatarBlob, 'avatar.webp');
        avatarFormData.append('upload_preset', unsignedUploadPreset);
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: avatarFormData
        });
        const cloudinaryData = await cloudinaryRes.json();
        if (!cloudinaryData.secure_url) {
            statusDiv.textContent = 'Avatar upload failed.';
            return;
        }
        avatarUrl = cloudinaryData.secure_url;
    }
    // Upload cover if changed
    if (coverBlob) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverBlob, 'cover.webp');
        coverFormData.append('upload_preset', unsignedUploadPreset);
        const coverRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: coverFormData
        });
        const coverData = await coverRes.json();
        if (!coverData.secure_url) {
            statusDiv.textContent = 'Cover photo upload failed.';
            return;
        }
        coverPhotoUrl = coverData.secure_url;
    }
    // Upload gallery if changed
    for (let i = 0; i < galleryDataUrls.length; i++) {
        const url = galleryDataUrls[i];
        if (url.startsWith('http')) {
            galleryUrls.push(url);
        } else {
            const webpBlob = await dataUrlToWebpBlob(url);
            const formData = new FormData();
            formData.append('file', webpBlob, 'gallery' + (i+1) + '.webp');
            formData.append('upload_preset', unsignedUploadPreset);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!data.secure_url) {
                statusDiv.textContent = 'Gallery photo upload failed.';
                return;
            }
            galleryUrls.push(data.secure_url);
        }
    }
    // Prepare update data
    const updateData = {
        fullName: document.getElementById('fullName').value,
        jobRole: document.getElementById('jobRole').value,
        company: document.getElementById('company').value,
        phone: document.getElementById('phone').value,
        businessPhone: document.getElementById('business_phone').value,
        whatsapp: document.getElementById('whatsapp').value,
        address: document.getElementById('address').value,
        school: document.getElementById('school').value,
        website: document.getElementById('website').value,
        shortBio: document.getElementById('shortBio').value,
        galleryUrls: galleryUrls
    };
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (coverPhotoUrl) updateData.coverPhotoUrl = coverPhotoUrl;
    try {
        await updateDoc(doc(db, 'clients', userDocId), updateData);
        statusDiv.textContent = 'Account updated successfully!';
    } catch (err) {
        statusDiv.textContent = 'Error updating account: ' + err.message;
    }
});
