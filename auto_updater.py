import os
import json
from PIL import Image

# إعداد المسارات
json_file_path = 'data.json'
images_base_path = 'assets/images'

# إعدادات ضغط الصور
MAX_SIZE = (1200, 1200) # أقصى عرض أو طول للصورة
QUALITY = 80 # جودة الصورة (80% ممتازة للويب وتصغر الحجم بزاف)

# 1. قراءة ملف JSON
try:
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
except Exception as e:
    print(f"❌ خطأ في قراءة ملف JSON: {e}")
    exit()

# 2. المرور على كل مهندس في اللائحة
for student in data['students']:
    student_id = student['id']
    student_folder_name = None
    
    # البحث عن المجلد
    if os.path.exists(images_base_path):
        for folder in os.listdir(images_base_path):
            if folder.startswith(student_id) and os.path.isdir(os.path.join(images_base_path, folder)):
                student_folder_name = folder
                break
    
    # إذا لقينا المجلد
    if student_folder_name:
        folder_path = os.path.join(images_base_path, student_folder_name)
        
        valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
        # نجيبو التصاور اللي ماشي profile
        images = [f for f in os.listdir(folder_path) if f.lower().endswith(valid_extensions) and not f.lower().startswith('profile')]
        
        new_gallery_paths = []
        
        counter = 1
        for img_name in images:
            old_path = os.path.join(folder_path, img_name)
            # غنحولو كولشي لـ jpg باش يكون خفيف
            new_name = f"p{counter}.jpg"
            new_path = os.path.join(folder_path, new_name)
            
            try:
                # فتح الصورة، ضغطها، وحفظها بالاسم الجديد
                with Image.open(old_path) as img:
                    # تحويل صيغ بحال PNG (اللي فيها خلفية شفافة) لـ RGB باش تقبل تولي JPG
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    # تصغير الأبعاد مع الحفاظ على التناسب
                    img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
                    
                    # حفظ الصورة مضغوطة
                    img.save(new_path, "JPEG", optimize=True, quality=QUALITY)
                
                # مسح الصورة القديمة إذا كان اسمها مختلف (مثلا كانت png ولا سميتها طويلة)
                if old_path != new_path:
                    os.remove(old_path)
                    
                # تجهيز المسار لملف JSON
                web_path = f"{images_base_path}/{student_folder_name}/{new_name}"
                new_gallery_paths.append(web_path)
                counter += 1
                
            except Exception as e:
                print(f"⚠️ خطأ في معالجة الصورة {img_name}: {e}")
            
        # تحديث JSON
        student['gallery'] = new_gallery_paths

# 3. حفظ التعديلات في ملف JSON
try:
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print("✅ تمت العملية بنجاح! تم ضغط الصور وتغيير أسمائها وتحديث data.json.")
except Exception as e:
    print(f"❌ خطأ في حفظ ملف JSON: {e}")