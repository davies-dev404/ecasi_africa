import { 
  Scissors, Brain, Eye, Siren, Baby, Stethoscope, Heart, Ear, 
  Bone, Pill, Scan, Smile, TestTube, Ambulance, Activity,
  Microscope, UserPlus, Clock, Shield, Monitor,
  Zap, Wind, Droplet, Dna, Anchor, Briefcase, 
  Coffee, Globe, Star, Speaker, Users, User, UserCheck,
  Leaf, Target, BookOpen, TrendingUp, Truck, Recycle, TreePine, Wheat, FlaskConical
} from 'lucide-react';

export const specialtiesData = [
  // --- EXISTING & RESTORED ---
  {
    id: "general-surgery",
    title: "General Surgery",
    description: "Advanced surgical procedures using minimally invasive techniques for faster recovery.",
    shortDescription: "Expert surgical care with a focus on minimally invasive techniques.",
    fullDescription: "<p>Our General Surgery department employs the latest surgical innovations to treat a wide range of conditions. From routine procedures to complex surgeries, our board-certified surgeons prioritize patient safety, comfort, and quick recovery.</p><p>We specialize in laparoscopic and robotic-assisted surgeries which result in smaller incisions, less pain, and shorter hospital stays.</p>",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=1200",
    icon: Scissors,
    benefits: [
      { icon: Activity, title: "Minimally Invasive", description: "Techniques that reduce recovery time and scarring." },
      { icon: Shield, title: "Advanced Safety Protocols", description: "Rigorous standards to ensure the highest patient safety." },
      { icon: Clock, title: "24/7 Surgical Readiness", description: "Always prepared for emergency surgical interventions." },
      { icon: UserPlus, title: "Post-op Care", description: "Comprehensive follow-up and rehabilitation support." }
    ]
  },
  {
    id: "cardiology",
    title: "Cardiology",
    description: "Comprehensive heart care including diagnostics, interventional procedures, and heart health management.",
    shortDescription: "Complete cardiac care from diagnostics to rehabilitation.",
    fullDescription: "<p>Our Cardiology department is dedicated to the prevention, diagnosis, and treatment of heart diseases. We offer a full spectrum of cardiac care services, ranging from non-invasive diagnostics to complex interventional procedures.</p><p>Our team of cardiologists works closely with surgeons and rehabilitation specialists to provide holistic care for your heart health.</p>",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200",
    icon: Heart,
    benefits: [
      { icon: Activity, title: "Advanced Diagnostics", description: "State-of-the-art ECG, Echo, and Stress Testing." },
      { icon: Heart, title: "Heart Failure Clinic", description: "Specialized management for chronic heart conditions." },
      { icon: Clock, title: "Rapid Response", description: "Immediate care for acute cardiac events." },
      { icon: UserPlus, title: "Rehabilitation", description: "Personalized programs to regain heart strength." }
    ]
  },
  {
    id: "oncology",
    title: "Oncology",
    description: "Comprehensive cancer care center committed to advanced treatment and support.",
    shortDescription: "Specialized cancer treatment and patient support.",
    fullDescription: "<p>HOPE’s Oncology is a full-fledged oncology care centre, committed to providing world-class cancer treatment. We offer chemotherapy, surgical oncology, and individualized patient support services to guide you through your journey to recovery.</p><p>Our multidisciplinary team works together to create personalized treatment plans using the latest research and therapies.</p>",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200",
    icon: Microscope,
    benefits: [
      { icon: Activity, title: "Chemotherapy", description: "Advanced medication therapies." },
      { icon: Scissors, title: "Surgical Oncology", description: "Precision tumor removal." },
      { icon: Shield, title: "Pain Management", description: "Palliative care and comfort." },
      { icon: UserPlus, title: "Support Groups", description: "Counseling for patients and families." }
    ]
  },
  {
    id: "neurology",
    title: "Neurology",
    description: "Expert care for neurological disorders involving the brain, spine, and nervous system.",
    shortDescription: "Advanced care for brain, spine, and nervous system disorders.",
    fullDescription: "<p>The Neurology department provides comprehensive evaluation and treatment for a wide range of neurological conditions, including stroke, epilepsy, headache disorders, and neurodegenerative diseases.</p><p>Using advanced neuroimaging and diagnostic tools, we develop personalized treatment plans to improve quality of life for our patients.</p>",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=1200",
    icon: Brain,
    benefits: [
      { icon: Scan, title: "Neuroimaging", description: "High-resolution MRI and CT capabilities." },
      { icon: Brain, title: "Stroke Center", description: "Specialized rapid-response stroke care." },
      { icon: Shield, title: "Chronic Management", description: "Long-term care for conditions like epilepsy and MS." },
      { icon: UserPlus, title: "Rehabilitation Support", description: "Integrated physical and occupational therapy." }
    ]
  },
  {
    id: "maternity",
    title: "Maternity",
    description: "Complete mother and child care including antenatal classes, delivery options, and postnatal support.",
    shortDescription: "Compassionate care for expectant mothers and newborns.",
    fullDescription: "<p>Our Maternity unit is designed to provide a safe, comfortable, and memorable birthing experience. From prenatal care to postpartum support, we are with you every step of the way.</p><p>We offer modern labor and delivery suites, a special care nursery, and breastfeeding support services to ensure the best start for your baby.</p>",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=1200",
    icon: Baby,
    benefits: [
      { icon: Baby, title: "Family-Centered Care", description: "Partners and family welcomed in the birthing process." },
      { icon: Shield, title: "High-Risk Pregnancy", description: "Specialized monitoring for complex pregnancies." },
      { icon: Clock, title: "24/7 Obstetricians", description: "Round-the-clock availability of specialists." },
      { icon: UserPlus, title: "Lactation Support", description: "Expert guidance for breastfeeding success." }
    ]
  },
  {
    id: "paediatrics",
    title: "Paediatrics",
    description: "Specialized healthcare for infants, children, and adolescents, focusing on growth and wellness.",
    shortDescription: "Dedicated healthcare for infants, children, and adolescents.",
    fullDescription: "<p>We understand that children are not just small adults. Our Paediatrics department provides child-friendly care in a welcoming environment.</p><p>Our team handles everything from routine check-ups and vaccinations to the management of acute and chronic childhood illnesses, ensuring your child grows up healthy and strong.</p>",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200",
    icon: Stethoscope,
    benefits: [
      { icon: Smile, title: "Child-Friendly Spaces", description: "Environments designed to reduce anxiety." },
      { icon: Shield, title: "Vaccination Clinic", description: "Comprehensive immunization schedules." },
      { icon: Clock, title: "Emergency Care", description: "Pediatric-specific emergency protocols." },
      { icon: UserPlus, title: "Developmental Screening", description: "Monitoring growth and milestones." }
    ]
  },
  {
    id: "orthopaedics",
    title: "Orthopaedics",
    description: "Treatment for bone and joint conditions, sports medicine, and rehabilitation services.",
    shortDescription: "Restoring mobility and treating bone and joint conditions.",
    fullDescription: "<p>Our Orthopaedics team specializes in the diagnosis and treatment of disorders of the bones, joints, ligaments, tendons, and muscles.</p><p>Whether you need joint replacement, sports injury treatment, or fracture care, we use advanced techniques to restore your mobility and get you back to your active life.</p>",
    image: "https://images.unsplash.com/photo-1542884748-2b87b3660b3a?auto=format&fit=crop&q=80&w=1200",
    icon: Bone,
    benefits: [
      { icon: Bone, title: "Joint Replacement", description: "Advanced hip and knee replacement surgeries." },
      { icon: Activity, title: "Sports Medicine", description: "Care for athletes and active individuals." },
      { icon: Scan, title: "Diagnostic Imaging", description: "On-site X-ray and MRI for quick diagnosis." },
      { icon: UserPlus, title: "Physiotherapy", description: "Integrated rehabilitation for faster recovery." }
    ]
  },
  {
    id: "ophthalmology",
    title: "Ophthalmology",
    description: "Comprehensive eye care services ranging from vision correction to complex eye surgeries.",
    shortDescription: "Advanced vision care and eye surgery.",
    fullDescription: "<p>Protecting your vision is our priority. Our Ophthalmology department offers comprehensive eye exams, cataract surgery, glaucoma management, and treatment for retinal disorders.</p><p>We utilize cutting-edge medical and surgical ophthalmology equipment to provide the highest quality eye care.</p>",
    image: "https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&q=80&w=1200",
    icon: Eye,
    benefits: [
      { icon: Eye, title: "Comprehensive Exams", description: "Thorough screening for all eye conditions." },
      { icon: Activity, title: "Laser Surgery", description: "Minimal intervention procedures." },
      { icon: Shield, title: "Glaucoma Care", description: "Regular monitoring and advanced treatment." },
      { icon: Clock, title: "Emergency Eye Care", description: "Immediate treatment for eye trauma." }
    ]
  },
  {
    id: "ent",
    title: "ENT",
    description: "Diagnosis and treatment of ear, nose, and throat conditions, hearing aids, and cochlear implants.",
    shortDescription: "Specialized care for Ear, Nose, and Throat disorders.",
    fullDescription: "<p>The ENT department provides medical and surgical management of disorders affecting the ear, nose, throat, and related structures of the head and neck.</p><p>From managing chronic sinusitis and hearing loss to performing complex head and neck surgeries, our specialists are equipped to handle a diverse range of conditions.</p>",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda48?auto=format&fit=crop&q=80&w=1200",
    icon: Ear,
    benefits: [
      { icon: Ear, title: "Audiology Services", description: "Hearing tests and aid fittings." },
      { icon: Activity, title: "Sinus Surgery", description: "Endoscopic procedures for sinus relief." },
      { icon: Shield, title: "Sleep Medicine", description: "Treatment for sleep apnea and snoring." },
      { icon: UserPlus, title: "Pediatric ENT", description: "Specialized care for children's ENT issues." }
    ]
  },
  {
    id: "dental",
    title: "Dental",
    description: "Professional dental services including check-ups, cleanings, and cosmetic dentistry.",
    shortDescription: "Complete oral health services.",
    fullDescription: "<p>A healthy smile is a key part of overall wellness. Our Dental clinic provides a full range of general, cosmetic, and restorative dental services.</p><p>We focus on preventive care to keep your teeth and gums healthy, while also offering advanced treatments like implants, veneers, and orthodontics.</p>",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1200",
    icon: Smile,
    benefits: [
      { icon: Smile, title: "Cosmetic Dentistry", description: "Whitening, veneers, and smile makeovers." },
      { icon: Shield, title: "Preventive Care", description: "Regular cleanings and exams." },
      { icon: Activity, title: "Oral Surgery", description: "Extractions and implant placement." },
      { icon: Clock, title: "Emergency Dental", description: "Urgent care for toothaches and trauma." }
    ]
  },
  {
    id: "icu-critical-care",
    title: "ICU / Critical Care",
    description: "24/7 intensive care for life-threatening conditions with advanced monitoring and support.",
    shortDescription: "Advanced life support and monitoring for critical conditions.",
    fullDescription: "<p>Our Intensive Care Unit (ICU) is equipped with advanced monitoring technology and staffed by a dedicated team of intensivists and critical care nurses.</p><p>We provide round-the-clock care for patients with life-threatening complications, ensuring the highest level of vigilance and support.</p>",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200",
    icon: Siren,
    benefits: [
      { icon: Monitor, title: "Advanced Monitoring", description: "Continuous vital sign tracking." },
      { icon: Clock, title: "24/7 Specialist Access", description: "Always on-site critical care doctors." },
      { icon: Shield, title: "Life Support", description: "Ventilators and hemodynamic support systems." },
      { icon: UserPlus, title: "Family Support", description: "Counseling and updates for families." }
    ]
  },
  {
    id: "emergency",
    title: "Accident & Emergency",
    description: "Rapid response medical care for emergencies, trauma care, and lifesaving interventions.",
    shortDescription: "24/7 Emergency response and trauma care.",
    fullDescription: "<p>Our Accident & Emergency department is open 24 hours a day, 365 days a year. We are prepared to handle any medical emergency, from minor injuries to major trauma.</p><p>With a triage system ensuring the most critical patients are seen first, and dedicated trauma teams, we are committed to saving lives.</p>",
    image: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=1200",
    icon: Ambulance,
    benefits: [
      { icon: Clock, title: "Rapid Triage", description: "Quick assessment and prioritization." },
      { icon: Ambulance, title: "Trauma Team", description: "Specialized team for severe injuries." },
      { icon: Shield, title: "Advanced Life Support", description: "Equipped for cardiac and respiratory arrest." },
      { icon: Activity, title: "Streamlined Admissions", description: "Quick transfer to wards or ICU if needed." }
    ]
  },
  {
    id: "pharmacy",
    title: "Pharmacy",
    description: "Fully stocked pharmacy providing prescription medications and medication therapy management.",
    shortDescription: "Expert medication management and counseling.",
    fullDescription: "<p>Our Pharmacy ensures safe and effective medication use. We provide prescription filling, medication reconciliation, and detailed counseling on how to take your medicines.</p><p>We work closely with the medical team to optimize drug therapy and minimize side effects.</p>",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=1200",
    icon: Pill,
    benefits: [
      { icon: Pill, title: "Medication Review", description: "Safety checks for drug interactions." },
      { icon: UserPlus, title: "Patient Counseling", description: "Education on dosage and side effects." },
      { icon: Clock, title: "Fast Dispensing", description: "Efficient service to reduce wait times." },
      { icon: Shield, title: "Quality Assurance", description: "Genuine, high-quality pharmaceuticals." }
    ]
  },
  {
    id: "radiology",
    title: "Radiology",
    description: "Advanced imaging services including MRI, CT, X-ray, and ultrasound for accurate diagnosis.",
    shortDescription: "High-precision diagnostic imaging services.",
    fullDescription: "<p>Our Radiology department uses state-of-the-art imaging technology to look inside the body and diagnose medical conditions.</p><p>Our radiologists are experts in interpreting medical images, providing your doctor with the crucial information needed to plan your treatment.</p>",
    image: "https://images.unsplash.com/photo-1581595220892-b0739bbe3df8?auto=format&fit=crop&q=80&w=1200",
    icon: Scan,
    benefits: [
      { icon: Scan, title: "High-Res MRI & CT", description: "Detailed cross-sectional imaging." },
      { icon: Activity, title: "Ultrasound", description: "Safe imaging for pregnancy and soft tissues." },
      { icon: Clock, title: "Rapid Reporting", description: "Quick turnaround for diagnostic reports." },
      { icon: Shield, title: "Digital X-Ray", description: "Lower radiation dose imaging." }
    ]
  },
  {
    id: "laboratory",
    title: "Laboratory",
    description: "State-of-the-art clinical laboratory services for accurate and timely test results.",
    shortDescription: "Accurate and timely clinical testing.",
    fullDescription: "<p>Reliable test results are the foundation of accurate diagnosis. Our accredited laboratory offers a comprehensive menu of tests, from routine blood work to specialized genetic testing.</p><p>We adhere to strict quality control measures to ensure every result is precise and timely.</p>",
    image: "https://images.unsplash.com/photo-1579165466741-7f35a4755657?auto=format&fit=crop&q=80&w=1200",
    icon: TestTube,
    benefits: [
      { icon: Microscope, title: "Modern Analyzers", description: "High-throughput automated testing." },
      { icon: Clock, title: "Quick Turnaround", description: "Fast results for critical tests." },
      { icon: Shield, title: "Wide Test Menu", description: "Hematology, chemistry, microbiology, and more." },
      { icon: UserPlus, title: "Home Collection", description: "Convenient sample collection options." }
    ]
  },
  // --- NEW ADDITIONS (Total ~45) ---
  {
    id: "dermatology",
    title: "Dermatology",
    description: "Expert care for skin, hair, and nail conditions ranging from cosmetic to medical treatments.",
    shortDescription: "Advanced skin care and treatment.",
    fullDescription: "<p>Our Dermatology clinic offers comprehensive diagnosis and treatment for all skin, hair, and nail diseases. From acne treatment to skin cancer screening, we provide personalized care.</p>",
    image: "https://images.unsplash.com/photo-1616391182219-e080b4d1043a?auto=format&fit=crop&q=80&w=1200",
    icon: Star,
    benefits: [
      { icon: Shield, title: "Skin Cancer Screening", description: "Early detection saves lives." },
      { icon: Star, title: "Cosmetic procedures", description: "Anti-aging and aesthetic treatments." },
      { icon: Activity, title: "Acne Management", description: "Effective long-term solutions." },
      { icon: User, title: "Pediatric Dermatology", description: "Gentle care for children's skin." }
    ]
  },
  {
    id: "psychiatry",
    title: "Psychiatry & Mental Health",
    description: "Compassionate mental health services including therapy, counseling, and medication management.",
    shortDescription: "Holistic mental health support and care.",
    fullDescription: "<p>Mental health is as important as physical health. Our team of psychiatrists and psychologists provides confidential and compassionate care for a wide range of mental health conditions.</p>",
    image: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1200",
    icon: Brain,
    benefits: [
      { icon: UserPlus, title: "Individual Therapy", description: "One-on-one counseling sessions." },
      { icon: Activity, title: "Medication Management", description: "Careful monitoring of drug therapies." },
      { icon: User, title: "Group Therapy", description: "Supportive community sessions." },
      { icon: Shield, title: "Crisis Intervention", description: "Immediate help for acute distress." }
    ]
  },
  {
    id: "urology",
    title: "Urology",
    description: "Diagnosis and treatment of urinary tract conditions and male reproductive health.",
    shortDescription: "Expert urological and reproductive care.",
    fullDescription: "<p>Our Urology department treats conditions affecting the kidneys, bladder, and reproductive system. We offer both medical and surgical solutions, including minimally invasive procedures.</p>",
    image: "https://images.unsplash.com/photo-1631815587646-b85a160c6c8c?auto=format&fit=crop&q=80&w=1200",
    icon: Droplet,
    benefits: [
      { icon: Activity, title: "Kidney Stone Treatment", description: "Laser lithotripsy and shockwave therapy." },
      { icon: User, title: "Men's Health", description: "Prostate health and reproductive care." },
      { icon: Shield, title: "Incontinence Care", description: "Advanced solutions for bladder control." },
      { icon: Scissors, title: "Minimally Invasive", description: "Robotic surgery options." }
    ]
  },
  {
    id: "nephrology",
    title: "Nephrology",
    description: "Specialized care for kidney health, dialysis services, and hypertension management.",
    shortDescription: "Comprehensive kidney care and dialysis.",
    fullDescription: "<p>Your kidneys are vital. Our Nephrology team specializes in preventing and treating kidney disease, offering comprehensive care including dialysis and transplant follow-up.</p>",
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=1200", 
    icon: Activity,
    benefits: [
      { icon: Activity, title: "Dialysis Center", description: "State-of-the-art hemodialysis units." },
      { icon: Shield, title: "Hypertension Control", description: "Specialized blood pressure management." },
      { icon: Monitor, title: "CKD Management", description: "Slowing progression of kidney disease." },
      { icon: UserPlus, title: "Transplant Support", description: "Pre and post-transplant care." }
    ]
  },
  {
    id: "gastroenterology",
    title: "Gastroenterology",
    description: "Digestive health specialist treating stomach, bowel, liver, and pancreas conditions.",
    shortDescription: "Advanced care for digestive system health.",
    fullDescription: "<p>Our Gastroenterology department offers advanced diagnostic and therapeutic procedures for digestive disorders. From endoscopy to colonoscopy, we ensure your digestive health is in expert hands.</p>",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1200", 
    icon: Activity,
    benefits: [
      { icon: Scan, title: "Endoscopy Suite", description: "Advanced diagnostic imaging." },
      { icon: Shield, title: "Liver Clinic", description: "Specialized care for hepatitis and other liver issues." },
      { icon: Clock, title: "Cancer Screening", description: "Preventive colon cancer screening." },
      { icon: User, title: "Nutrition Support", description: "Dietary guidance for digestive disorders." }
    ]
  },
  {
    id: "pulmonology",
    title: "Pulmonology",
    description: "Respiratory medicine focusing on lung health, asthma, COPD, and sleep disorders.",
    shortDescription: "Expert care for lung and respiratory health.",
    fullDescription: "<p>Breathe easier with our Pulmonology services. We treat a wide variety of respiratory conditions and offer comprehensive lung function testing and rehabilitation.</p>",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=1200",
    icon: Wind,
    benefits: [
      { icon: Activity, title: "Lung Function Tests", description: "Accurate diagnosis of breathing issues." },
      { icon: Shield, title: "Asthma Clinic", description: "Personalized management plans." },
      { icon: Clock, title: "Sleep Apnea", description: "Diagnosis and treatment of sleep disorders." },
      { icon: UserPlus, title: "Pulmonary Rehab", description: "Exercises to improve lung capacity." }
    ]
  },
  {
    id: "endocrinology",
    title: "Endocrinology",
    description: "Treatment for diabetes, thyroid disorders, and hormonal imbalances.",
    shortDescription: "Specialized care for diabetes and hormones.",
    fullDescription: "<p>Our Endocrinologists categorize and treat hormonal imbalances. We utilize a multidisciplinary approach for diabetes management to prevent complications.</p>",
    image: "https://images.unsplash.com/photo-1576091160550-2187d80aeff2?auto=format&fit=crop&q=80&w=1200",
    icon: Activity,
    benefits: [
      { icon: Droplet, title: "Diabetes Care", description: "Comprehensive blood sugar management." },
      { icon: Shield, title: "Thyroid Clinic", description: "Treatment for hypo/hyperthyroidism." },
      { icon: Monitor, title: "Metabolic Health", description: "Management of obesity and metabolism." },
      { icon: UserPlus, title: "Patient Education", description: "Empowering patients with self-management skills." }
    ]
  },
  {
    id: "rheumatology",
    title: "Rheumatology",
    description: "Care for autoimmune diseases and musculoskeletal conditions like arthritis.",
    shortDescription: "Expert treatment for arthritis and autoimmune diseases.",
    fullDescription: "<p>We provide specialized care for patients with arthritis and other autoimmune diseases. Our goal is to reduce pain, prevent joint damage, and improve quality of life.</p>",
    image: "https://images.unsplash.com/photo-1584515933487-98db75f565b1?auto=format&fit=crop&q=80&w=1200",
    icon: Bone,
    benefits: [
      { icon: Activity, title: "Arthritis Care", description: "Management of Rheumatoid and Osteoarthritis." },
      { icon: Shield, title: "Autoimmune Therapy", description: "Biological therapies for complex conditions." },
      { icon: Scan, title: "Joint Injection", description: "Targeted pain relief procedures." },
      { icon: UserPlus, title: "Lifestyle Support", description: "Physiotherapy and occupational support." }
    ]
  },
  {
    id: "physical-therapy",
    title: "Physical Therapy",
    description: "Rehabilitation services to restore movement and function after injury or surgery.",
    shortDescription: "Restoring movement and physical function.",
    fullDescription: "<p>Our Physical Therapy department helps patients recover from injuries and surgeries. We use a variety of techniques to reduce pain and improve mobility.</p>",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200",
    icon: Activity,
    benefits: [
      { icon: User, title: "Manual Therapy", description: "Hands-on mobilization techniques." },
      { icon: Zap, title: "Electrotherapy", description: "Pain relief using advanced modalities." },
      { icon: Clock, title: "Post-op Rehab", description: "Structured programs for surgical recovery." },
      { icon: Shield, title: "Injury Prevention", description: "Education on safe movement and ergonomics." }
    ]
  },
  {
    id: "nutrition",
    title: "Nutrition & Dietetics",
    description: "Personalized dietary planning for health management and disease prevention.",
    shortDescription: "Expert nutritional guidance for better health.",
    fullDescription: "<p>Good nutrition is the cornerstone of health. Our dietitians provide evidence-based nutritional counseling to manage chronic diseases and promote overall wellness.</p>",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200",
    icon: Coffee,
    benefits: [
      { icon: User, title: "Personalized Plans", description: "Diets tailored to your medical needs." },
      { icon: Shield, title: "Weight Management", description: "Support for healthy weight loss or gain." },
      { icon: Activity, title: "Clinical Nutrition", description: "Diabetic and cardiac diet planning." },
      { icon: Coffee, title: "Wellness Coaching", description: "Holistic lifestyle advice." }
    ]
  },
  {
    id: "plastic-surgery",
    title: "Plastic Surgery",
    description: "Reconstructive and cosmetic procedures to enhance appearance and function.",
    shortDescription: "Reconstructive and aesthetic surgical services.",
    fullDescription: "<p>Our Plastic Surgery department offers both reconstructive surgeries for trauma/cancer patients and cosmetic procedures to enhance appearance.</p>",
    image: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=80&w=1200",
    icon: Scissors,
    benefits: [
      { icon: Shield, title: "Reconstructive", description: "Restoring form after injury." },
      { icon: Star, title: "Cosmetic", description: "Aesthetic enhancements." },
      { icon: Activity, title: "Hand Surgery", description: "Specialized care for hand injuries." },
      { icon: UserPlus, title: "Burn Care", description: "Advanced treatment for burn victims." }
    ]
  },
  {
    id: "vascular-surgery",
    title: "Vascular Surgery",
    description: "Treatment of conditions affecting blood vessels, arteries, and veins.",
    shortDescription: "Expert care for circulatory system conditions.",
    fullDescription: "<p>We treat diseases of the vascular system (arteries and veins) through medical therapy, minimally invasive catheter procedures, and surgical reconstruction.</p>",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200",
    icon: Activity,
    benefits: [
      { icon: Scan, title: "Vascular Lab", description: "Non-invasive flow studies." },
      { icon: Scissors, title: "Varicose Veins", description: "Minimally invasive vein treatments." },
      { icon: Shield, title: "Aneurysm Repair", description: "Life-saving aortic procedures." },
      { icon: Clock, title: "Stroke Prevention", description: "Carotid artery interventions." }
    ]
  },
  {
    id: "neurosurgery",
    title: "Neurosurgery",
    description: "Surgical treatment for disorders of the brain, spine, and nervous system.",
    shortDescription: "Complex brain and spine surgery.",
    fullDescription: "<p>Our Neurosurgeons perform world-class surgeries for brain tumors, spinal disorders, and traumatic injuries, utilizing state-of-the-art navigation technology.</p>",
    image: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=1200",
    icon: Brain,
    benefits: [
      { icon: Scan, title: "Brain Tumor", description: "Advanced surgical removal." },
      { icon: Bone, title: "Spine Surgery", description: "Minimally invasive spinal fusion." },
      { icon: Shield, title: "Trauma Care", description: "Emergency neurosurgical intervention." },
      { icon: Zap, title: "Functional Neuro", description: "Treatment for epilepsy and movement disorders." }
    ]
  },
  {
    id: "pediatric-surgery",
    title: "Pediatric Surgery",
    description: "Surgical care specialized for the unique needs of infants and children.",
    shortDescription: "Specialized surgery for children.",
    fullDescription: "<p>Children need specialized surgical care. Our Pediatric Surgeons are trained to manage surgical conditions in infants, children, and adolescents with extreme precision.</p>",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1200",
    icon: Baby,
    benefits: [
      { icon: Baby, title: "Neonatal Surgery", description: "Life-saving surgery for newborns." },
      { icon: Scissors, title: "Minimally Invasive", description: "Small incisions for little bodies." },
      { icon: Shield, title: "Congenital Defects", description: "Correction of birth abnormalities." },
      { icon: UserPlus, title: "Family Support", description: "Inclusive care for the whole family." }
    ]
  },
  {
    id: "geriatrics",
    title: "Geriatrics",
    description: "Healthcare dedicated to the unique needs of the elderly population.",
    shortDescription: "Specialized care for older adults.",
    fullDescription: "<p>We focus on health promotion, prevention, and treatment of acute and chronic diseases in older adults, addressing the complex needs of aging.</p>",
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=1200",
    icon: User,
    benefits: [
      { icon: Shield, title: "Chronic Disease", description: "Management of multiple conditions." },
      { icon: Brain, title: "Cognitive Health", description: "Dementia and Alzheimer's care." },
      { icon: Activity, title: "Mobility Support", description: "Fall prevention and strength maintenance." },
      { icon: UserPlus, title: "Palliative Care", description: "Comfort-focused care planning." }
    ]
  },
  {
    id: "pain-management",
    title: "Pain Management",
    description: "Multidisciplinary approach to managing chronic and acute pain.",
    shortDescription: "Relief and management of chronic pain.",
    fullDescription: "<p>Our Pain Management specialists work to diagnose the source of pain and effectively manage it to improve function and quality of life.</p>",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1200",
    icon: Activity,
    benefits: [
      { icon: Zap, title: "Interventional", description: "Nerve blocks and injections." },
      { icon: Pill, title: "Medication", description: "Safe pharmacological management." },
      { icon: User, title: "Psychological", description: "Coping strategies for chronic pain." },
      { icon: Activity, title: "Physical", description: "Rehab therapies for pain relief." }
    ]
  },
  {
    id: "audiology",
    title: "Audiology",
    description: "Diagnostic and treatment services for hearing and balance disorders.",
    shortDescription: "Hearing and balance health services.",
    fullDescription: "<p>We provide comprehensive hearing evaluations and solutions, including hearing aids and balance testing, for people of all ages.</p>",
    image: "https://images.unsplash.com/photo-1599426921335-50fa67252062?auto=format&fit=crop&q=80&w=1200",
    icon: Ear,
    benefits: [
      { icon: Ear, title: "Hearing Tests", description: "Precise audiometric evaluation." },
      { icon: Activity, title: "Hearing Aids", description: "Fitting and programming of devices." },
      { icon: Anchor, title: "Balance Center", description: "Diagnosis of vestibular disorders." },
      { icon: Baby, title: "Pediatric Audio", description: "Newborn hearing screening." }
    ]
  },
  {
    id: "psychology",
    title: "Psychology",
    description: "Therapeutic services for mental, emotional, and behavioral well-being.",
    shortDescription: "Counseling and behavioral therapy.",
    fullDescription: "<p>Our Psychologists offer talk therapy and behavioral interventions to help individuals cope with life challenges and mental health conditions.</p>",
    image: "https://images.unsplash.com/photo-1541199249251-f716e6136c20?auto=format&fit=crop&q=80&w=1200",
    icon: Brain,
    benefits: [
      { icon: User, title: "CBT", description: "Cognitive Behavioral Therapy." },
      { icon: Shield, title: "Stress Management", description: "Techniques for anxiety relief." },
      { icon: Users, title: "Couples Therapy", description: "Relationship counseling." },
      { icon: Brain, title: "Neuropsychology", description: "Cognitive assessment." }
    ]
  },
  {
    id: "podiatry",
    title: "Podiatry",
    description: "Medical and surgical care for the foot and ankle.",
    shortDescription: "Specialist foot and ankle care.",
    fullDescription: "<p>Keep moving comfortably. Our Podiatrists treat common and complex foot problems, from ingrown toenails to diabetic foot care and reconstructive surgery.</p>",
    image: "https://images.unsplash.com/photo-1540423545887-286d4e81e6ea?auto=format&fit=crop&q=80&w=1200",
    icon: Activity,
    benefits: [
      { icon: Activity, title: "Diabetic Foot", description: "Preventive care for ulcers." },
      { icon: Scissors, title: "Foot Surgery", description: "Bunions and hammertoe correction." },
      { icon: Shield, title: "Orthotics", description: "Custom shoe inserts." },
      { icon: Zap, title: "Sports Injury", description: "Treatment for sprains and fractures." }
    ]
  },
  {
    id: "allergy-immunology",
    title: "Allergy & Immunology",
    description: "Diagnosis and management of allergies, asthma, and immune system disorders.",
    shortDescription: "Treatment for allergies and immune disorders.",
    fullDescription: "<p>We help you manage allergic reactions and immune deficiencies. Our goal is to verify triggers and provide effective desensitization or management strategies.</p>",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1200",
    icon: Wind,
    benefits: [
      { icon: Activity, title: "Skin Testing", description: "Identification of allergens." },
      { icon: Shield, title: "Immunotherapy", description: "Allergy shots for long-term relief." },
      { icon: Wind, title: "Asthma Care", description: "Management of allergic asthma." },
      { icon: User, title: "Food Allergy", description: "Dietary guidance and testing." }
    ]
  },
  {
    id: "nuclear-medicine",
    title: "Nuclear Medicine",
    description: "Using small amounts of radioactive material to diagnose and treat diseases.",
    shortDescription: "Advanced molecular imaging and therapy.",
    fullDescription: "<p>Nuclear Medicine provides unique information about the structure and function of the body. It plays a vital role in early diagnosis and treatment of conditions like cancer and heart disease.</p>",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=1200",
    icon: Zap,
    benefits: [
      { icon: Scan, title: "PET Scans", description: "Cancer detection and staging." },
      { icon: Shield, title: "Thyroid Therapy", description: "Radioactive iodine treatment." },
      { icon: Heart, title: "Cardiac Imaging", description: "Blood flow analysis." },
      { icon: Bone, title: "Bone Scans", description: "Detecting fractures and tumors." }
    ]
  },
  {
    id: "interventional-radiology",
    title: "Interventional Radiology",
    description: "Minimally invasive image-guided procedures to diagnose and treat diseases.",
    shortDescription: "Minimally invasive image-guided treatments.",
    fullDescription: "<p>IR procedures often replace open surgical procedures. They are generally easier for the patient because they involve no large incisions, less risk, promising less pain and shorter recovery time.</p>",
    image: "https://images.unsplash.com/photo-1581595220892-b0739bbe3df8?auto=format&fit=crop&q=80&w=1200",
    icon: Scan,
    benefits: [
      { icon: Activity, title: "Biopsies", description: "Image-guided tissue sampling." },
      { icon: Shield, title: "Embolization", description: "Blocking abnormal blood vessels." },
      { icon: Zap, title: "Drainage", description: "Treating infections and fluid buildup." },
      { icon: Scissors, title: "Vascular Access", description: "Port and line placement." }
    ]
  },
  {
    id: "family-medicine",
    title: "Family Medicine",
    description: "Comprehensive primary care for individuals and families across all ages.",
    shortDescription: "Primary care for the whole family.",
    fullDescription: "<p>Our Family Medicine physicians are dedicated to building long-term relationships with patients. We treat acute and chronic illnesses and provide preventive care for your entire family.</p>",
    image: "https://images.unsplash.com/photo-1576765611791-37477ba09738?auto=format&fit=crop&q=80&w=1200",
    icon: Users,
    benefits: [
      { icon: Shield, title: "Preventive Care", description: "Annual check-ups and screenings." },
      { icon: Activity, title: "Chronic Disease", description: "Management of hypertension, diabetes." },
      { icon: Baby, title: "Pediatric Care", description: "Care from birth through adolescence." },
      { icon: UserPlus, title: "Womens Health", description: "Routine exams and family planning." }
    ]
  },
  {
    id: "internal-medicine",
    title: "Internal Medicine",
    description: "Prevention, diagnosis, and treatment of adult diseases.",
    shortDescription: "Comprehensive care for adult health.",
    fullDescription: "<p>Internists serve as your primary care physicians but also have deep training in subspecialties. We manage complex medical issues and coordinate your overall care.</p>",
    image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=1200",
    icon: UserCheck,
    benefits: [
      { icon: Monitor, title: "Complex Diagnosis", description: "Expertise in puzzling conditions." },
      { icon: Shield, title: "Proactive Health", description: "Screenings for early detection." },
      { icon: Activity, title: "Chronic Care", description: "Long-term condition management." },
      { icon: User, title: "Senior Health", description: "Specialized care for aging adults." }
    ]
  },
  {
    id: "hematology",
    title: "Hematology",
    description: "Diagnosis and treatment of blood disorders.",
    shortDescription: "Specialized care for blood diseases.",
    fullDescription: "<p>Our Hematologists treat conditions affecting blood components including leukemia, anemia, clotting disorders, and hemophilia.</p>",
    image: "https://images.unsplash.com/photo-1615461166810-147ef5dcf789?auto=format&fit=crop&q=80&w=1200",
    icon: Droplet,
    benefits: [
      { icon: Activity, title: "Anemia Care", description: "Diagnosis and iron therapy." },
      { icon: Shield, title: "Clotting Disorders", description: "Management of thrombosis." },
      { icon: Microscope, title: "Blood Cancers", description: "Leukemia and lymphoma care." },
      { icon: UserPlus, title: "Transfusion", description: "Safe blood product support." }
    ]
  },
  {
    id: "infectious-diseases",
    title: "Infectious Diseases",
    description: "Diagnosis and treatment of complex viral, bacterial, and fungal infections.",
    shortDescription: "Expert care for infectious conditions.",
    fullDescription: "<p>We specialize in difficult-to-treat infections, including HIV, tropical diseases, and drug-resistant bacterial infections.</p>",
    image: "https://images.unsplash.com/photo-1584036561566-b93a901dbd15?auto=format&fit=crop&q=80&w=1200",
    icon: Globe,
    benefits: [
      { icon: Shield, title: "Travel Medicine", description: "Vaccinations and advice." },
      { icon: Activity, title: "HIV/AIDS Care", description: "Comprehensive management." },
      { icon: Microscope, title: "Pathogen ID", description: "Precise lab identification." },
      { icon: User, title: "Infection Control", description: "Hospital epidemiology." }
    ]
  },
  {
    id: "sports-medicine",
    title: "Sports Medicine",
    description: "Treatment and prevention of sports-related injuries.",
    shortDescription: "Care for athletes and active individuals.",
    fullDescription: "<p>Whether you're an elite athlete or a weekend warrior, our Sports Medicine team helps you recover from injuries and improve performance.</p>",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200",
    icon: Activity,
    benefits: [
      { icon: Zap, title: "Injury Rehab", description: "Return to sport safely." },
      { icon: Shield, title: "Concussion", description: "Management and testing." },
      { icon: Activity, title: "Performance", description: "Biomechanical analysis." },
      { icon: UserPlus, title: "Team Docs", description: "On-field medical coverage." }
    ]
  },
  {
    id: "neonatology",
    title: "Neonatology (NICU)",
    description: "Intensive care for ill or premature newborn infants.",
    shortDescription: "Specialized care for newborns.",
    fullDescription: "<p>Our NICU provides critical care for the tiniest patients. Equipped with advanced technology, we function as a lifeline for premature or critically ill babies.</p>",
    image: "https://images.unsplash.com/photo-1519789112446-24819d444439?auto=format&fit=crop&q=80&w=1200",
    icon: Baby,
    benefits: [
      { icon: Shield, title: "Premature Care", description: "Support for undeveloped organs." },
      { icon: Monitor, title: "Advanced Monitoring", description: "24/7 vitals tracking." },
      { icon: User, title: "Developmental", description: "Neurodevelopmental follow-up." },
      { icon: UserPlus, title: "Family Centered", description: "Bonding support." }
    ]
  },
  {
    id: "speech-therapy",
    title: "Speech Therapy",
    description: "Assessment and treatment of communication and swallowing disorders.",
    shortDescription: "Therapy for speech and swallowing.",
    fullDescription: "<p>Our Speech-Language Pathologists help adults and children with speech, language, voice, and swallowing disorders improve their communication and quality of life.</p>",
    image: "https://images.unsplash.com/photo-1516307015064-9464670603f9?auto=format&fit=crop&q=80&w=1200",
    icon: Speaker,
    benefits: [
      { icon: Speaker, title: "Speech Disorders", description: "Articulation and fluency." },
      { icon: Activity, title: "Swallowing", description: "Dysphagia therapy." },
      { icon: User, title: "Voice Therapy", description: "Treatment for vocal strain." },
      { icon: Brain, title: "Cognitive Rehab", description: "Memory and processing." }
    ]
  },
  {
    id: "occupational-therapy",
    title: "Occupational Therapy",
    description: "Helping patients develop or recover skills for daily living and working.",
    shortDescription: "Skills for daily living and independence.",
    fullDescription: "<p>OT helps people across the lifespan do the things they want and need to do. We focus on adapting the environment or task to fit the person.</p>",
    image: "https://images.unsplash.com/photo-1576091160550-2187d80aeff2?auto=format&fit=crop&q=80&w=1200",
    icon: Briefcase,
    benefits: [
      { icon: User, title: "Daily Living", description: "Self-care skills training." },
      { icon: UserPlus, title: "Hand Therapy", description: "Rehab for hand injuries." },
      { icon: Brain, title: "Sensory integration", description: "Pediatric developmental support." },
      { icon: Briefcase, title: "Return to Work", description: "Job site analysis and rehab." }
    ]
  },
  {
    id: "proctology",
    title: "Proctology",
    description: "Diagnosis and treatment of disorders of the rectum, anus, and colon.",
    shortDescription: "Colorectal health services.",
    fullDescription: "<p>We offer discreet and expert care for colorectal conditions including hemorrhoids, anal fissures, and inflammatory bowel diseases.</p>",
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200",
    icon: Activity,
    benefits: [
      { icon: Shield, title: "Hemorrhoid Caere", description: "Medical and surgical options." },
      { icon: Activity, title: "Fissure Repair", description: "Advanced treatment protocols." },
      { icon: Scan, title: "Screening", description: "Early detection of abnormalities." },
      { icon: User, title: "Comfort", description: "Pain management strategies." }
    ]
  },
  {
    id: "anesthesiology",
    title: "Anesthesiology",
    description: "Pain relief and anesthesia care before, during, and after surgery.",
    shortDescription: "Expert anesthesia and pain control.",
    fullDescription: "<p>Our Anesthesiologists ensure your safety and comfort during surgical procedures. We also specialize in acute pain management and critical care medicine.</p>",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1200",
    icon: Pill,
    benefits: [
      { icon: Shield, title: "Patient Safety", description: "Continuous operative monitoring." },
      { icon: Pill, title: "Pain Control", description: "Effective nerve blocks." },
      { icon: Activity, title: "Regional Anesthesia", description: "Spinal and epidural options." },
      { icon: Clock, title: "Recovery", description: "Smooth emergence from sedation." }
    ]
  },
  {
    id: "pathology",
    title: "Pathology",
    description: "Diagnosis of disease through the examination of tissues, organs, fluids, and autopsies.",
    shortDescription: "Diagnostic disease analysis.",
    fullDescription: "<p>Pathologists are the 'doctors' doctor'. We provide definitive diagnoses for cancer and other serious conditions by examining tissue samples under the microscope.</p>",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1200",
    icon: Microscope,
    benefits: [
      { icon: Microscope, title: "Biopsy Analysis", description: "Critical cancer diagnosis." },
      { icon: Droplet, title: "Cytopathology", description: "Cellular level disease detection." },
      { icon: Clock, title: "Rapid Frozen", description: "Intraoperative consultations." },
      { icon: Shield, title: "Accuracy", description: "Rigorous diagnostic standards." }
    ]
  },
  {
    id: "medical-genetics",
    title: "Medical Genetics",
    description: "Diagnosis and management of hereditary disorders.",
    shortDescription: "Genetic counseling and testing.",
    fullDescription: "<p>We help families understand genetic conditions. From prenatal counseling to diagnostics for rare diseases, we provide clarity and support.</p>",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=1200",
    icon: Dna,
    benefits: [
      { icon: Dna, title: "Genetic Testing", description: "Advanced molecular diagnostics." },
      { icon: UserPlus, title: "Counseling", description: "Risk assessment for families." },
      { icon: Baby, title: "Prenatal", description: "Screening during pregnancy." },
      { icon: Shield, title: "Cancer Genetics", description: "Hereditary cancer risk analysis." }
    ]
  },
  {
    id: "sexual-health",
    title: "Sexual Health",
    description: "Confidential care for sexual health concerns and STIs.",
    shortDescription: "Private and expert sexual health care.",
    fullDescription: "<p>We provide a safe, non-judgmental space for sexual health screenings, treatment, and counseling for men and women.</p>",
    image: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&q=80&w=1200",
    icon: Heart,
    benefits: [
      { icon: Shield, title: "Confidentiality", description: "Strict privacy protocols." },
      { icon: Activity, title: "STI Testing", description: "Comprehensive screening panels." },
      { icon: User, title: "Counseling", description: "Education and prevention." },
      { icon: Clock, title: "Rapid Results", description: "Quick turnaround for peace of mind." }
    ]
  },

  // ──────────── ECASI AFRICA PROGRAMMES ────────────

  {
    id: "clean-air-programme",
    title: "Air Quality Programme",
    description: "Addressing Africa's air quality crisis through research, monitoring, policy advisory and capacity development.",
    shortDescription: "Evidence-based solutions to improve air quality and protect public health across African cities and communities.",
    fullDescription: `
      <h3>Who We Are - ECAS Institute</h3>
      <p>The Environmental Capacities & Sustainability Institute (ECAS) is an independent think tank based in Nairobi, Kenya, specializing in training, research, and policy advisory services on environmental, energy, and climate-related issues.</p>
      <p>For over 9 years, ECAS has addressed data, skills, and policy gaps across Africa through practical and impactful programmes. Our work spans climate adaptation, sustainable energy, circular economy, and natural resource governance.</p>
      <p>We have worked with clients and partners across the globe in private sector, government agencies, organizations, groups, individuals and communities across the globe.</p>

      <h3>Why Air Quality Matters</h3>
      <p>Air pollution is one of Nairobi’s most urgent public health and environmental challenges. From transport emissions to industrial smoke and improper waste disposal, poor air quality threatens the health of communities, especially in informal settlements and high-traffic areas.</p>
      <p>The ECAS Institute, in partnership with the Nairobi City County Government and the Clean Air Fund, is driving change through an Air Quality Programme focused on strengthening governance, building technical capacity, and empowering communities with knowledge and data to improve the Nairobi city’s air quality.</p>

      <h3>Project Overview (Breathe Nairobi Project)</h3>
      <p>In partnership with the Nairobi City County Government and the Clean Air Fund, ECAS Institute is supporting the “Breathe Nairobi” initiative, a city-wide effort to reduce air pollution and carbon emissions by 30% by 2030.</p>
      <p>ECAS plays a key role in stakeholder mapping, technical write-shops, capacity building, and developing the county’s Clean Air Roadmap. Through this collaboration, Nairobi is integrating clean air into local policies, improving data access, and building stronger public awareness around air quality.</p>

      <h3>Project Objectives</h3>
      <ul>
        <li><strong>Strengthen Air Quality Monitoring & Data Access</strong></li>
        <li><strong>Support Policy & Regulation Development</strong></li>
        <li><strong>Build Institutional & Community Capacity</strong></li>
        <li><strong>Promote Clean Mobility & Emissions Reduction</strong></li>
      </ul>

      <h3>Project Stages</h3>
      <ul>
        <li><strong>Stakeholder Mapping & Consultation:</strong> Identify key actors and engage them in shaping Nairobi’s air quality regulations through inclusive consultations.</li>
        <li><strong>Desktop Review:</strong> Review existing policies, studies, and data to guide evidence-based regulations development.</li>
        <li><strong>Technical Writeshop:</strong> Collaborative session with experts to draft a practical and informed Air Quality Regulations.</li>
        <li><strong>Stakeholder Validation and Feedback:</strong> Gather feedback from diverse stakeholders to refine and validate the Draft Air Quality Regulations.</li>
        <li><strong>County Leadership Engagement:</strong> Engage senior county officials to build support and align the Draft Air Quality Regulations with county priorities.</li>
        <li><strong>County Assembly Endorsement:</strong> Present the Draft Air Quality Regulations to the County Assembly for formal endorsement and policy backing.</li>
        <li><strong>Developing Training Modules:</strong> Create tailored training content for government officers, communities, and key stakeholders.</li>
        <li><strong>Capacity Building Workshop:</strong> Conduct training sessions to equip responsible parties with skills to implement air quality actions.</li>
      </ul>

      <h3>Completed Stages</h3>
      <ul>
        <li><strong>Stakeholder Mapping & Consultation:</strong> Conducted for 2 days with 40 attendees each day</li>
        <li><strong>Desktop Review:</strong> Conducted for 5 days with 12 attendees each day</li>
        <li><strong>Technical Writeshop:</strong> Conducted for 5 days with 25 attendees each day</li>
        <li><strong>Stakeholder Feedback and Validation:</strong> Conducted for 5 days with 25 attendees each day</li>
      </ul>
      
      <div class="mt-8">
        <a href="/pdfs/Breathe_Nairobi_Project.pdf" target="_blank" rel="noopener noreferrer" download class="inline-flex items-center gap-2 px-5 py-3 bg-ecasi-green hover:bg-white hover:text-ecasi-navy !text-white hover:!text-ecasi-navy font-bold rounded-xl transition-all shadow-md">
          Download Breathe Nairobi Project PDF
        </a>
      </div>
    `,
    image: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    icon: Wind,
    benefits: [
      { icon: FlaskConical, title: "Air Quality Monitoring", description: "Strengthening Air Quality Monitoring & Data Access." },
      { icon: BookOpen, title: "Policy Advisory", description: "Supporting Policy & Regulation Development." },
      { icon: Users, title: "Capacity Building", description: "Building Institutional & Community Capacity." },
      { icon: Shield, title: "Clean Mobility", description: "Promoting Clean Mobility & Emissions Reduction." }
    ]
  },

  {
    id: "climate-change",
    title: "Climate Change Action",
    description: "Integrated climate action support spanning adaptation, mitigation, GHG inventories, and institutional capacity-building.",
    shortDescription: "Driving evidence-based climate action across Africa through research, training, policy advisory and technical assistance.",
    fullDescription: `
      <p>Climate change poses one of the most significant threats to Africa's sustainable development. Despite contributing less than 4% of global greenhouse gas (GHG) emissions, Africa bears a disproportionate burden of climate impacts — including more frequent and intense droughts, floods, heatwaves, sea-level rise, and disruption to agriculture and food systems.</p>

      <p>ECAS Institute's Climate Change Action programme provides comprehensive, integrated support to help African governments, institutions, and communities respond effectively to these challenges. Drawing on deep technical expertise and an evidence-based approach, we work across the full spectrum of climate action — from national policy frameworks to community-level adaptation.</p>

      <h3>Key Services</h3>
      <ul>
        <li><strong>Training, Education & Public Awareness</strong> — Delivering targeted capacity-building programmes on climate science, policy, finance, and adaptation for diverse audiences including government officials, private sector actors, and civil society.</li>
        <li><strong>Research and Systematic Observation</strong> — Conducting rigorous climate research and analysis, including vulnerability and risk assessments, climate scenario modelling, and synthesis of scientific evidence for policy audiences.</li>
        <li><strong>Adaptation & Mitigation Assessments</strong> — Supporting the design and evaluation of climate adaptation and mitigation strategies, including National Adaptation Plans (NAPs) and Nationally Determined Contributions (NDCs).</li>
        <li><strong>GHG Inventories</strong> — Providing technical support to countries in developing and improving their national greenhouse gas inventories in line with IPCC guidelines and UNFCCC reporting requirements.</li>
        <li><strong>National Communications</strong> — Assisting countries in preparing National Communications and Biennial Update Reports to the UNFCCC.</li>
        <li><strong>Institutional Capacity-Building & Reskilling</strong> — Strengthening the institutional capacity of environment and climate ministries, academic institutions, and national meteorological agencies to deliver on their climate mandates.</li>
        <li><strong>Integrated Programming for Climate Change</strong> — Supporting multi-sectoral, integrated climate change responses that link mitigation, adaptation, biodiversity, and sustainable development objectives.</li>
        <li><strong>Creation of an Enabling Environment</strong> — Working with governments to establish legal, regulatory, and institutional frameworks that mainstream climate change into national development planning.</li>
      </ul>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Leaf,
    benefits: [
      { icon: Target, title: "NDC & NAP Support", description: "Technical assistance for national climate policy frameworks." },
      { icon: FlaskConical, title: "GHG Inventories", description: "Building national greenhouse gas accounting systems." },
      { icon: Users, title: "Training & Reskilling", description: "Capacity building for climate professionals and institutions." },
      { icon: Globe, title: "UNFCCC Reporting", description: "Support for national communications and biennial reports." }
    ]
  },

  {
    id: "energy",
    title: "Renewable Energy & Just Transition",
    description: "Accelerating Africa's clean energy transition through policy, research, and capacity development.",
    shortDescription: "Supporting Africa's shift to clean, affordable, and reliable energy through evidence-based policy and technical assistance.",
    fullDescription: `
      <p>Access to clean, affordable, and reliable energy is foundational to Africa's sustainable development. Yet, hundreds of millions of Africans still lack access to electricity, and many more rely on harmful biomass fuels for cooking and heating. At the same time, Africa possesses vast renewable energy resources — solar, wind, geothermal, and hydropower — that remain largely untapped.</p>

      <p>ECAS Institute's Renewable Energy & Just Transition programme works to accelerate the continent's shift to clean energy while ensuring that the transition is equitable, inclusive, and leaves no community behind. We provide integrated policy advisory, research, and capacity building services that help governments, development partners, and the private sector drive Africa's energy transformation.</p>

      <h3>Our Focus Areas</h3>
      <ul>
        <li><strong>Energy Policy & Regulatory Frameworks</strong> — Supporting the development of enabling policy and regulatory environments for renewable energy investment and deployment.</li>
        <li><strong>Just Transition Planning</strong> — Advising on strategies to manage the social and economic impacts of the energy transition, particularly for communities dependent on fossil fuel industries.</li>
        <li><strong>Clean Cooking Solutions</strong> — Promoting the adoption of cleaner cooking technologies and fuels to address household energy poverty and reduce deforestation.</li>
        <li><strong>Energy Access Programming</strong> — Designing and evaluating programmes that expand access to modern energy services in underserved areas.</li>
        <li><strong>Climate Finance for Energy</strong> — Building capacity to access international climate finance mechanisms to support renewable energy projects.</li>
        <li><strong>Research & Analysis</strong> — Conducting energy system analyses, market assessments, and feasibility studies to inform investment and policy decisions.</li>
      </ul>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Zap,
    benefits: [
      { icon: TrendingUp, title: "Energy Policy", description: "Enabling regulatory frameworks for clean energy investment." },
      { icon: Shield, title: "Just Transition", description: "Equitable strategies for managing the energy transition." },
      { icon: Users, title: "Capacity Building", description: "Training for energy professionals and policymakers." },
      { icon: Globe, title: "Climate Finance", description: "Access to international financing for clean energy." }
    ]
  },

  {
    id: "sustainable-agriculture-and-food-systems",
    title: "Agriculture & Food Systems",
    description: "Building climate-resilient, sustainable agricultural systems that ensure food security across Africa.",
    shortDescription: "Advancing sustainable agriculture and resilient food systems to ensure food security for Africa's growing population.",
    fullDescription: `
      <p>Agriculture is the backbone of Africa's economy, providing livelihoods for the majority of the continent's population and contributing significantly to GDP. Yet, climate change, environmental degradation, post-harvest losses, and market failures threaten food security across the continent.</p>

      <p>ECAS Institute's Agriculture & Food Systems programme supports the transition to climate-smart, sustainable agricultural systems that enhance productivity, improve livelihoods, and protect ecosystems. We work with governments, farmers' organisations, research institutions, and development partners to generate evidence, build capacity, and develop practical solutions.</p>

      <h3>Our Key Services</h3>
      <ul>
        <li><strong>Climate-Smart Agriculture</strong> — Promoting agricultural practices that increase productivity, build resilience to climate change, and reduce greenhouse gas emissions.</li>
        <li><strong>Food Security Policy</strong> — Supporting the development of national food security strategies, agricultural policies, and investment plans.</li>
        <li><strong>Sustainable Land Management</strong> — Addressing land degradation and promoting sustainable soil health, water management, and agroforestry practices.</li>
        <li><strong>Agri-Food Value Chain Development</strong> — Supporting the development of inclusive, sustainable agri-food value chains that reduce post-harvest losses and improve market access for smallholder farmers.</li>
        <li><strong>Nutrition & Food Systems</strong> — Integrating nutrition-sensitive approaches into food systems programming to address malnutrition and improve dietary diversity.</li>
        <li><strong>Research & Innovation</strong> — Generating evidence on sustainable agricultural technologies, practices, and policies to inform decision-making.</li>
      </ul>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Wheat,
    benefits: [
      { icon: Leaf, title: "Climate-Smart Agriculture", description: "Resilient farming practices for a changing climate." },
      { icon: Target, title: "Food Security Policy", description: "Evidence-based national food security strategies." },
      { icon: TreePine, title: "Sustainable Land Management", description: "Addressing land degradation and soil health." },
      { icon: Users, title: "Smallholder Support", description: "Inclusive value chain development for small farmers." }
    ]
  },

  {
    id: "transport",
    title: "Sustainable Transport & E-Mobility",
    description: "Driving Africa's transition to sustainable, low-carbon transport systems and e-mobility solutions.",
    shortDescription: "Accelerating the shift to sustainable urban mobility, clean transport fuels, and e-mobility across Africa.",
    fullDescription: `
      <p>Transport is one of the fastest-growing sources of greenhouse gas emissions globally, and Africa's rapidly urbanising cities are seeing explosive growth in vehicle fleets. Poorly planned transport systems contribute to air pollution, congestion, road accidents, and social exclusion. Yet, Africa also has a unique opportunity to leapfrog to cleaner, more sustainable mobility solutions.</p>

      <p>ECAS Institute's Sustainable Transport & E-Mobility programme supports African governments, cities, and transport authorities to design and implement transport systems that are clean, safe, accessible, and low-carbon. We provide integrated policy advisory, research, and capacity building services across multiple transport modes.</p>

      <h3>Our Services</h3>
      <ul>
        <li><strong>Sustainable Urban Mobility Planning</strong> — Supporting cities in developing Sustainable Urban Mobility Plans (SUMPs) that integrate public transport, non-motorised transport, and land use planning.</li>
        <li><strong>E-Mobility Policy & Strategy</strong> — Advising governments on enabling policies, standards, and incentives to accelerate electric vehicle adoption and e-mobility infrastructure development.</li>
        <li><strong>Emissions Standards & Fuel Quality</strong> — Supporting the adoption and implementation of vehicle emissions standards and cleaner fuel policies.</li>
        <li><strong>Transport Climate Finance</strong> — Building capacity to access climate finance for sustainable transport projects.</li>
        <li><strong>Non-Motorised Transport (NMT)</strong> — Promoting walking and cycling infrastructure as integral components of sustainable urban transport systems.</li>
        <li><strong>Transport Research & Analysis</strong> — Conducting transport emission inventories, modal shift assessments, and feasibility studies to inform investment decisions.</li>
      </ul>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Truck,
    benefits: [
      { icon: Zap, title: "E-Mobility Policy", description: "Enabling frameworks for electric vehicle adoption." },
      { icon: Globe, title: "Urban Mobility Planning", description: "Sustainable urban mobility plans for African cities." },
      { icon: Shield, title: "Emissions Standards", description: "Supporting cleaner vehicle emissions regulations." },
      { icon: Users, title: "Capacity Building", description: "Training for transport planners and policymakers." }
    ]
  },

  {
    id: "waste-and-circular-economy",
    title: "Waste & Circular Economy",
    description: "Transforming Africa's approach to waste management through circular economy principles and sustainable solutions.",
    shortDescription: "Building sustainable waste management systems and circular economy approaches across African cities and industries.",
    fullDescription: `
      <p>Rapid urbanisation and economic growth are generating unprecedented volumes of waste across African cities. Inadequate waste management systems pose serious public health risks, contribute to environmental pollution, and represent a missed economic opportunity. The shift to a circular economy — where materials are kept in use for as long as possible — offers Africa a transformative pathway to sustainable development.</p>

      <p>ECAS Institute's Waste & Circular Economy programme supports African governments, municipalities, and the private sector to develop and implement sustainable waste management and circular economy solutions. Our integrated approach combines policy support, technical assistance, research, and capacity building.</p>

      <h3>Key Focus Areas</h3>
      <ul>
        <li><strong>Waste Policy & Regulatory Frameworks</strong> — Supporting the development of national and local waste management legislation, regulations, and strategies.</li>
        <li><strong>Circular Economy Strategies</strong> — Advising on circular economy approaches across key sectors including plastics, organics, electronics, and construction materials.</li>
        <li><strong>Extended Producer Responsibility (EPR)</strong> — Supporting the design and implementation of EPR schemes that make producers responsible for end-of-life product management.</li>
        <li><strong>Organic Waste & Composting</strong> — Promoting resource recovery from organic waste through composting, anaerobic digestion, and related technologies.</li>
        <li><strong>Plastic Pollution Solutions</strong> — Providing technical support on reducing single-use plastics, improving plastic waste collection, and promoting alternatives.</li>
        <li><strong>Informal Sector Integration</strong> — Developing strategies to formally integrate the informal waste sector into sustainable waste management systems.</li>
        <li><strong>Waste-to-Energy</strong> — Assessing and advising on appropriate waste-to-energy technologies in the African context.</li>
      </ul>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Recycle,
    benefits: [
      { icon: Target, title: "Circular Economy Policy", description: "Enabling frameworks for circular economy transitions." },
      { icon: Leaf, title: "Organic Waste Recovery", description: "Composting and resource recovery from organic waste." },
      { icon: Shield, title: "Plastic Pollution", description: "Technical support on plastic waste reduction strategies." },
      { icon: Users, title: "Informal Sector Integration", description: "Formalising the informal waste sector." }
    ]
  },

  {
    id: "forests",
    title: "Natural Resources Management",
    description: "Sustainable management of Africa's forests, biodiversity, freshwater, and marine resources.",
    shortDescription: "Protecting and sustainably managing Africa's natural resources — forests, biodiversity, water, and oceans.",
    fullDescription: `
      <p>Africa's natural resources — its forests, biodiversity, freshwater systems, and marine ecosystems — are among the most valuable on earth. They underpin the livelihoods of hundreds of millions of people, support food and water security, regulate the climate, and contribute to economies across the continent. Yet these resources are under intense and growing pressure from deforestation, habitat destruction, overextraction, pollution, and the impacts of climate change.</p>

      <p>ECAS Institute's Natural Resources Management programme supports African governments, communities, and institutions to manage their natural resources sustainably, equitably, and in ways that build long-term resilience.</p>

      <h3>Key Areas of Work</h3>
      <ul>
        <li><strong>Forests, Biodiversity & Ecosystems</strong> — Supporting sustainable forest management, conservation, REDD+ implementation, and biodiversity-related policy and planning.</li>
        <li><strong>Sustainable Mining & Extractives</strong> — Promoting responsible mining practices, environmental impact assessment, and community benefit-sharing in the extractives sector.</li>
        <li><strong>Environment, Migration & Mobility</strong> — Examining the links between environmental degradation, climate change, and human mobility in Africa.</li>
        <li><strong>Freshwater Programme</strong> — Supporting integrated water resources management, transboundary water governance, and water security planning.</li>
        <li><strong>Oceans & Marine Programme</strong> — Promoting sustainable ocean governance, marine conservation, and the blue economy across Africa's coastal and island states.</li>
      </ul>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: TreePine,
    benefits: [
      { icon: TreePine, title: "Forest & Biodiversity", description: "Sustainable forest management and conservation." },
      { icon: Droplet, title: "Freshwater Management", description: "Integrated water resources governance." },
      { icon: Anchor, title: "Marine & Oceans", description: "Blue economy and sustainable coastal governance." },
      { icon: Shield, title: "Sustainable Mining", description: "Responsible extractives and community benefit-sharing." }
    ]
  },

  {
    id: "mining-extractives",
    title: "Sustainable Mining & Extractives",
    description: "Promoting responsible mining, environmental governance, and community benefit-sharing across Africa.",
    shortDescription: "Supporting responsible and sustainable mining practices that protect communities and the environment.",
    fullDescription: `
      <p>Mining and extractive industries play a significant role in Africa's economies, generating revenues, employment, and infrastructure. But poorly governed extractives sectors can also lead to environmental destruction, community displacement, health risks, and conflict.</p>
      <p>ECAS Institute works with governments, mining companies, communities, and civil society to promote responsible, sustainable, and equitable mining practices. Our services span environmental impact assessment, regulatory reform, community engagement, and monitoring of mining impacts.</p>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Anchor,
    benefits: [
      { icon: Shield, title: "Environmental Assessment", description: "Environmental impact assessment for mining projects." },
      { icon: Users, title: "Community Engagement", description: "Facilitating meaningful community participation." },
      { icon: Globe, title: "Regulatory Reform", description: "Strengthening mining governance frameworks." },
      { icon: Target, title: "Benefit Sharing", description: "Equitable distribution of mining revenues." }
    ]
  },

  {
    id: "security-migration",
    title: "Environment, Migration & Mobility",
    description: "Examining the links between environmental degradation, climate change, and human mobility across Africa.",
    shortDescription: "Research and policy advisory on the nexus between environment, climate change, and migration in Africa.",
    fullDescription: `
      <p>The links between environmental change, climate variability, and human mobility are becoming increasingly clear. Droughts, floods, land degradation, and other environmental stressors are key drivers of displacement and migration across Africa. At the same time, migration itself can be a form of adaptation — allowing communities to manage environmental risk and access new livelihood opportunities.</p>
      <p>ECAS Institute conducts research and provides policy advisory services on the environment-migration nexus, helping governments and institutions develop responses that protect the rights and dignity of environmentally displaced people while building long-term community resilience.</p>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Globe,
    benefits: [
      { icon: BookOpen, title: "Research & Analysis", description: "Evidence on drivers of environmental migration." },
      { icon: Target, title: "Policy Advisory", description: "Informing migration and displacement policy." },
      { icon: Shield, title: "Rights-Based Approaches", description: "Protecting rights of environmentally displaced." },
      { icon: Users, title: "Community Resilience", description: "Building long-term adaptive capacity." }
    ]
  },

  {
    id: "water",
    title: "Freshwater Programme",
    description: "Integrated water resources management, transboundary water governance, and water security planning.",
    shortDescription: "Supporting integrated water resources management and water security across Africa.",
    fullDescription: `
      <p>Freshwater is one of Africa's most precious and most threatened resources. Population growth, urbanisation, agricultural expansion, pollution, and climate change are increasing pressure on the continent's rivers, lakes, and groundwater systems. Many communities face water scarcity, poor water quality, and inadequate sanitation.</p>
      <p>ECAS Institute's Freshwater Programme provides technical advisory and capacity building services on integrated water resources management, transboundary water cooperation, water security planning, and watershed management. We support governments, river basin authorities, and local communities in managing their freshwater resources sustainably.</p>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Droplet,
    benefits: [
      { icon: Droplet, title: "IWRM", description: "Integrated water resources management planning." },
      { icon: Globe, title: "Transboundary Governance", description: "Cross-border water sharing agreements." },
      { icon: Shield, title: "Water Security", description: "National and community water security planning." },
      { icon: FlaskConical, title: "Water Quality", description: "Monitoring and improving water quality systems." }
    ]
  },

  {
    id: "oceans-marine",
    title: "Oceans & Marine Programme",
    description: "Sustainable ocean governance, marine conservation, and blue economy development across Africa.",
    shortDescription: "Promoting sustainable management of Africa's ocean and marine resources for long-term benefit.",
    fullDescription: `
      <p>Africa's coastal and island states are custodians of vast ocean territories rich in biodiversity, fisheries, minerals, and potential for blue economy development. Yet marine ecosystems face growing threats from overfishing, pollution, habitat destruction, and climate change impacts including ocean acidification and sea-level rise.</p>
      <p>ECAS Institute supports African coastal states in developing sustainable ocean governance frameworks, marine spatial planning, fisheries management strategies, and blue economy development plans that balance economic opportunity with conservation.</p>
    `,
    image: "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg",
    icon: Anchor,
    benefits: [
      { icon: Anchor, title: "Marine Governance", description: "Sustainable ocean governance frameworks." },
      { icon: Globe, title: "Blue Economy", description: "Sustainable marine economic development." },
      { icon: Shield, title: "Marine Conservation", description: "Protecting marine biodiversity and habitats." },
      { icon: Users, title: "Coastal Communities", description: "Supporting sustainable coastal livelihoods." }
    ]
  }
];

