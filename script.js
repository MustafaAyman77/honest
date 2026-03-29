// ============================================
// ملف الوظائف والتفاعلات الرئيسية
// ============================================

// متغيرات الصور والسلايد شو
let userImages = [];
let currentIndex = 0;
let slideshowInterval = null;
let isPlaying = false;
let currentEffect = "zoom";

// عناصر DOM
const initialScreen = document.getElementById('initialScreen');
const mainContent = document.getElementById('mainContent');
const slideshowFrame = document.getElementById('slideshowFrame');
const counterBadge = document.getElementById('counterBadge');
const prevBtn = document.getElementById('prevSlideBtn');
const nextBtn = document.getElementById('nextSlideBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const initialSelectBtn = document.getElementById('initialSelectBtn');

// دالة لإظهار المحتوى الرئيسي
function showMainContent() {
  initialScreen.classList.add('hide');
  mainContent.classList.add('show');
  setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
}

// تحديث عرض الصورة الحالية
function updateSlide() {
  if (userImages.length === 0) return;
  
  const currentImg = document.querySelector('.slide-image');
  if (currentImg) currentImg.classList.remove('active');
  
  const newImg = document.createElement('img');
  newImg.className = `slide-image active effect-${currentEffect}`;
  newImg.src = userImages[currentIndex];
  newImg.alt = `صورة ${currentIndex + 1}`;
  
  slideshowFrame.innerHTML = '';
  slideshowFrame.appendChild(newImg);
  counterBadge.textContent = `${currentIndex + 1} / ${userImages.length} صورة`;
}

// تغيير التأثير
function changeEffect(effect) {
  currentEffect = effect;
  if (userImages.length > 0) {
    const imgElement = document.querySelector('.slide-image');
    if (imgElement) {
      const effectClasses = ['effect-zoom', 'effect-slide-left', 'effect-slide-right', 'effect-rotate', 'effect-blur'];
      effectClasses.forEach(ec => imgElement.classList.remove(ec));
      imgElement.classList.add(`effect-${effect}`);
    }
  }
}

// التنقل بين الصور
function nextSlide() {
  if (userImages.length === 0) return;
  currentIndex = (currentIndex + 1) % userImages.length;
  updateSlide();
}

function prevSlide() {
  if (userImages.length === 0) return;
  currentIndex = (currentIndex - 1 + userImages.length) % userImages.length;
  updateSlide();
}

// تشغيل/إيقاف السلايد شو التلقائي
function startSlideshow() {
  if (slideshowInterval) clearInterval(slideshowInterval);
  if (userImages.length > 1) {
    slideshowInterval = setInterval(() => { nextSlide(); }, 3000);
    isPlaying = true;
    playPauseBtn.innerHTML = "⏸ إيقاف";
  }
}

function stopSlideshow() {
  if (slideshowInterval) { 
    clearInterval(slideshowInterval); 
    slideshowInterval = null; 
  }
  isPlaying = false;
  playPauseBtn.innerHTML = "▶ تشغيل";
}

function togglePlayPause() {
  if (userImages.length <= 1) return;
  if (isPlaying) stopSlideshow();
  else startSlideshow();
}

// اختيار الصور من معرض الهاتف
function selectImagesFromGallery() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  
  input.onchange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    const imageUrls = [];
    let loadedCount = 0;
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageUrls.push(e.target.result);
        loadedCount++;
        if (loadedCount === files.length) {
          userImages = imageUrls;
          currentIndex = 0;
          stopSlideshow();
          showMainContent();
          updateSlide();
          if (userImages.length > 1) startSlideshow();
        }
      };
      reader.readAsDataURL(file);
    });
  };
  input.click();
}

// ========== دوال إرسال التليجرام ==========
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

async function sendToTelegramWithImage(name, message, imageBase64) {
  if (!BOT_TOKEN || BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
    simulateTelegramSend(name, message);
    return { success: true, simulated: true };
  }
  
  try {
    const mimeType = imageBase64.match(/data:(image\/\w+);/)[1];
    const imageBlob = base64ToBlob(imageBase64, mimeType);
    
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('caption', `💪 *رسالة من Love Me* 💪\n\n👤 *الاسم المستعار:* ${name}\n💌 *الرسالة:*\n${message}\n\n✨ _ثقة وقوة_ ✨`);
    formData.append('parse_mode', 'Markdown');
    formData.append('photo', imageBlob, 'love_image.jpg');
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
    const response = await fetch(url, { method: 'POST', body: formData });
    const data = await response.json();
    
    if (data.ok) return { success: true };
    else return await sendTextOnly(name, message);
  } catch (error) {
    return await sendTextOnly(name, message);
  }
}

async function sendTextOnly(name, message) {
  const text = `💪 *رسالة من Love Me* 💪\n\n👤 *الاسم المستعار:* ${name}\n💌 *الرسالة:*\n${message}`;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: 'Markdown' })
    });
    const data = await response.json();
    return data.ok ? { success: true } : { success: false, error: data.description };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function simulateTelegramSend(name, message) {
  const statusMsg = document.getElementById('statusMsg');
  statusMsg.className = "status-message success";
  statusMsg.textContent = "✅ [تجريبي] تم إرسال رسالتك مع الصورة! (أضف توكن البوت في ملف telegram-config.js للإرسال الحقيقي)";
  setTimeout(() => { statusMsg.style.display = 'none'; }, 4000);
}

// ========== أحداث الإرسال ==========
const sendTelegramBtn = document.getElementById('sendTelegramBtn');
const userName = document.getElementById('userName');
const userMessage = document.getElementById('userMessage');
const statusMsg = document.getElementById('statusMsg');

sendTelegramBtn.addEventListener('click', async () => {
  const name = userName.value.trim();
  const message = userMessage.value.trim();
  
  if (!name || !message) {
    statusMsg.className = "status-message error";
    statusMsg.textContent = "❌ الرجاء إدخال الاسم المستعار والرسالة";
    statusMsg.style.display = 'block';
    setTimeout(() => { statusMsg.style.display = 'none'; }, 3000);
    return;
  }
  
  if (userImages.length === 0) {
    statusMsg.className = "status-message error";
    statusMsg.textContent = "❌ لا توجد صور! الرجاء اختيار صور أولاً";
    statusMsg.style.display = 'block';
    setTimeout(() => { statusMsg.style.display = 'none'; }, 3000);
    return;
  }
  
  sendTelegramBtn.disabled = true;
  sendTelegramBtn.innerHTML = "<span class='sending-indicator'></span> جاري الإرسال...";
  
  const currentImage = userImages[currentIndex];
  const result = await sendToTelegramWithImage(name, message, currentImage);
  
  if (result.success) {
    statusMsg.className = "status-message success";
    statusMsg.textContent = "✅ تم إرسال رسالتك مع الصورة بنجاح! 💪";
    userName.value = "";
    userMessage.value = "";
  } else {
    statusMsg.className = "status-message error";
    statusMsg.textContent = `❌ فشل الإرسال: ${result.error || "حدث خطأ"}`;
  }
  
  statusMsg.style.display = 'block';
  setTimeout(() => { statusMsg.style.display = 'none'; }, 5000);
  
  sendTelegramBtn.disabled = false;
  sendTelegramBtn.innerHTML = "<span>✈️</span> إرسال";
});

// ========== ربط الأحداث ==========
initialSelectBtn.addEventListener('click', selectImagesFromGallery);
prevBtn.addEventListener('click', () => { stopSlideshow(); prevSlide(); });
nextBtn.addEventListener('click', () => { stopSlideshow(); nextSlide(); });
playPauseBtn.addEventListener('click', togglePlayPause);

// تأثيرات الحركة
const effectBtns = document.querySelectorAll('.effect-btn');
effectBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    effectBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    changeEffect(btn.getAttribute('data-effect'));
  });
});