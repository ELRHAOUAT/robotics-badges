// 1. إعدادات اللغة الافتراضية
let currentLang = 'ar';

// قاموس الكلمات الثابتة في الموقع
const translations = {
    ar: {
        idea: "الفكرة العامة للمشروع 💡",
        gallery: "التوثيق الميداني 📸",
        notFound: "مهندس غير موجود",
        notFoundDesc: "لم يتم العثور على بيانات هذا المهندس في قاعدة البيانات.",
        error: "حدث خطأ أثناء تحميل البيانات.",
        noImages: "لم يتم إضافة صور توثيقية ميدانية بعد.",
        download: "حفظ كملف PDF"
    },
    fr: {
        idea: "Idée Générale du Projet 💡",
        gallery: "Documentation sur le Terrain 📸",
        notFound: "Ingénieur introuvable",
        notFoundDesc: "Les données de cet ingénieur n'ont pas été trouvées.",
        error: "Erreur de chargement des données.",
        noImages: "Aucune photo sur le terrain n'a encore été ajoutée.",
        download: "Télécharger en PDF"
    },
    en: {
        idea: "General Project Idea 💡",
        gallery: "Field Documentation 📸",
        notFound: "Engineer not found",
        notFoundDesc: "Data for this engineer was not found.",
        error: "Error loading data.",
        noImages: "No field photos have been added yet.",
        download: "Download as PDF"
    }
};

// 2. جلب المعرف (ID) من رابط الصفحة
const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('id');
const photoEl = document.getElementById('student-photo');
const nameEl = document.getElementById('student-name');
const roleEl = document.getElementById('student-role');
const projectEl = document.getElementById('project-name');
const descEl = document.getElementById('project-desc');
const galleryEl = document.getElementById('gallery-container');

// دالة تغيير اللغة
function changeLanguage(lang) {
    currentLang = lang;

    // تغيير لون الزر النشط
    document.querySelectorAll('.lang-switcher button').forEach(btn => btn.classList.remove('active'));
    if(document.getElementById('btn-' + lang)) {
        document.getElementById('btn-' + lang).classList.add('active');
    }

    // تغيير اتجاه الصفحة (RTL / LTR)
    if (lang === 'ar') {
        document.body.setAttribute('dir', 'rtl');
    } else {
        document.body.setAttribute('dir', 'ltr');
    }

    // ترجمة النصوص الثابتة
    if(document.getElementById('title-idea')) document.getElementById('title-idea').innerHTML = translations[lang].idea;
    if(document.getElementById('title-gallery')) document.getElementById('title-gallery').innerHTML = translations[lang].gallery;
    if(document.getElementById('download-pdf')) document.getElementById('download-pdf').innerHTML = translations[lang].download;

    // إعادة تحميل بيانات التلميذ باش تترجم حتى هي
    loadStudentData();
}

// 3. الدالة الرئيسية لجلب البيانات وعرضها
async function loadStudentData() {
    if (!studentId) {
        nameEl.textContent = translations[currentLang].error;
        descEl.textContent = "يرجى التأكد من مسح رمز الاستجابة السريعة (QR Code) الصحيح.";
        projectEl.textContent = "---";
        roleEl.textContent = "---";
        return;
    }

    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const student = data.students.find(s => s.id === studentId);

        if (student) {
            // التحقق الذكي: إذا كانت القيمة عبارة عن كائن (Object) فيه لغات، نجلب اللغة الحالية، وإلا نعرض النص كما هو (عربي)
            nameEl.textContent = typeof student.name === 'object' ? student.name[currentLang] : student.name;
            roleEl.textContent = typeof student.role === 'object' ? student.role[currentLang] : student.role;
            projectEl.textContent = typeof student.project === 'object' ? student.project[currentLang] : student.project;
            descEl.textContent = typeof student.description === 'object' ? student.description[currentLang] : student.description;
            
            if (student.profile_pic) {
                photoEl.src = student.profile_pic;
            } else {
                photoEl.src = 'assets/images/default-avatar.png'; 
            }

            galleryEl.innerHTML = ''; 
            
            if (student.gallery && student.gallery.length > 0) {
                student.gallery.forEach(imgSrc => {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.loading = 'lazy';
                    img.alt = `صورة توثيقية`;
                    
                    img.addEventListener('click', () => {
                        openModal(imgSrc);
                    });

                    galleryEl.appendChild(img);
                });
            } else {
                galleryEl.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #999; font-size: 0.9rem;">${translations[currentLang].noImages}</p>`;
            }
        } else {
            nameEl.textContent = translations[currentLang].notFound;
            descEl.textContent = translations[currentLang].notFoundDesc;
            projectEl.textContent = "---";
            roleEl.textContent = "---";
        }
    } catch (error) {
        console.error("خطأ:", error);
        descEl.textContent = translations[currentLang].error;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    changeLanguage('ar'); // تفعيل العربية كافتراضية عند فتح الصفحة
});

// =========================================
// 5. برمجة زر تحميل PDF
// =========================================
const downloadBtn = document.getElementById('download-pdf');
if(downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const badgeElement = document.querySelector('.badge-container');
        downloadBtn.style.display = 'none';
        
        // إخفاء أزرار اللغة قبل الطباعة
        const langSwitcher = document.querySelector('.lang-switcher');
        if(langSwitcher) langSwitcher.style.display = 'none';

        const studentNameForFile = nameEl.textContent !== '--' ? nameEl.textContent : 'مهندس';
        
        const opt = {
            margin:       0.2,
            filename:     `البطاقة-المهنية-${studentNameForFile}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a5', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(badgeElement).save().then(() => {
            downloadBtn.style.display = 'block';
            if(langSwitcher) langSwitcher.style.display = 'flex'; // إرجاع أزرار اللغة بعد التحميل
        });
    });
}

// =========================================
// 6. برمجة نافذة عرض الصور (Lightbox)
// =========================================
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('expanded-img');
const closeBtn = document.getElementsByClassName('close-modal')[0];

function openModal(imageSrc) {
    if(modal && modalImg) {
        modal.style.display = 'block';
        modalImg.src = imageSrc;
    }
}

if(closeBtn) {
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && modal && modal.style.display === "block") {
        modal.style.display = 'none';
    }
});