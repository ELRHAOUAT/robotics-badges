import os
import json
from PIL import Image

# إعداد المسارات
json_file_path = 'data.json'
images_base_path = 'assets/images'

# إعدادات ضغط الصور
MAX_SIZE = (1200, 1200) # أقصى عرض أو طول للصورة
QUALITY = 80 # جودة الصورة

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
    
    if os.path.exists(images_base_path):
        for folder in os.listdir(images_base_path):
            if folder.startswith(student_id) and os.path.isdir(os.path.join(images_base_path, folder)):
                student_folder_name = folder
                break
    
    if student_folder_name:
        folder_path = os.path.join(images_base_path, student_folder_name)
        valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
        
        # جلب جميع الصور باستثناء profile وتجاهل أي ملفات مؤقتة سابقة
        images = [f for f in os.listdir(folder_path) 
                  if f.lower().endswith(valid_extensions) 
                  and not f.lower().startswith('profile')
                  and not f.startswith('temp_safe_')]
        
        # ترتيب الصور أبجديا باش الترتيب يبقى ديما منطقي وماشي عشوائي
        images.sort()
        
        temp_files = []
        new_gallery_paths = []
        
        # المرحلة A: الضغط والحفظ بأسماء مؤقتة آمنة
        counter = 1
        for img_name in images:
            old_path = os.path.join(folder_path, img_name)
            temp_name = f"temp_safe_{counter}.jpg"
            temp_path = os.path.join(folder_path, temp_name)
            
            try:
                with Image.open(old_path) as img:
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
                    img.save(temp_path, "JPEG", optimize=True, quality=QUALITY)
                
                temp_files.append((temp_path, counter))
                counter += 1
            except Exception as e:
                print(f"⚠️ خطأ في معالجة الصورة {img_name}: {e}")
        
        # المرحلة B: مسح الصور القديمة الأصلية لتفادي التكرار
        for img_name in images:
            old_path = os.path.join(folder_path, img_name)
            try:
                os.remove(old_path)
            except Exception as e:
                pass
                
        # المرحلة C: إعادة تسمية الملفات المؤقتة إلى الأسماء النهائية (p1, p2...)
        for temp_path, num in temp_files:
            final_name = f"p{num}.jpg"
            final_path = os.path.join(folder_path, final_name)
            
            # إذا كان هناك ملف بنفس الاسم (احتياطاً)، قم بحذفه
            if os.path.exists(final_path) and final_path != temp_path:
                os.remove(final_path)
                
            os.rename(temp_path, final_path)
            
            # إضافة المسار لملف JSON
            web_path = f"{images_base_path}/{student_folder_name}/{final_name}"
            new_gallery_paths.append(web_path)
            
        # تحديث مصفوفة الصور في JSON
        student['gallery'] = new_gallery_paths

# 3. حفظ التعديلات في ملف JSON
try:
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print("✅ تمت العملية بنجاح 100%! تم حل المشكل، ترتيب الصور، وتحديث data.json بأمان.")
except Exception as e:
    print(f"❌ خطأ في حفظ ملف JSON: {e}")