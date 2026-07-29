import os
import json
import urllib.parse
import re

pub_dir = r"c:\Users\HomePC\Desktop\ecasi_africa-main\public\pdfs\Publications"
publications_output = r"c:\Users\HomePC\Desktop\ecasi_africa-main\src\data\publicationsData.json"
reports_output = r"c:\Users\HomePC\Desktop\ecasi_africa-main\src\data\reportsData.json"

if not os.path.exists(pub_dir):
    print("Publications directory does not exist!")
    exit(1)

files = os.listdir(pub_dir)
publications = []
reports = []

for idx, filename in enumerate(files):
    if filename.startswith('.') or not os.path.isfile(os.path.join(pub_dir, filename)):
        continue
        
    # Get base name without extension
    name, ext = os.path.splitext(filename)
    
    # Clean Title
    title = name.replace("_", " ").replace("-", " ")
    title = re.sub(r'\s+', ' ', title).strip()
    lower_title = title.lower()
    
    # 1. Filter out sensitive files
    if "constitution of environmental capacity" in lower_title:
        print(f"Skipping sensitive file: {filename}")
        continue
        
    # 2. Guess Year/Date
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
            date = "Resource"
            
    # 3. Guess Authors
    if "ipcc" in lower_title or "ipccc" in lower_title:
        authors = "IPCC"
    elif "giz" in lower_title or "unep" in lower_title:
        authors = "GIZ / UNEP"
    elif "kenya" in lower_title or "nairobi" in lower_title:
        authors = "Government of Kenya / Local Partners"
    elif "unfccc" in lower_title or "kyoto" in lower_title or "paris" in lower_title:
        authors = "UNFCCC"
    else:
        authors = "ECAS Institute"

    # 4. Tags
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
    tags = list(set(tags))[:4]
    
    # 5. Encoded Download URL
    encoded_filename = urllib.parse.quote(filename)
    download_url = f"/pdfs/Publications/{encoded_filename}"
    
    # Determine if it's a Report
    is_report = False
    report_keywords = ["report", "briefing", "findings", "baseline", "scoping", "survey", "annual", "assessment", "evaluation", "study", "booklet"]
    for kw in report_keywords:
        if kw in lower_title:
            is_report = True
            break
            
    if is_report:
        # Determine Report Type
        if "annual" in lower_title:
            rep_type = "Annual Report"
        elif "assessment" in lower_title:
            rep_type = "Impact Assessment"
        elif "baseline" in lower_title or "scoping" in lower_title:
            rep_type = "Project Scoping / Baseline"
        elif "technical" in lower_title:
            rep_type = "Technical Report"
        else:
            rep_type = "Project Report"
            
        report_item = {
            "id": f"rep-{len(reports)+1}",
            "title": title,
            "type": rep_type,
            "image": "",  # Hidden if missing
            "pages": "PDF Document" if ext.lower() == '.pdf' else "DOCX Document",
            "date": date,
            "authors": authors,
            "summary": f"Official report focusing on {title}. Provides key findings, strategic evaluations, and data insights.",
            "tags": tags,
            "downloadUrl": download_url
        }
        reports.append(report_item)
    else:
        # Determine Publication Type
        if "act" in lower_title:
            pub_type = "Act / Legislation"
        elif "policy" in lower_title:
            pub_type = "Policy Document"
        elif "agreement" in lower_title or "protocol" in lower_title or "unfccc" in lower_title:
            pub_type = "International Treaty"
        elif "strategy" in lower_title:
            pub_type = "Strategic Plan"
        elif "brief" in lower_title:
            pub_type = "Policy Brief"
        elif "guidelines" in lower_title or "curriculum" in lower_title:
            pub_type = "Guidelines"
        else:
            pub_type = "Resource / Policy Document"
            
        pub_item = {
            "id": f"pub-{len(publications)+1}",
            "title": title,
            "type": pub_type,
            "image": "",  # Hidden if missing
            "pages": "PDF Document" if ext.lower() == '.pdf' else "DOCX Document",
            "date": date,
            "authors": authors,
            "abstract": f"Official publication document addressing {title}. This publication provides resources, analysis, or guidelines related to sustainable development and policy planning.",
            "tags": tags,
            "downloadUrl": download_url
        }
        publications.append(pub_item)

# Write outputs
with open(publications_output, 'w', encoding='utf-8') as f:
    json.dump(publications, f, indent=2, ensure_ascii=False)
    
with open(reports_output, 'w', encoding='utf-8') as f:
    json.dump(reports, f, indent=2, ensure_ascii=False)

print(f"Processed files:")
print(f"  Saved {len(publications)} publications to {publications_output}")
print(f"  Saved {len(reports)} reports to {reports_output}")
