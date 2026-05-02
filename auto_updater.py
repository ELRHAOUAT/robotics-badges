import os
import json

# إعداد المسارات
json_file_path = 'data.json'
images_base_path = 'assets/images'

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
    
    # البحث عن مجلد التلميذ اللي كيبدا بالـ ID ديالو
    if os.path.exists(images_base_path):
        for folder in os.listdir(images_base_path):
            if folder.startswith(student_id) and os.path.isdir(os.path.join(images_base_path, folder)):
                student_folder_name = folder
                break
    
    # إذا لقينا المجلد ديالو
    if student_folder_name:
        folder_path = os.path.join(images_base_path, student_folder_name)
        
        # جلب جميع الصور (باستثناء profile.jpg لأنها صورة شخصية ماشي توثيق)
        valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
        images = [f for f in os.listdir(folder_path) if f.lower().endswith(valid_extensions) and f.lower() != 'profile.jpg']
        
        new_gallery_paths = []
        
        # حيلة برمجية: تغيير الأسماء إلى أسماء مؤقتة أولاً لتفادي تداخل الأسماء (مثلا p1 موجودة أصلا)
        temp_images = []
        for i, img in enumerate(images):
            old_path = os.path.join(folder_path, img)
            temp_name = f"temp_xyz_{i}_{img}"
            temp_path = os.path.join(folder_path, temp_name)
            os.rename(old_path, temp_path)
            temp_images.append((temp_path, img))
        
        # إعادة التسمية النهائية لـ p1, p2, p3...
        counter = 1
        for temp_path, original_img in temp_images:
            ext = os.path.splitext(original_img)[1] # استخراج الامتداد (مثل .jpg)
            new_name = f"p{counter}{ext}"
            new_path = os.path.join(folder_path, new_name)
            
            os.rename(temp_path, new_path)
            
            # تجهيز المسار لملف JSON (استعمال / لتوافق الويب)
            web_path = f"{images_base_path}/{student_folder_name}/{new_name}"
            new_gallery_paths.append(web_path)
            counter += 1
            
        # تحديث مصفوفة الصور في JSON
        student['gallery'] = new_gallery_paths

# 3. حفظ التعديلات في ملف JSON
try:
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print("✅ Operation completed successfully! All image names have been changed and the data.json file has been updated")
except Exception as e:
    print(f"❌ خطأ في حفظ ملف JSON: {e}")