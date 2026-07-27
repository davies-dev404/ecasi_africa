import os

file_path = r"c:\Users\HomePC\Desktop\ecasi_africa-main\src\pages\Index.jsx"

if os.path.exists(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Define old and new heroSlides blocks
    old_slides = """const heroSlides = [
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/Group-photo-during-Air-Quality-Training.jpg",
    title: "Air Quality Training &\\nClimate Resilience",
    subtitle: "Empowering stakeholders and communities with technical knowledge to drive climate resilient actions and policies across Africa.",
    cta: { label: "Our Programmes", to: "/training-education-public-awareness" },
    cta2: { label: "Contact Us", to: "/contact" },
    position: "object-center",
  },
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/DSC_0990-1.jpg",
    title: "Advancing Sustainability\\nAcross Africa",
    subtitle: "We serve as an independent Pan-African think tank supporting green growth and evidence-based environment policies.",
    cta: { label: "About ECAS", to: "/about" },
    cta2: { label: "Our Team", to: "/our-team" },
    position: "object-top",
  },
  {
    bg: "/images/research/1713864387984-1024x768.jpg",
    title: "Capacity Strengthening &\\nMentorship Programs",
    subtitle: "Building the green skills required to navigate carbon markets, sustainable finance, and environment impact assessments.",
    cta: { label: "Training Courses", to: "/institute-overview" },
    cta2: { label: "Register Now", to: "/contact" },
    position: "object-center",
  },
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/Lidya-caf-with-Prof-Shem.jpg",
    title: "Evidence-Based Research\\n& Specialized Advisory",
    subtitle: "Providing high-level consultancy for baseline studies, strategic social assessments, and policy reviews.",
    cta: { label: "Consultancy Services", to: "/research/consulting" },
    cta2: { label: "Learn More", to: "/about" },
    position: "object-top",
  },
  {
    bg: "/images/research/1710846398420-1-1-1024x683.jpg",
    title: "Field Research &\\nSystematic Observation",
    subtitle: "Conducting in-depth research and delivering evidence-based recommendations for policy makers across the continent.",
    cta: { label: "Research Areas", to: "/research-systematic-observation" },
    cta2: { label: "Our Work", to: "/our-strategic-focus" },
    position: "object-center",
  },
  {
    bg: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    title: "Environmental Impact\\nAssessments",
    subtitle: "Delivering strategic environmental and social impact assessments that guide sustainable infrastructure and investment decisions.",
    cta: { label: "Consultancy", to: "/research/consulting" },
    cta2: { label: "Contact Us", to: "/contact" },
    position: "object-top",
  },
  {
    bg: "/images/research/6Dec23-UNEA-6-Briefing-website-aspect-ratio-2000-1200-1024x614-1.jpg",
    title: "Policy Advocacy &\\nInternational Engagement",
    subtitle: "Representing Africa's voice in global environmental forums and driving impactful multilateral policy outcomes.",
    cta: { label: "Our Policies", to: "/our-policies" },
    cta2: { label: "Learn More", to: "/about" },
    position: "object-top",
  },
  {
    bg: "/images/courses/IMGM1984-1024x683.jpg",
    title: "Executive Training\\nWorkshops",
    subtitle: "Professional courses in climate change, green economy, and sustainable development delivered by leading experts.",
    cta: { label: "View Courses", to: "/institute-overview" },
    cta2: { label: "Register", to: "/contact" },
    position: "object-top",
  },
];"""

    new_slides = """const heroSlides = [
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/Group-photo-during-Air-Quality-Training.jpg",
    title: "Air Quality Training &\\nClimate Resilience",
    subtitle: "Empowering stakeholders and communities with technical knowledge to drive climate resilient actions and policies globally.",
    cta: { label: "Our Programmes", to: "/training-education-public-awareness" },
    cta2: { label: "Contact Us", to: "/contact" },
    position: "object-center",
  },
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/DSC_0990-1.jpg",
    title: "Advancing Sustainability\\nGlobally",
    subtitle: "We serve as an independent global think tank supporting green growth and evidence-based environment policies.",
    cta: { label: "About ECAS", to: "/about" },
    cta2: { label: "Our Team", to: "/our-team" },
    position: "object-top",
  },
  {
    bg: "/images/research/1713864387984-1024x768.jpg",
    title: "Capacity Strengthening &\\nMentorship Programs",
    subtitle: "Building the green skills required to navigate carbon markets, sustainable finance, and environment impact assessments.",
    cta: { label: "Training Courses", to: "/institute-overview" },
    cta2: { label: "Register Now", to: "/contact" },
    position: "object-center",
  },
  {
    bg: "https://ecasiafrica.org/wp-content/uploads/2026/05/Lidya-caf-with-Prof-Shem.jpg",
    title: "Evidence-Based Research\\n& Specialized Advisory",
    subtitle: "",
    cta: { label: "Consultancy Services", to: "/research/consulting" },
    cta2: { label: "Learn More", to: "/about" },
    position: "object-top",
  },
  {
    bg: "/images/research/1710846398420-1-1-1024x683.jpg",
    title: "Field Research &\\nSystematic Observation",
    subtitle: "Conducting in-depth research and delivering evidence-based recommendations for policy makers globally.",
    cta: { label: "Research Areas", to: "/research-systematic-observation" },
    cta2: { label: "Our Work", to: "/our-strategic-focus" },
    position: "object-center",
  },
  {
    bg: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    title: "Environmental Impact\\nAssessments",
    subtitle: "Delivering strategic environmental and social impact assessments that guide sustainable infrastructure and investment decisions.",
    cta: { label: "Consultancy", to: "/research/consulting" },
    cta2: { label: "Contact Us", to: "/contact" },
    position: "object-top",
  },
  {
    bg: "/images/research/6Dec23-UNEA-6-Briefing-website-aspect-ratio-2000-1200-1024x614-1.jpg",
    title: "Policy Advocacy &\\nInternational Engagement",
    subtitle: "Driving impactful multilateral policy outcomes in global environmental forums.",
    cta: { label: "Our Policies", to: "/our-policies" },
    cta2: { label: "Learn More", to: "/about" },
    position: "object-top",
  },
  {
    bg: "/images/courses/IMGM1984-1024x683.jpg",
    title: "Executive Training\\nWorkshops",
    subtitle: "Professional courses in climate change, green economy, and sustainable development delivered by leading experts.",
    cta: { label: "View Courses", to: "/institute-overview" },
    cta2: { label: "Register", to: "/contact" },
    position: "object-top",
  },
];"""

    if old_slides in content:
        content = content.replace(old_slides, new_slides)
        print("Successfully updated heroSlides in Index.jsx.")
    else:
        # Check if single or double backslash was parsed
        old_slides_alt = old_slides.replace("\\n", "\n")
        new_slides_alt = new_slides.replace("\\n", "\n")
        if old_slides_alt in content:
            content = content.replace(old_slides_alt, new_slides_alt)
            print("Successfully updated heroSlides in Index.jsx (newline matches).")
        else:
            print("Could not find exact old_slides block match in Index.jsx.")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
else:
    print("Index.jsx not found.")
