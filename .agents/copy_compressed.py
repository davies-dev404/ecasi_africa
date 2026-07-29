import os
import shutil

src_dir = r"c:\Users\HomePC\Desktop\ecasi_africa-main\public\pdfs_compressed"
dst_dir = r"c:\Users\HomePC\Desktop\ecasi_africa-main\public\pdfs"

if not os.path.exists(src_dir):
    print("Source directory does not exist!")
    exit(1)

copied_count = 0
for root, dirs, files in os.walk(src_dir):
    for file in files:
        src_file = os.path.join(root, file)
        # Compute relative path to src_dir
        rel_path = os.path.relpath(src_file, src_dir)
        dst_file = os.path.join(dst_dir, rel_path)
        
        # Ensure destination directory exists
        os.makedirs(os.path.dirname(dst_file), exist_ok=True)
        
        # Copy and overwrite
        shutil.copy2(src_file, dst_file)
        copied_count += 1

print(f"Successfully copied and replaced {copied_count} compressed PDFs into public/pdfs.")
