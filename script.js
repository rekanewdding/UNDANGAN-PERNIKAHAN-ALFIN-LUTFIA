// ===== CONFIGURATION =====
// Web App URL dari Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbzoDhXGAdMzal4imQjU9Z-vilJr86wGvnyWR1pDBqz7B1ccWu_VexRKCeCUE8ue99lq/exec';

// ===== DOM ELEMENTS =====
const coverScreen = document.getElementById('coverScreen');
const openBtn = document.getElementById('openInvitation');
const mainContent = document.getElementById('mainContent');
const bgMusic = document.getElementById('bgMusic');
const musicIcon = document.getElementById('toggleMusic');
const musicPlayer = document.getElementById('musicPlayer');
const floatingNav = document.getElementById('floatingNav');
const navDots = document.querySelectorAll('.nav-dot');
const sections = document.querySelectorAll('.section');
const toastContainer = document.getElementById('toastContainer');

// ===== COVER SCREEN =====
document.addEventListener('DOMContentLoaded', function() {
    const coverSampul = coverScreen.getAttribute('data-sampul');
    if (coverSampul) {
        coverScreen.style.backgroundImage = `url('${coverSampul}')`;
    }
    
    mainContent.style.display = 'none';
    document.body.style.overflow = 'hidden';
    initParticles();
    loadMessagesFromServer();
});

// ===== OPEN INVITATION =====
openBtn.addEventListener('click', function() {
    coverScreen.classList.add('hidden');
    
    setTimeout(() => {
        mainContent.style.display = 'block';
        setTimeout(() => {
            mainContent.classList.add('visible');
        }, 50);
        
        document.body.style.overflow = 'auto';
        musicPlayer.classList.add('visible');
        floatingNav.classList.add('visible');
        
        bgMusic.play().catch(error => {
            console.log('Autoplay prevented:', error);
        });
        
        setTimeout(() => {
            initScrollReveal();
            updateActiveNav();
        }, 500);
    }, 800);
});

// ===== MUSIC PLAYER =====
let isPlaying = true;

musicIcon.addEventListener('click', function() {
    if (isPlaying) {
        bgMusic.pause();
        musicIcon.classList.remove('playing');
    } else {
        bgMusic.play();
        musicIcon.classList.add('playing');
    }
    isPlaying = !isPlaying;
});

// ===== COUNTDOWN TIMER =====
function updateCountdown() {
    const targetDate = new Date('2026-06-07T08:00:00+07:00').getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    animateNumber('days', days);
    animateNumber('hours', hours);
    animateNumber('minutes', minutes);
    animateNumber('seconds', seconds);
}

function animateNumber(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const oldValue = parseInt(element.textContent);
    
    if (oldValue !== newValue) {
        element.classList.add('change');
        element.textContent = newValue.toString().padStart(2, '0');
        setTimeout(() => {
            element.classList.remove('change');
        }, 300);
    } else {
        element.textContent = newValue.toString().padStart(2, '0');
    }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ===== PARTICLES BACKGROUND =====
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 50, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#C0A86A" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3, "random": true },
                "size": { "value": 4, "random": true },
                "line_linked": { "enable": false },
                "move": { "enable": true, "speed": 2, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "bubble" }, "onclick": { "enable": true, "mode": "repulse" } },
                "modes": { "bubble": { "distance": 200, "size": 6, "duration": 2 }, "repulse": { "distance": 200 } }
            },
            "retina_detect": true
        });
    }
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const reveals = document.querySelectorAll('.section-header, .couple-card, .event-card, .gallery-item, .closing-card, .guestbook-form, .gift-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
            }
        });
    }, { threshold: 0.2 });
    
    reveals.forEach(reveal => {
        reveal.style.opacity = '0';
        reveal.style.transform = 'translateY(30px)';
        reveal.style.transition = 'all 0.8s ease';
        observer.observe(reveal);
    });
}

// ===== ACTIVE NAVIGATION =====
function updateActiveNav() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 200;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navDots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.getAttribute('data-section') === currentSection) {
            dot.classList.add('active');
        }
    });
}

navDots.forEach(dot => {
    dot.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

window.addEventListener('scroll', updateActiveNav);

// ===== GUESTBOOK WITH GOOGLE SHEETS =====
const guestbookForm = document.getElementById('guestbookForm');
const messagesContainer = document.getElementById('messagesContainer');

// Load messages dari server
async function loadMessagesFromServer() {
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin gold-text"></i> Loading ucapan...</div>';
    
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success && data.messages.length > 0) {
            let html = '';
            data.messages.forEach(msg => {
                const date = new Date(msg.timestamp).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                
                html += `
                    <div class="message-item">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="message-name">${escapeHtml(msg.name)}</span>
                            <span class="message-date">${date}</span>
                        </div>
                        <p class="message-content mb-2">${escapeHtml(msg.message)}</p>
                        ${msg.attendance === 'Hadir' ? '<span class="message-attendance"><i class="fas fa-calendar-check me-1"></i>Akan Hadir</span>' : ''}
                    </div>
                `;
            });
            messagesContainer.innerHTML = html;
        } else {
            messagesContainer.innerHTML = '<p class="text-center text-muted py-4">Belum ada ucapan. Jadilah yang pertama!</p>';
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = '<p class="text-center text-danger py-4">Gagal memuat ucapan. Silakan refresh halaman.</p>';
    }
}

// Save message ke server
async function saveMessageToServer(name, message, attendance) {
    const formData = new URLSearchParams();
    formData.append('action', 'save');
    formData.append('name', name);
    formData.append('message', message);
    formData.append('attendance', attendance);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving message:', error);
        return { success: false, error: 'Gagal menyimpan pesan' };
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle form submit
if (guestbookForm) {
    guestbookForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('guestName').value.trim();
        const message = document.getElementById('guestMessage').value.trim();
        const attendanceSelect = document.getElementById('guestAttendance');
        const attendance = attendanceSelect.value;
        
        if (!name || !message || !attendance) {
            showToast('Mohon lengkapi semua field', 'error');
            return;
        }
        
        const submitBtn = guestbookForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Menyimpan...';
        submitBtn.disabled = true;
        
        const result = await saveMessageToServer(name, message, attendance);
        
        if (result.success) {
            guestbookForm.reset();
            await loadMessagesFromServer();
            showToast('Ucapan berhasil dikirim! Terima kasih 🙏', 'success');
        } else {
            showToast(result.error || 'Gagal mengirim ucapan', 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification mb-2 ${type}`;
    toast.innerHTML = `<div class="d-flex align-items-center"><i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i><span>${escapeHtml(message)}</span></div>`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// ===== GIFT FUNCTIONS =====
window.copyBank = function(buttonElement) {
    let bankNumber = '';
    let currentElement = buttonElement.nextElementSibling;
    
    while (currentElement) {
        if (currentElement.classList && currentElement.classList.contains('bank-number')) {
            bankNumber = currentElement.textContent.trim();
            break;
        }
        currentElement = currentElement.nextElementSibling;
    }
    
    if (bankNumber) {
        navigator.clipboard.writeText(bankNumber).then(() => {
            showToast('Nomor rekening berhasil disalin!', 'success');
        }).catch(() => {
            showToast('Gagal menyalin nomor rekening', 'error');
        });
    } else {
        showToast('Nomor rekening tidak ditemukan', 'error');
    }
};

window.showAddress = function() {
    const addressBox = document.getElementById('addressBox');
    if (addressBox.style.display === 'none' || addressBox.style.display === '') {
        addressBox.style.display = 'block';
        addressBox.style.animation = 'fadeInUp 0.5s ease';
    } else {
        addressBox.style.display = 'none';
    }
};

// ===== PRELOAD IMAGES =====
const images = document.querySelectorAll('img[src]');
images.forEach(img => {
    if (img.src && !img.complete) {
        img.style.opacity = '0';
        img.onload = function() {
            this.style.transition = 'opacity 0.5s ease';
            this.style.opacity = '1';
        };
    }
});