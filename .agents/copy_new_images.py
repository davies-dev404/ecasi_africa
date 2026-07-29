import shutil
import os

source_dir = r"C:\Users\HomePC\.gemini\antigravity-ide\brain\2c17bd22-0b9c-4ce1-9b4a-5fa85b33c414"
dest_dir = r"c:\Users\HomePC\Desktop\ecasi_africa-main\public"

mapping = {
    "media__1785337013546.jpg": os.path.join(dest_dir, "images", "courses", "mentorship_group.jpg"),
    "media__1785337061794.jpg": os.path.join(dest_dir, "images", "research", "evidence_based_research.jpg"),
    "media__1785337097658.jpg": os.path.join(dest_dir, "images", "research", "field_research.jpg"),
    "media__1785337128109.jpg": os.path.join(dest_dir, "images", "courses", "executive_training.jpg")
}

for src_name, dest_path in mapping.items():
    src_path = os.path.join(source_dir, src_name)
    if os.path.exists(src_path):
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(src_path, dest_path)
        print(f"Copied {src_name} to {dest_path}")
    else:
        print(f"Source file {src_path} does not exist!")
