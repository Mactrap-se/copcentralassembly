let lang = localStorage.getItem('lang') || 'en';

const dict = {
    en: {
        service: "📖 Sunday Service Order",
        preacher: "Head Pastor:",
        theme: "Theme:",
        prayerTitle: "🙏 Prayer Request",
        prayerBtn: "Submit / Fa Kɔ",
        admin: "Admin Login",
        sunday: "Sunday School / Kwasiada Sukuu",
        main: "Main Service / Som Kɛseɛ",
        langBtn: "TWI"
    },
    twi: {
        service: "📖 Kwasiada Som Nhyehyɛeɛ",
        preacher: "Ɔsɛnkafoɔ:",
        theme: "Asɛmti:",
        prayerTitle: "🙏 Mpaebɔ",
        prayerBtn: "Fa Kɔ / Submit",
        admin: "Pastor Kɔ Mu",
        sunday: "Kwasiada Sukuu / Sunday School",
        main: "Som Kɛseɛ / Main Service",
        langBtn: "ENGLISH"
    }
};

function toggleLang() {
    lang = (lang === 'en') ? 'twi' : 'en';
    localStorage.setItem('lang', lang);
    applyLang();
}

function applyLang() {
    let d = dict[lang];
    document.getElementById('txtService').innerText = d.service;
    document.getElementById('txtPreacher').innerText = d.preacher;
    document.getElementById('txtPrayerTitle').innerText = d.prayerTitle;
    document.getElementById('txtPrayerBtn').innerText = d.prayerBtn;
    document.getElementById('txtAdmin').innerText = d.admin;
    document.getElementById('langBtn').innerText = d.langBtn;
    
    let t1 = document.querySelector('.t1');
    let t2 = document.querySelector('.t2');
    if (t1) t1.innerText = d.sunday;
    if (t2) t2.innerText = d.main;
}

// Load user announcements from storage (no sample defaults)
let announcements = JSON.parse(localStorage.getItem('cop_dzefe') || '[]');

function render() {
    let list = document.getElementById('announcementsList');
    list.innerHTML = '<div style="padding:0 12px"><h3>📢 Announcements / Nkaebɔ</h3></div>';
    
    if (announcements.length === 0) {
        list.innerHTML += '<div class="card"><p style="color:gray; text-align:center;">No announcements available.</p></div>';
    } else {
        announcements.slice().reverse().forEach(a => {
            list.innerHTML += `
                <div class="card">
                    <div style="color:#D50000; font-size:12px; font-weight:bold">📅 ${a.date}</div>
                    <div style="font-weight:bold; font-size:17px; margin:6px 0">${a.title}</div>
                    <p>${a.desc}</p>
                </div>`;
        });
    }
    
    document.getElementById('todayDate').innerText = new Date().toDateString();
    renderAdminManageList();
}

// Render delete list inside the Pastor Panel
function renderAdminManageList() {
    let manageList = document.getElementById('adminManageList');
    if (!manageList) return;
    manageList.innerHTML = '';

    if (announcements.length === 0) {
        manageList.innerHTML = '<p style="font-size:12px; color:gray;">No posts to manage.</p>';
        return;
    }

    announcements.forEach((a, index) => {
        manageList.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:8px; margin:5px 0; border:1px solid #ddd; border-radius:4px;">
                <div>
                    <strong style="font-size:13px;">${a.title}</strong>
                    <div style="font-size:11px; color:gray;">📅 ${a.date}</div>
                </div>
                <button onclick="deleteAnnouncement(${index})" style="background:#d32f2f; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:12px;">Delete</button>
            </div>`;
    });
}

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxlrCc55vVvBpXVL-pvOR0StBN8ttc-eKBQpPcf-TrDTNEUplKB9GSZMhBAe2A6lhx1ug/exec";

async function backupToSheet(data) {
    if (GOOGLE_SHEET_URL.includes("YOUR_ID")) return;
    try {
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(data)
        });
    } catch (e) {}
}

function addAnnouncement() {
    if (document.getElementById('adminPass').value !== 'Ghanson2026') {
        alert('Wrong password!');
        return;
    }
    
    let title = document.getElementById('aTitle').value;
    let desc = document.getElementById('aDesc').value;
    let date = document.getElementById('aDate').value || new Date().toISOString().split('T')[0];
    
    if (!title || !desc) {
        alert('Fill all fields');
        return;
    }
    
    let newAnn = { title, desc, date };
    announcements.push(newAnn);
    localStorage.setItem('cop_dzefe', JSON.stringify(announcements));
    
    // Clear form inputs
    document.getElementById('aTitle').value = '';
    document.getElementById('aDesc').value = '';
    document.getElementById('aDate').value = '';

    render();
    
    if (document.getElementById('backupOpt').value === 'sheet') {
        backupToSheet(newAnn);
    }
    
    alert('Posted successfully! ✅');
}

function deleteAnnouncement(index) {
    if (document.getElementById('adminPass').value !== 'Ghanson2026') {
        alert('Please enter the correct Pastor password above first!');
        return;
    }

    if (confirm('Are you sure you want to delete this announcement?')) {
        announcements.splice(index, 1);
        localStorage.setItem('cop_dzefe', JSON.stringify(announcements));
        render();
        alert('Deleted! 🗑️');
    }
}

function showAdmin() {
    let b = document.getElementById('adminBox');
    b.style.display = b.style.display === 'block' ? 'none' : 'block';
}

function sendPrayer() {
    let name = document.getElementById('pName').value;
    let req = document.getElementById('pRequest').value;
    
    if (!req) {
        alert('Write request');
        return;
    }
    
    let prayers = JSON.parse(localStorage.getItem('prayers_dzefe') || '[]');
    prayers.push({ name, req, date: new Date().toLocaleString() });
    localStorage.setItem('prayers_dzefe', JSON.stringify(prayers));
    
    backupToSheet({ type: 'prayer', name, req });
    window.open(`https://wa.me/godsgrace4?text=${encodeURIComponent('Prayer: ' + name + ' - ' + req)}`);
    alert('Saved 🙏 / Wɔakora so 🙏');
}

// Initialize on page load
applyLang();
render();