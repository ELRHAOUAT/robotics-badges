// 1. جلب المعرف (ID) من رابط الصفحة
const urlParams = new URLSearchParams(window.location.search);
const studentId = urlParams.get('id');
const photoEl = document.getElementById('student-photo');
// 2. تحديد الأماكن في HTML اللي غادي نعمروها
const nameEl = document.getElementById('student-name');
const roleEl = document.getElementById('student-role');
const projectEl = document.getElementById('project-name');
const descEl = document.getElementById('project-desc');
const galleryEl = document.getElementById('gallery-container');

// 3. الدالة الرئيسية لجلب البيانات وعرضها
async function loadStudentData() {
    // التأكد من أن الرابط فيه ID
    if (!studentId) {
        nameEl.textContent = "خطأ: لم يتم تحديد المهندس";
        descEl.textContent = "يرجى التأكد من مسح رمز الاستجابة السريعة (QR Code) الصحيح.";
        projectEl.textContent = "---";
        roleEl.textContent = "---";
        return;
    }

    try {
        // جلب البيانات من ملف JSON
        const response = await fetch('data.json');
        const data = await response.json();

        // البحث عن التلميذ اللي عندو نفس الـ ID
        const student = data.students.find(s => s.id === studentId);

        if (student) {
            // إذا لقينا التلميذ، كنعمروا المعلومات ديالو
            nameEl.textContent = student.name;
            roleEl.textContent = student.role;
            projectEl.textContent = student.project;
            descEl.textContent = student.description;
            // --- الكود الجديد ديال الصورة الشخصية ---
            if (student.profile_pic) {
                photoEl.src = student.profile_pic;
            } else {
                // إلى نسينا ما درناش تصويرة، تقدر دير صورة افتراضية (Avatar خاوي)
                photoEl.src = 'assets/images/default-avatar.png'; 
            }

            // تفريغ مكان الصور القديمة وتعبئته بالصور الجديدة
            galleryEl.innerHTML = ''; 
            
            if (student.gallery && student.gallery.length > 0) {
                student.gallery.forEach(imgSrc => {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = `صورة توثيقية لـ ${student.name}`;
                    galleryEl.appendChild(img);
                });
            } else {
                // إذا ماكانوش الصور
                galleryEl.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #999; font-size: 0.9rem;">لم يتم إضافة صور توثيقية ميدانية بعد.</p>';
            }
        } else {
            // إذا كان الـ ID غالط أو مامسجلش
            nameEl.textContent = "مهندس غير موجود";
            descEl.textContent = "لم يتم العثور على بيانات هذا المهندس في قاعدة البيانات.";
            projectEl.textContent = "---";
            roleEl.textContent = "---";
        }
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        descEl.textContent = "حدث خطأ أثناء تحميل البيانات. المرجو المحاولة لاحقاً.";
    }
}

// 4. تشغيل الدالة مباشرة بعد تحميل الصفحة
window.addEventListener('DOMContentLoaded', loadStudentData);

// 5. زر تحميل PDF (برمجة مبدئية)
const downloadBtn = document.getElementById('download-pdf');
if(downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        alert("البيانات تم تحميلها بنجاح. سنقوم بإضافة مكتبة html2pdf لتفعيل هذا الزر في الخطوة القادمة.");
    });
}