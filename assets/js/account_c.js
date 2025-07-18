import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
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
const db = getFirestore(app);

// Cloudinary config (replace with your own)
const cloudName = 'dffhwv0m1'; // TODO: Replace
const unsignedUploadPreset = 'avatars'; // TODO: Replace

let avatarCropper, coverCropper, avatarBlob, coverBlob;

// Avatar Cropper
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
        // Show preview
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
        // Show preview
        const url = URL.createObjectURL(blob);
        document.getElementById('coverPreview').innerHTML = `<img src="${url}" style="width:100%;max-width:300px;">`;
    }, 'image/webp');
});

// Add dynamic add-more logic for all social media
const addMoreConfigs = [
    { btn: 'addFacebookBtn', container: 'facebookContainer', className: 'facebook-input', labelClass: 'facebook-label-input', placeholder: 'Additional Facebook URL', labelPlaceholder: 'Description (e.g. personal, business page)' },
    { btn: 'addInstagramBtn', container: 'instagramContainer', className: 'instagram-input', labelClass: 'instagram-label-input', placeholder: 'Additional Instagram URL', labelPlaceholder: 'Description (e.g. personal, business)' },
    { btn: 'addTikTokBtn', container: 'tiktokContainer', className: 'tiktok-input', labelClass: 'tiktok-label-input', placeholder: 'Additional TikTok URL', labelPlaceholder: 'Description (e.g. personal, business)' },
    { btn: 'addLinkedInBtn', container: 'linkedinContainer', className: 'linkedin-input', labelClass: 'linkedin-label-input', placeholder: 'Additional LinkedIn URL', labelPlaceholder: 'Description (e.g. personal, business)' },
    { btn: 'addTwitterBtn', container: 'twitterContainer', className: 'twitter-input', labelClass: 'twitter-label-input', placeholder: 'Additional Twitter URL', labelPlaceholder: 'Description (e.g. personal, business)' },
    { btn: 'addYouTubeBtn', container: 'youtubeContainer', className: 'youtube-input', labelClass: 'youtube-label-input', placeholder: 'Additional YouTube URL', labelPlaceholder: 'Description (e.g. channel, business)' },
    { btn: 'addBehanceBtn', container: 'behanceContainer', className: 'behance-input', labelClass: 'behance-label-input', placeholder: 'Additional Behance URL', labelPlaceholder: 'Description (e.g. portfolio, business)' },
    { btn: 'addGitHubBtn', container: 'githubContainer', className: 'github-input', labelClass: 'github-label-input', placeholder: 'Additional GitHub URL', labelPlaceholder: 'Description (e.g. personal, work)' }
];
addMoreConfigs.forEach(cfg => {
    document.getElementById(cfg.btn).addEventListener('click', function() {
        const wrapper = document.createElement('div');
        wrapper.className = 'mt-2';
        const newInput = document.createElement('input');
        newInput.type = 'url';
        newInput.className = 'form-control ' + cfg.className;
        newInput.name = cfg.className.replace('-input', '');
        newInput.placeholder = cfg.placeholder;
        const newLabelInput = document.createElement('input');
        newLabelInput.type = 'text';
        newLabelInput.className = 'form-control mt-1 ' + cfg.labelClass;
        newLabelInput.name = cfg.labelClass.replace('-label-input', 'Label');
        newLabelInput.placeholder = cfg.labelPlaceholder;
        wrapper.appendChild(newInput);
        wrapper.appendChild(newLabelInput);
        document.getElementById(cfg.container).appendChild(wrapper);
    });
});

document.getElementById('addExperienceBtn').addEventListener('click', function() {
    const container = document.getElementById('experienceContainer');
    const row = document.createElement('div');
    row.className = 'row mt-2';
    row.innerHTML = `
        <div class="col-md-6">
            <input type="text" class="form-control exp-company" placeholder="Company Name" required>
        </div>
        <div class="col-md-6">
            <input type="text" class="form-control exp-jobrole" placeholder="Job Role" required>
        </div>
    `;
    container.appendChild(row);
});

let galleryFiles = [];
let galleryDataUrls = [];

document.getElementById('galleryPhotos').addEventListener('change', function(e) {
    const files = Array.from(e.target.files).slice(0, 4 - galleryFiles.length); // Only allow up to 4
    files.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = function(evt) {
            galleryFiles.push(file);
            galleryDataUrls.push(evt.target.result);
            renderGalleryPreview();
        };
        reader.readAsDataURL(file);
    });
    // Reset the input so the same file can be selected again if removed
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

    // Add remove event listeners
    preview.querySelectorAll('button[data-idx]').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            galleryFiles.splice(idx, 1);
            galleryDataUrls.splice(idx, 1);
            renderGalleryPreview();
        });
    });
}

function dataUrlToWebpBlob(dataUrl, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            // Resize if needed
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

async function sendSMS(recipient, message) {
    try {
        const response = await fetch("https://app.text.lk/api/v3/sms/send", {
            method: "POST",
            headers: {
                "Authorization": "Bearer 480|odAdq3m8YXQE7aGUzZCwS6fBychoBQk14xoWWywp9063231f", // Replace with your actual API Key
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                recipient: recipient,
                sender_id: "Imagini", // Change this to your sender ID
                type: "plain",
                message: message
            })
        });
        const data = await response.json();
        if (data.status === "success" || data.status === true) {
            return true;
        } else {
            throw new Error(data.message || "Failed to send SMS");
        }
    } catch (error) {
        console.error("SMS Error:", error);
        return false;
    }
}

document.getElementById('clientForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Creating authentication account...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Create user in Firebase Auth
    const auth = getAuth();
    let userCredential;
    try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
        statusDiv.textContent = 'Error creating authentication account: ' + err.message;
        return;
    }

    statusDiv.textContent = 'Uploading avatar...';
    // Upload avatar to Cloudinary
    if (!avatarBlob) {
        statusDiv.textContent = 'Please crop and preview the avatar image.';
        return;
    }
    if (!coverBlob) {
        statusDiv.textContent = 'Please crop and preview the cover photo.';
        return;
    }
    const avatarFormData = new FormData();
    avatarFormData.append('file', avatarBlob, 'avatar.webp');
    avatarFormData.append('upload_preset', unsignedUploadPreset);
    let cloudinaryData, coverPhotoUrl = '';
    try {
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: avatarFormData
        });
        cloudinaryData = await cloudinaryRes.json();
        if (!cloudinaryData.secure_url) throw new Error('Cloudinary upload failed');
        // Upload cover photo
        statusDiv.textContent = 'Uploading cover photo...';
        const coverFormData = new FormData();
        coverFormData.append('file', coverBlob, 'cover.webp');
        coverFormData.append('upload_preset', unsignedUploadPreset);
        const coverRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: coverFormData
        });
        const coverData = await coverRes.json();
        if (!coverData.secure_url) throw new Error('Cover photo upload failed');
        coverPhotoUrl = coverData.secure_url;
        statusDiv.textContent = 'Uploading gallery photos...';
        let galleryUrls = [];
        for (let i = 0; i < galleryDataUrls.length; i++) {
            if (!galleryDataUrls[i]) continue;
            const webpBlob = await dataUrlToWebpBlob(galleryDataUrls[i]);
            const formData = new FormData();
            formData.append('file', webpBlob, 'gallery' + (i+1) + '.webp');
            formData.append('upload_preset', unsignedUploadPreset);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!data.secure_url) throw new Error('Gallery photo upload failed');
            galleryUrls.push(data.secure_url);
        }
        statusDiv.textContent = 'Saving data to Firestore...';
        // Collect all social media inputs as arrays of objects
        function collectSocialArray(urlClass, labelClass) {
            const urls = document.querySelectorAll('.' + urlClass);
            const labels = document.querySelectorAll('.' + labelClass);
            const arr = [];
            for (let i = 0; i < urls.length; i++) {
                if (urls[i].value) {
                    arr.push({ url: urls[i].value, label: labels[i] ? labels[i].value : '' });
                }
            }
            return arr;
        }
        const facebookArray = collectSocialArray('facebook-input', 'facebook-label-input');
        const instagramArray = collectSocialArray('instagram-input', 'instagram-label-input');
        const tiktokArray = collectSocialArray('tiktok-input', 'tiktok-label-input');
        const linkedinArray = collectSocialArray('linkedin-input', 'linkedin-label-input');
        const twitterArray = collectSocialArray('twitter-input', 'twitter-label-input');
        const youtubeArray = collectSocialArray('youtube-input', 'youtube-label-input');
        const behanceArray = collectSocialArray('behance-input', 'behance-label-input');
        const githubArray = collectSocialArray('github-input', 'github-label-input');

        // Collect all working experiences
        const experiences = [];
        // Add the original fields
        const mainCompany = document.getElementById('company').value;
        const mainJobRole = document.getElementById('jobRole').value;
        if (mainCompany && mainJobRole) {
            experiences.push({ company: mainCompany, jobRole: mainJobRole });
        }
        // Add dynamically added experiences
        const expCompanies = document.querySelectorAll('.exp-company');
        const expJobRoles = document.querySelectorAll('.exp-jobrole');
        for (let i = 0; i < expCompanies.length; i++) {
            if (expCompanies[i].value && expJobRoles[i].value) {
                experiences.push({ company: expCompanies[i].value, jobRole: expJobRoles[i].value });
            }
        }

        const data = {
            avatarUrl: cloudinaryData.secure_url,
            coverPhotoUrl: coverPhotoUrl,
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            jobRole: document.getElementById('jobRole').value,
            company: document.getElementById('company').value,
            phone: document.getElementById('phone').value,
            businessPhone: document.getElementById('business_phone').value,
            whatsapp: document.getElementById('whatsapp').value,
            address: document.getElementById('address').value,
            school: document.getElementById('school').value,
            website: document.getElementById('website').value,
            social: {
                facebook: facebookArray,
                instagram: instagramArray,
                tiktok: tiktokArray,
                linkedin: linkedinArray,
                twitter: twitterArray,
                youtube: youtubeArray,
                behance: behanceArray,
                github: githubArray
            },
            experiences: experiences,
            galleryUrls: galleryUrls
        };
        const docRef = await addDoc(collection(db, 'clients'), data);
        const phone = document.getElementById('phone').value;
        const smsMessage = `Welcome to ImaTAP,

Email : ${email}
Password : ${password}

Hotline : 077 442 9053
Whatsapp : +94 77 442 9053
Website : www.imatap.com`;
        const smsSent = await sendSMS(phone, smsMessage);
        if (smsSent) {
            statusDiv.innerHTML = 'Client account created successfully! SMS sent.<br><a href="account.html?id=' + docRef.id + '">View Account</a>';
        } else {
            statusDiv.innerHTML = 'Client account created, but failed to send SMS.<br><a href="account.html?id=' + docRef.id + '">View Account</a>';
        }
        document.getElementById('clientForm').reset();
        document.getElementById('avatarPreview').innerHTML = '';
        document.getElementById('coverPreview').innerHTML = '';
        avatarBlob = null;
        coverBlob = null;
        document.getElementById('cropAvatarBtn').disabled = true;
        document.getElementById('cropCoverBtn').disabled = true;
        document.getElementById('galleryPhotos').value = '';
        galleryFiles = [];
        galleryDataUrls = [];
        renderGalleryPreview();
    } catch (err) {
        statusDiv.textContent = 'Error: ' + err.message;
    }
});