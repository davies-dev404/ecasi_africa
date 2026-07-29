import os
import json
import urllib.parse
import re

pub_dir = r"c:\Users\HomePC\Desktop\ecasi_africa-main\public\pdfs\Publications"
output_file = r"c:\Users\HomePC\Desktop\ecasi_africa-main\src\data\publicationsData.json"

if not os.path.exists(pub_dir):
    print("Publications directory does not exist!")
    exit(1)

files = os.listdir(pub_dir)
publications = []

for idx, filename in enumerate(files):
    if filename.startswith('.') or not os.path.isfile(os.path.join(pub_dir, filename)):
        continue
        
    # Get base name without extension
    name, ext = os.path.splitext(filename)
    
    # 1. Clean Title
    title = name.replace("_", " ").replace("-", " ")
    # Remove multiple spaces
    title = re.sub(r'\s+', ' ', title).strip()
    
    # 2. Guess Type
    lower_title = title.lower()
    if "act" in lower_title:
        pub_type = "Act / Legislation"
    elif "policy" in lower_title:
        pub_type = "Policy Document"
    elif "report" in lower_title or "briefing" in lower_title or "findings" in lower_title:
        pub_type = "Report"
    elif "agreement" in lower_title or "protocol" in lower_title or "unfccc" in lower_title:
        pub_type = "International Treaty"
    elif "strategy" in lower_title:
        pub_type = "Strategic Plan"
    elif "brief" in lower_title:
        pub_type = "Policy Brief"
    elif "guidelines" in lower_title or "curriculum" in lower_title:
        pub_type = "Guidelines"
    elif "constitution" in lower_title:
        pub_type = "Constitution / Governing Document"
    else:
        pub_type = "Research / Study"
        
    # 3. Guess Year/Date
    year_match = re.search(r'\b(20\d{2}|19\d{2})\b', filename)
    if year_match:
        date = year_match.group(1)
    else:
        if "jan2021" in lower_title:
            date = "2021"
        elif "may2017" in lower_title:
            date = "2017"
        elif "april 2010" in lower_title:
            date = "2010"
        elif "2018" in filename:
            date = "2018"
        elif "2022" in filename:
            date = "2022"
        elif "2025" in filename:
            date = "2025"
        else:
            date = "Publication"
            
    # 4. Guess Authors
    if "ipcc" in lower_title or "ipccc" in lower_title:
        authors = "IPCC"
    elif "giz" in lower_title or "unep" in lower_title:
        authors = "GIZ / UNEP"
    elif "kenya" in lower_title or "nairobi" in lower_title:
        authors = "Government of Kenya / Local Partners"
    elif "unfccc" in lower_title:
        authors = "UNFCCC"
    elif "kyoto" in lower_title:
        authors = "UNFCCC"
    elif "paris" in lower_title:
        authors = "UNFCCC"
    else:
        authors = "ECAS Institute"
        
    # 5. Abstract
    abstract = f"Official publication document addressing {title}. This publication provides resources, analysis, or guidelines related to sustainable development, climate action, and policy planning."
    
    # 6. Tags
    tags = ["Sustainability"]
    if "climate" in lower_title:
        tags.append("Climate Change")
    if "air" in lower_title or "quality" in lower_title:
        tags.append("Air Quality")
    if "forest" in lower_title or "forestry" in lower_title:
        tags.append("Forestry")
    if "energy" in lower_title:
        tags.append("Energy")
    if "land" in lower_title:
        tags.append("Land Use")
    if "agriculture" in lower_title or "food" in lower_title:
        tags.append("Agriculture")
    if "waste" in lower_title:
        tags.append("Waste Management")
    if "environment" in lower_title:
        tags.append("Environment")
    if "water" in lower_title:
        tags.append("Water Resources")
    
    # Ensure unique and limited tags
    tags = list(set(tags))[:4]
    
    # 7. Download URL (urllib.parse.quote to ensure spaces and special characters are handled)
    encoded_filename = urllib.parse.quote(filename)
    download_url = f"/pdfs/Publications/{encoded_filename}"
    
    pub_item = {
        "id": f"pub-{idx+1}",
        "title": title,
        "type": pub_type,
        "image": "",  # Hidden if missing, or we can use placeholder.svg
        "pages": "PDF Document" if ext.lower() == '.pdf' else "DOCX Document",
        "date": date,
        "authors": authors,
        "abstract": abstract,
        "tags": tags,
        "downloadUrl": download_url
    }
    publications.append(pub_item)

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(publications, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(publications)} publications in {output_file}")
