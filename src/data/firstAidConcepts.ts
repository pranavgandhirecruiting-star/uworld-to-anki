export interface FirstAidConcept {
  concept: string;
  keywords: string[];
  summary: string;
  system: string;
  highYield: string;
}

export const FIRST_AID_CONCEPTS: FirstAidConcept[] = [
  // ── Cardiology ──
  {
    concept: "ST-Elevation Myocardial Infarction (STEMI)",
    keywords: ["STEMI", "myocardial infarction", "troponin", "ST elevation", "coronary artery", "chest pain", "MI"],
    summary: "Transmural myocardial necrosis caused by complete coronary artery occlusion. Presents with crushing chest pain, ST elevation on ECG, and elevated troponins. Treated with emergent PCI or thrombolytics.",
    system: "Cardiology",
    highYield: "LAD occlusion causes anterior wall MI (leads V1-V4); RCA occlusion causes inferior MI (leads II, III, aVF). Posterior MI is often missed — look for ST depression in V1-V3."
  },
  {
    concept: "Heart Failure Classification",
    keywords: ["heart failure", "HFrEF", "HFpEF", "systolic", "diastolic", "ejection fraction", "BNP", "CHF"],
    summary: "HFrEF (systolic, EF < 40%) involves impaired contractility; HFpEF (diastolic, EF >= 50%) involves impaired relaxation. Both cause pulmonary and peripheral congestion. BNP is elevated in both.",
    system: "Cardiology",
    highYield: "HFrEF treatment: ACE inhibitor + beta-blocker + spironolactone + hydralazine/nitrate (if Black). HFpEF treatment: diuretics and treat underlying cause. Don't confuse preserved EF with normal heart function."
  },
  {
    concept: "Aortic Stenosis",
    keywords: ["aortic stenosis", "systolic murmur", "crescendo-decrescendo", "calcific", "bicuspid aortic valve", "syncope"],
    summary: "Most common valvular disease in the elderly, caused by calcific degeneration (or bicuspid valve in younger patients). Produces a harsh crescendo-decrescendo systolic murmur at the right upper sternal border radiating to carotids.",
    system: "Cardiology",
    highYield: "Classic triad: syncope, angina, dyspnea on exertion. Pulsus parvus et tardus (weak, delayed pulse). Exercise stress testing is contraindicated in symptomatic severe AS."
  },
  {
    concept: "Atrial Fibrillation",
    keywords: ["atrial fibrillation", "afib", "irregular rhythm", "anticoagulation", "CHA2DS2-VASc", "rate control"],
    summary: "Most common sustained arrhythmia. Characterized by irregularly irregular rhythm with absent P waves on ECG. Major risk is stroke from atrial thrombus formation (especially left atrial appendage).",
    system: "Cardiology",
    highYield: "CHA2DS2-VASc score determines anticoagulation need. Rate control (beta-blockers, CCBs) is first-line for most patients. Rhythm control if symptomatic despite rate control."
  },
  {
    concept: "Hypertrophic Cardiomyopathy (HCM)",
    keywords: ["HCM", "hypertrophic cardiomyopathy", "IHSS", "outflow obstruction", "sudden cardiac death", "asymmetric septal hypertrophy"],
    summary: "Autosomal dominant mutation in sarcomere proteins (most commonly beta-myosin heavy chain). Causes asymmetric septal hypertrophy with or without LVOT obstruction. Leading cause of sudden cardiac death in young athletes.",
    system: "Cardiology",
    highYield: "Murmur increases with Valsalva and standing (decreased preload). Decreases with squatting and leg elevation. Avoid dehydration, diuretics, and afterload reduction. Treat with beta-blockers."
  },

  // ── Renal ──
  {
    concept: "Nephrotic Syndrome",
    keywords: ["nephrotic", "proteinuria", "albumin", "edema", "hyperlipidemia", "minimal change disease", "membranous nephropathy", "focal segmental"],
    summary: "Defined by massive proteinuria (>3.5 g/day), hypoalbuminemia, edema, hyperlipidemia, and lipiduria. Major causes: minimal change disease (children), membranous nephropathy (adults), focal segmental glomerulosclerosis (adults/HIV).",
    system: "Renal",
    highYield: "Minimal change disease shows podocyte effacement on EM with no light microscopy changes — responds to corticosteroids. Membranous shows subepithelial deposits (spike and dome pattern). FSGS shows segmental sclerosis and is the most common cause in adults overall."
  },
  {
    concept: "Nephritic Syndrome",
    keywords: ["nephritic", "hematuria", "RBC casts", "glomerulonephritis", "IgA nephropathy", "post-streptococcal", "RPGN", "crescentic"],
    summary: "Characterized by hematuria (RBC casts), mild proteinuria (<3.5 g/day), hypertension, and oliguria. Caused by inflammatory damage to glomeruli. IgA nephropathy is the most common worldwide.",
    system: "Renal",
    highYield: "IgA nephropathy: episodic gross hematuria 1-2 days after URI (synpharyngitic). Post-streptococcal: hematuria 2-3 weeks after pharyngitis/skin infection with low C3. RPGN with crescents is an emergency."
  },
  {
    concept: "Acute Kidney Injury (AKI)",
    keywords: ["AKI", "acute kidney injury", "prerenal", "intrarenal", "postrenal", "ATN", "BUN creatinine ratio", "FENa"],
    summary: "Prerenal (decreased perfusion, BUN:Cr > 20, FENa < 1%), intrarenal (ATN is most common, muddy brown casts, FENa > 2%), and postrenal (obstruction). ATN caused by ischemia or nephrotoxins.",
    system: "Renal",
    highYield: "FENa < 1% = prerenal (kidneys avidly reabsorbing sodium). FENa > 2% = intrinsic renal (tubules damaged, can't reabsorb). Exception: contrast nephropathy and myoglobinuria have low FENa despite being intrinsic."
  },
  {
    concept: "Renal Tubular Acidosis (RTA)",
    keywords: ["RTA", "renal tubular acidosis", "type 1", "type 2", "type 4", "non-anion gap metabolic acidosis", "hyperkalemia"],
    summary: "Non-anion gap metabolic acidosis from defective renal acid handling. Type 1 (distal): can't secrete H+, urine pH > 5.5. Type 2 (proximal): can't reabsorb HCO3. Type 4: hypoaldosteronism causing hyperkalemia.",
    system: "Renal",
    highYield: "Type 1 has hypokalemia and is associated with kidney stones and nephrocalcinosis. Type 4 is the only RTA with hyperkalemia — most common RTA in adults, often from diabetic nephropathy."
  },

  // ── Pulmonology ──
  {
    concept: "Pulmonary Embolism",
    keywords: ["PE", "pulmonary embolism", "DVT", "D-dimer", "CT angiography", "Wells score", "tachycardia", "saddle embolus"],
    summary: "Thrombus (usually from DVT in deep leg veins) travels to pulmonary vasculature. Presents with acute-onset dyspnea, tachycardia, pleuritic chest pain. Diagnosed with CT pulmonary angiography. D-dimer used to rule out in low-probability cases.",
    system: "Pulmonology",
    highYield: "Most common ECG finding is sinus tachycardia (not S1Q3T3). ABG shows respiratory alkalosis. Massive PE with hemodynamic instability requires tPA thrombolytics. Virchow's triad: stasis, endothelial injury, hypercoagulability."
  },
  {
    concept: "COPD (Chronic Obstructive Pulmonary Disease)",
    keywords: ["COPD", "emphysema", "chronic bronchitis", "FEV1", "obstructive", "barrel chest", "pink puffer", "blue bloater"],
    summary: "Irreversible airflow obstruction. Emphysema: destruction of alveolar walls (decreased DLCO, pink puffer). Chronic bronchitis: productive cough >= 3 months/year for 2 years (blue bloater). FEV1/FVC ratio < 0.7.",
    system: "Pulmonology",
    highYield: "Emphysema shows decreased DLCO (destroyed alveolar surface area). Chronic bronchitis has normal DLCO. Smoking cessation is the ONLY intervention proven to slow FEV1 decline. Use supplemental O2 if PaO2 < 55 mmHg."
  },
  {
    concept: "Asthma",
    keywords: ["asthma", "bronchospasm", "wheezing", "reversible obstruction", "inhaled corticosteroid", "albuterol", "eosinophils"],
    summary: "Reversible airway obstruction with airway hyperresponsiveness and chronic inflammation. Type 1 hypersensitivity with eosinophilic infiltration, smooth muscle hypertrophy, and mucus plugging. FEV1/FVC improves with bronchodilators.",
    system: "Pulmonology",
    highYield: "Short-acting beta-agonist (albuterol) for acute rescue. Inhaled corticosteroids are first-line controller therapy. Curschmann spirals (mucus casts) and Charcot-Leyden crystals (eosinophil breakdown) on sputum."
  },
  {
    concept: "Pneumonia",
    keywords: ["pneumonia", "community acquired", "lobar pneumonia", "atypical pneumonia", "Streptococcus pneumoniae", "Mycoplasma", "Legionella"],
    summary: "Infection of lung parenchyma. Typical (S. pneumoniae #1): acute onset, productive cough, lobar consolidation. Atypical (Mycoplasma, Chlamydophila, Legionella): insidious onset, dry cough, diffuse interstitial pattern.",
    system: "Pulmonology",
    highYield: "S. pneumoniae is #1 cause of CAP in all age groups. Legionella: contaminated water, GI symptoms, hyponatremia. Mycoplasma: young adults, walking pneumonia, cold agglutinins. Klebsiella: alcoholics, currant jelly sputum."
  },
  {
    concept: "ARDS (Acute Respiratory Distress Syndrome)",
    keywords: ["ARDS", "acute respiratory distress", "diffuse alveolar damage", "bilateral infiltrates", "PEEP", "non-cardiogenic pulmonary edema"],
    summary: "Diffuse alveolar damage from inflammatory insult (sepsis, aspiration, trauma). Bilateral pulmonary infiltrates with PaO2/FiO2 <= 300 and non-cardiogenic pulmonary edema (PCWP <= 18). Hyaline membrane formation.",
    system: "Pulmonology",
    highYield: "Treat with low tidal volume ventilation (6 mL/kg) and PEEP. Distinguish from cardiogenic pulmonary edema by normal PCWP. Most common cause is sepsis."
  },

  // ── GI ──
  {
    concept: "Inflammatory Bowel Disease (Crohn vs UC)",
    keywords: ["IBD", "Crohn", "ulcerative colitis", "transmural", "skip lesions", "bloody diarrhea", "fistula", "granulomas"],
    summary: "Crohn disease: transmural inflammation, skip lesions, mouth-to-anus (commonly terminal ileum), non-caseating granulomas, fistulas, strictures. UC: mucosal/submucosal inflammation, continuous from rectum, bloody diarrhea, pseudopolyps.",
    system: "GI",
    highYield: "Crohn has cobblestone mucosa, string sign on barium, and creeping fat. UC increases risk of colorectal cancer (start surveillance colonoscopy at 8 years). Toxic megacolon is a feared complication of UC."
  },
  {
    concept: "Hepatitis B Serology",
    keywords: ["hepatitis B", "HBsAg", "anti-HBs", "anti-HBc", "HBeAg", "window period", "hepatitis B serology"],
    summary: "HBsAg = active infection. Anti-HBs = immunity (vaccination or resolved). Anti-HBc IgM = acute infection. Anti-HBc IgG = past exposure. HBeAg = high infectivity and viral replication.",
    system: "GI",
    highYield: "Window period: HBsAg cleared but anti-HBs not yet detectable — only anti-HBc IgM is positive. Vaccination produces anti-HBs ONLY (no anti-HBc). Resolved infection shows anti-HBs + anti-HBc IgG."
  },
  {
    concept: "Acute Pancreatitis",
    keywords: ["pancreatitis", "lipase", "amylase", "gallstones", "alcohol", "fat necrosis", "saponification", "Ranson criteria"],
    summary: "Most commonly caused by gallstones (#1) or alcohol (#2). Autodigestion by pancreatic enzymes causes severe epigastric pain radiating to back. Lipase is more specific than amylase. Can cause fat necrosis with saponification (chalky white deposits).",
    system: "GI",
    highYield: "Lipase > 3x upper limit of normal is diagnostic. Calcium deposits from fat necrosis (saponification) can cause hypocalcemia. Cullen sign (periumbilical bruising) and Grey Turner sign (flank bruising) indicate hemorrhagic pancreatitis."
  },
  {
    concept: "Liver Cirrhosis Complications",
    keywords: ["cirrhosis", "portal hypertension", "ascites", "varices", "hepatorenal syndrome", "hepatic encephalopathy", "SBP"],
    summary: "End-stage fibrosis disrupts hepatic architecture causing portal hypertension. Leads to ascites, esophageal varices, splenomegaly, caput medusae. Hepatic encephalopathy from ammonia accumulation. Hepatorenal syndrome from renal vasoconstriction.",
    system: "GI",
    highYield: "SBP diagnosed by ascitic fluid PMN > 250 cells/mm3 — treat with ceftriaxone. SAAG >= 1.1 = portal hypertension. Lactulose and rifaximin for hepatic encephalopathy. Varices: nonselective beta-blockers (propranolol) for prophylaxis."
  },
  {
    concept: "Celiac Disease",
    keywords: ["celiac", "gluten", "gliadin", "anti-tTG", "anti-endomysial", "villous atrophy", "dermatitis herpetiformis", "malabsorption"],
    summary: "Autoimmune reaction to gliadin (gluten component) in genetically susceptible individuals (HLA-DQ2/DQ8). Causes villous atrophy and crypt hyperplasia in small bowel. Malabsorption leads to iron deficiency anemia, osteoporosis, and steatorrhea.",
    system: "GI",
    highYield: "Anti-tissue transglutaminase (anti-tTG) IgA is the best screening test. Anti-endomysial antibodies are most specific. Associated with dermatitis herpetiformis (pruritic vesicles on extensor surfaces). Increased risk of T-cell lymphoma."
  },

  // ── Endocrine ──
  {
    concept: "Diabetes Mellitus Type 1 vs Type 2",
    keywords: ["diabetes", "DM1", "DM2", "insulin", "HbA1c", "DKA", "metabolic syndrome", "C-peptide"],
    summary: "Type 1: autoimmune destruction of beta cells (anti-GAD, anti-islet cell antibodies), insulin-dependent, presents with DKA. Type 2: insulin resistance then beta-cell failure, associated with obesity and metabolic syndrome.",
    system: "Endocrine",
    highYield: "DKA = type 1 emergency (high glucose, anion gap metabolic acidosis, ketones, fruity breath). HHS = type 2 emergency (extreme hyperglycemia > 600, hyperosmolarity, no significant ketosis). C-peptide is low in type 1, high/normal in type 2."
  },
  {
    concept: "Thyroid Disorders",
    keywords: ["hypothyroidism", "hyperthyroidism", "Hashimoto", "Graves", "TSH", "T4", "thyroid", "anti-TPO", "thyroid storm"],
    summary: "Hypothyroid: fatigue, weight gain, cold intolerance, constipation (Hashimoto = most common cause, anti-TPO antibodies). Hyperthyroid: weight loss, heat intolerance, tremor, tachycardia (Graves = most common, TSI antibodies, exophthalmos).",
    system: "Endocrine",
    highYield: "In primary hypothyroidism: TSH is HIGH, T4 is LOW. In Graves disease: TSH is LOW, T4 is HIGH. Subacute thyroiditis (de Quervain): painful thyroid after viral illness, self-limiting with transient hyperthyroid then hypothyroid phase."
  },
  {
    concept: "Cushing Syndrome",
    keywords: ["Cushing", "cortisol", "dexamethasone suppression", "ACTH", "adrenal", "moon facies", "buffalo hump", "striae"],
    summary: "Excess cortisol from exogenous steroids (most common), pituitary adenoma (Cushing disease), ectopic ACTH (small cell lung cancer), or adrenal tumor. Presents with central obesity, moon facies, buffalo hump, purple striae, hyperglycemia.",
    system: "Endocrine",
    highYield: "24-hour urine free cortisol or overnight dexamethasone suppression test for screening. If ACTH is low, the source is adrenal. If ACTH is high, do high-dose dexamethasone test: suppression = pituitary; no suppression = ectopic."
  },
  {
    concept: "Addison Disease (Primary Adrenal Insufficiency)",
    keywords: ["Addison", "adrenal insufficiency", "cortisol", "aldosterone", "hyperpigmentation", "ACTH stimulation", "adrenal crisis"],
    summary: "Destruction of adrenal cortex (autoimmune #1 in developed countries, TB #1 worldwide). Deficiency of cortisol AND aldosterone. Presents with hyperpigmentation, hypotension, hyperkalemia, hyponatremia.",
    system: "Endocrine",
    highYield: "Hyperpigmentation is due to elevated ACTH (which shares precursor POMC with MSH). ACTH stimulation test: cortisol fails to rise. Adrenal crisis is a medical emergency — treat with IV hydrocortisone and fluids."
  },
  {
    concept: "Pheochromocytoma",
    keywords: ["pheochromocytoma", "catecholamines", "episodic hypertension", "headache", "diaphoresis", "VMA", "metanephrines", "MEN2"],
    summary: "Catecholamine-secreting tumor of adrenal medulla (chromaffin cells). Rule of 10s: 10% bilateral, 10% extra-adrenal, 10% malignant, 10% familial. Episodic hypertension, headache, sweating, palpitations.",
    system: "Endocrine",
    highYield: "Diagnose with 24-hour urine metanephrines and VMA, or plasma free metanephrines. Must give alpha-blocker (phenoxybenzamine) BEFORE beta-blocker to prevent hypertensive crisis. Associated with MEN 2A/2B, VHL, NF1."
  },
  {
    concept: "SIADH vs Diabetes Insipidus",
    keywords: ["SIADH", "diabetes insipidus", "ADH", "hyponatremia", "hypernatremia", "water deprivation test", "desmopressin"],
    summary: "SIADH: excess ADH causes water retention, dilutional hyponatremia, concentrated urine, euvolemic. DI: insufficient ADH action causes dilute polyuria and hypernatremia. Central DI (no ADH production) vs nephrogenic DI (kidneys resist ADH).",
    system: "Endocrine",
    highYield: "Water deprivation test: central DI responds to desmopressin (urine concentrates), nephrogenic DI does not. SIADH treatment: fluid restriction, salt tabs, or tolvaptan (V2 receptor antagonist). Correct sodium slowly to avoid central pontine myelinolysis."
  },

  // ── Heme/Onc ──
  {
    concept: "Iron Deficiency Anemia",
    keywords: ["iron deficiency", "microcytic anemia", "ferritin", "TIBC", "iron studies", "koilonychia", "pica"],
    summary: "Most common anemia worldwide. Microcytic, hypochromic with low ferritin, low serum iron, high TIBC, low transferrin saturation. Causes: chronic blood loss (GI in men/postmenopausal women, menstruation in premenopausal women), poor intake.",
    system: "Heme/Onc",
    highYield: "Ferritin is the first lab to drop and most sensitive test. Low ferritin is virtually diagnostic. TIBC is elevated because the liver makes more transferrin to capture scarce iron. Plummer-Vinson syndrome: iron deficiency + esophageal webs + dysphagia."
  },
  {
    concept: "Sickle Cell Disease",
    keywords: ["sickle cell", "HbS", "vasoocclusive crisis", "splenic sequestration", "acute chest syndrome", "hemoglobin S", "dactylitis"],
    summary: "Autosomal recessive point mutation in beta-globin (Glu to Val at position 6). HbS polymerizes under low O2, causing RBC sickling, hemolysis, and vasoocclusion. Functional asplenia by age 5 from repeated splenic infarcts.",
    system: "Heme/Onc",
    highYield: "Acute chest syndrome (fever + new infiltrate + respiratory symptoms) is the #1 cause of death. Functional asplenia increases risk of encapsulated organisms (S. pneumoniae, H. influenzae). Hydroxyurea increases HbF and reduces crises."
  },
  {
    concept: "Disseminated Intravascular Coagulation (DIC)",
    keywords: ["DIC", "disseminated intravascular coagulation", "fibrin split products", "D-dimer", "schistocytes", "consumptive coagulopathy"],
    summary: "Widespread activation of coagulation cascade consumes clotting factors and platelets, leading to simultaneous thrombosis and hemorrhage. Triggered by sepsis, trauma, obstetric complications, malignancy. Lab: increased PT, PTT, D-dimer; decreased fibrinogen, platelets.",
    system: "Heme/Onc",
    highYield: "Schistocytes (fragmented RBCs) on peripheral smear from microangiopathic hemolytic anemia. D-dimer is elevated (fibrin degradation). Treat the underlying cause. Fresh frozen plasma and cryoprecipitate to replace factors."
  },
  {
    concept: "Acute Myeloid Leukemia (AML)",
    keywords: ["AML", "acute myeloid leukemia", "Auer rods", "myeloperoxidase", "t(15;17)", "APL", "DIC", "blasts"],
    summary: "Malignant proliferation of myeloid blasts (> 20% blasts in bone marrow). Auer rods (crystallized MPO) are pathognomonic. Most common acute leukemia in adults. Presents with pancytopenia symptoms: fatigue, infections, bleeding.",
    system: "Heme/Onc",
    highYield: "APL subtype [t(15;17) PML-RARA] is associated with DIC but has excellent prognosis with all-trans retinoic acid (ATRA) + arsenic trioxide. Auer rods are seen in myeloblasts on peripheral smear or bone marrow biopsy."
  },
  {
    concept: "Hodgkin Lymphoma",
    keywords: ["Hodgkin", "Reed-Sternberg", "lymphoma", "bimodal", "B symptoms", "mediastinal mass", "owl eye cells"],
    summary: "Malignant lymphoma characterized by Reed-Sternberg cells (large binucleated cells with owl-eye nuclei, CD15+/CD30+). Bimodal age distribution (20s and 60s). Typically presents with painless cervical lymphadenopathy and mediastinal mass.",
    system: "Heme/Onc",
    highYield: "B symptoms (fever, night sweats, weight loss > 10%) indicate worse prognosis. Contiguous lymph node spread (unlike non-Hodgkin). ABVD chemotherapy is standard. Association with EBV."
  },
  {
    concept: "Heparin-Induced Thrombocytopenia (HIT)",
    keywords: ["HIT", "heparin", "thrombocytopenia", "PF4 antibodies", "thrombosis", "serotonin release assay"],
    summary: "Type II HIT: IgG antibodies against heparin-PF4 complexes activate platelets, causing thrombocytopenia AND paradoxical thrombosis. Occurs 5-10 days after heparin exposure. Platelet count drops > 50% from baseline.",
    system: "Heme/Onc",
    highYield: "HIT causes thrombosis, not bleeding, despite low platelets. Stop all heparin immediately and start a direct thrombin inhibitor (argatroban or bivalirudin). Never give heparin again. Do NOT transfuse platelets (fuels thrombosis)."
  },

  // ── Neurology ──
  {
    concept: "Ischemic Stroke Syndromes",
    keywords: ["stroke", "ischemic stroke", "MCA", "ACA", "PCA", "lacunar", "tPA", "NIHSS"],
    summary: "MCA stroke: contralateral face/arm weakness > leg, aphasia (dominant hemisphere), neglect (non-dominant). ACA: contralateral leg weakness > arm. PCA: contralateral homonymous hemianopia. Lacunar: pure motor or pure sensory.",
    system: "Neurology",
    highYield: "tPA can be given within 4.5 hours of symptom onset. MCA is the most commonly occluded artery. Wernicke aphasia (superior temporal gyrus): fluent but nonsensical speech. Broca aphasia (inferior frontal gyrus): non-fluent, intact comprehension."
  },
  {
    concept: "Multiple Sclerosis",
    keywords: ["multiple sclerosis", "MS", "demyelination", "oligoclonal bands", "optic neuritis", "Uhthoff phenomenon", "relapsing-remitting"],
    summary: "Autoimmune demyelination of CNS white matter. Relapsing-remitting is most common form. Classically affects young women. Symptoms separated in space and time. MRI shows periventricular white matter lesions (Dawson fingers).",
    system: "Neurology",
    highYield: "Oligoclonal bands in CSF (IgG). Optic neuritis is often the first symptom (painful vision loss). Uhthoff phenomenon: symptoms worsen with heat. Internuclear ophthalmoplegia (MLF lesion) is highly suggestive of MS in a young patient."
  },
  {
    concept: "Seizure Types and Epilepsy",
    keywords: ["seizure", "epilepsy", "tonic-clonic", "absence", "focal", "status epilepticus", "anticonvulsant"],
    summary: "Focal seizures: one hemisphere (simple = aware, complex = impaired awareness). Generalized: both hemispheres (tonic-clonic, absence, myoclonic, atonic). Status epilepticus: seizure > 5 minutes or repeated without recovery.",
    system: "Neurology",
    highYield: "Absence seizures: 3 Hz spike-and-wave on EEG, staring spells in children, treated with ethosuximide. Status epilepticus: IV benzodiazepine (lorazepam) first-line, then fosphenytoin. Carbamazepine can worsen absence seizures."
  },
  {
    concept: "Guillain-Barre Syndrome",
    keywords: ["Guillain-Barre", "GBS", "ascending paralysis", "albuminocytologic dissociation", "demyelination", "Campylobacter", "AIDP"],
    summary: "Acute inflammatory demyelinating polyneuropathy. Ascending symmetric paralysis starting in legs, often following GI infection (Campylobacter jejuni). CSF shows albuminocytologic dissociation (elevated protein, normal cell count).",
    system: "Neurology",
    highYield: "Respiratory failure is the most dangerous complication — monitor FVC. Treat with IVIG or plasmapheresis. Reflexes are absent (LMN pattern). Distinguished from myasthenia gravis by ascending pattern and areflexia."
  },
  {
    concept: "Parkinson Disease",
    keywords: ["Parkinson", "dopamine", "substantia nigra", "resting tremor", "bradykinesia", "rigidity", "Lewy bodies"],
    summary: "Loss of dopaminergic neurons in substantia nigra pars compacta. Cardinal features: resting tremor (pill-rolling), bradykinesia, cogwheel rigidity, postural instability. Lewy bodies (alpha-synuclein inclusions) on pathology.",
    system: "Neurology",
    highYield: "Bradykinesia is the most important feature for diagnosis. Levodopa/carbidopa is the most effective treatment. Long-term levodopa causes on-off phenomenon and dyskinesias. Carbidopa prevents peripheral conversion of levodopa to dopamine."
  },

  // ── Infectious Disease ──
  {
    concept: "Tuberculosis",
    keywords: ["tuberculosis", "TB", "Mycobacterium", "AFB", "granuloma", "caseating", "PPD", "Ghon complex", "RIPE"],
    summary: "Mycobacterium tuberculosis. Primary TB: Ghon focus (lower lobe) + hilar lymph node = Ghon complex, usually asymptomatic. Reactivation TB: upper lobe cavitary lesion, night sweats, weight loss, hemoptysis. Caseating granulomas on pathology.",
    system: "Infectious Disease",
    highYield: "RIPE therapy: Rifampin (hepatotoxic, red body fluids, P450 inducer), Isoniazid (hepatotoxic, peripheral neuropathy — give B6), Pyrazinamide (hepatotoxic, hyperuricemia), Ethambutol (optic neuritis). PPD tests for latent infection."
  },
  {
    concept: "HIV/AIDS",
    keywords: ["HIV", "AIDS", "CD4", "viral load", "opportunistic infections", "antiretroviral", "PJP", "Kaposi sarcoma"],
    summary: "Retrovirus targeting CD4+ T cells. AIDS defined by CD4 < 200 or AIDS-defining illness. Screen with HIV Ab/Ag combo test, confirm with differentiation assay. Treat with combination ART (typically 2 NRTIs + integrase inhibitor).",
    system: "Infectious Disease",
    highYield: "CD4 < 200: PJP prophylaxis (TMP-SMX), Pneumocystis pneumonia (ground-glass on CXR). CD4 < 100: Toxoplasma (ring-enhancing lesions), Cryptococcus (meningitis, India ink). CD4 < 50: MAC, CMV retinitis."
  },
  {
    concept: "Meningitis",
    keywords: ["meningitis", "CSF", "bacterial", "viral", "Neisseria meningitidis", "Streptococcus pneumoniae", "Kernig", "Brudzinski"],
    summary: "Bacterial: high WBC (neutrophils), high protein, low glucose. Viral: lymphocytes, normal glucose, mildly elevated protein. Neonates: Group B Strep, E. coli, Listeria. Adults: S. pneumoniae (#1), N. meningitidis (#2).",
    system: "Infectious Disease",
    highYield: "Empiric treatment for bacterial meningitis: ceftriaxone + vancomycin (+ ampicillin if neonatal or >50 years for Listeria). Give dexamethasone before antibiotics to reduce inflammation. N. meningitidis: waterhouse-Friderichsen syndrome (adrenal hemorrhage)."
  },
  {
    concept: "Endocarditis",
    keywords: ["endocarditis", "vegetations", "Streptococcus viridans", "Staphylococcus aureus", "Duke criteria", "Janeway lesions", "Osler nodes"],
    summary: "Infection of heart valve endocardium. Acute: S. aureus (native valve, IVDU — tricuspid). Subacute: Streptococcus viridans (previously damaged valve). Duke criteria: 2 major, 1 major + 3 minor, or 5 minor.",
    system: "Infectious Disease",
    highYield: "Janeway lesions: painless erythematous lesions on palms/soles (septic emboli). Osler nodes: painful nodules on fingers/toes (immune complexes). Roth spots: retinal hemorrhages. IVDU endocarditis typically affects tricuspid valve."
  },
  {
    concept: "Clostridium difficile Infection",
    keywords: ["C. difficile", "C. diff", "pseudomembranous colitis", "antibiotic-associated diarrhea", "toxin A", "toxin B", "fidaxomicin"],
    summary: "Toxin-producing anaerobe causing antibiotic-associated diarrhea and pseudomembranous colitis. Most commonly follows fluoroquinolone, clindamycin, or broad-spectrum antibiotic use. Toxin B is more pathogenic.",
    system: "Infectious Disease",
    highYield: "Diagnose with stool PCR or toxin assay. First episode: oral vancomycin or fidaxomicin (NOT IV vancomycin, which doesn't reach the gut lumen). Recurrent: fidaxomicin or fecal microbiota transplant. Metronidazole is no longer first-line."
  },

  // ── Pharmacology ──
  {
    concept: "ACE Inhibitors and ARBs",
    keywords: ["ACE inhibitor", "ARB", "lisinopril", "losartan", "cough", "angioedema", "hyperkalemia", "renal artery stenosis"],
    summary: "ACE inhibitors block angiotensin-converting enzyme, reducing angiotensin II and aldosterone. First-line for HTN with diabetes, HFrEF, or proteinuria. ARBs block AT1 receptor — used when ACE-I causes cough.",
    system: "Pharmacology",
    highYield: "ACE inhibitor cough is from increased bradykinin (ACE normally degrades bradykinin). Angioedema is a rare but serious side effect. Contraindicated in bilateral renal artery stenosis (kidneys depend on efferent arteriole constriction by angiotensin II) and pregnancy."
  },
  {
    concept: "Beta-Blockers",
    keywords: ["beta blocker", "metoprolol", "propranolol", "atenolol", "carvedilol", "beta-1", "beta-2"],
    summary: "Block beta-adrenergic receptors. Beta-1 selective (metoprolol, atenolol): heart effects (decreased HR, contractility). Non-selective (propranolol): also block beta-2 (bronchospasm risk). Used for HTN, HF, arrhythmias, migraine prophylaxis.",
    system: "Pharmacology",
    highYield: "Avoid non-selective beta-blockers in asthma/COPD (beta-2 blockade causes bronchospasm). Can mask hypoglycemia symptoms in diabetics. Propranolol is lipophilic (crosses BBB — used for performance anxiety, essential tremor). Never abruptly discontinue — risk of rebound tachycardia."
  },
  {
    concept: "Warfarin and Heparin",
    keywords: ["warfarin", "heparin", "anticoagulation", "INR", "PTT", "vitamin K", "protamine", "coumadin"],
    summary: "Warfarin: oral, inhibits vitamin K-dependent clotting factors (II, VII, IX, X, protein C and S). Monitored by PT/INR. Heparin: IV/SQ, potentiates antithrombin III. Monitored by PTT (unfractionated) or anti-Xa (LMWH).",
    system: "Pharmacology",
    highYield: "Warfarin has initial prothrombotic effect (protein C has shortest half-life, so it drops first before the clotting factors). Bridge with heparin at initiation. Warfarin reversal: vitamin K + FFP (or PCC for emergencies). Heparin reversal: protamine sulfate."
  },
  {
    concept: "Statins",
    keywords: ["statin", "HMG-CoA reductase", "atorvastatin", "rosuvastatin", "rhabdomyolysis", "LDL", "cholesterol"],
    summary: "Inhibit HMG-CoA reductase (rate-limiting step in cholesterol synthesis), upregulating hepatic LDL receptors. Most effective drugs for lowering LDL cholesterol. Also have pleiotropic effects (anti-inflammatory, plaque stabilization).",
    system: "Pharmacology",
    highYield: "Side effects: hepatotoxicity (check LFTs), myopathy/rhabdomyolysis (check CK if muscle pain). Risk of rhabdomyolysis increases with fibrates or CYP3A4 inhibitors. Contraindicated in pregnancy (cholesterol needed for fetal development)."
  },
  {
    concept: "Opioid Pharmacology",
    keywords: ["opioid", "morphine", "fentanyl", "naloxone", "mu receptor", "respiratory depression", "constipation"],
    summary: "Mu-receptor agonists produce analgesia, euphoria, respiratory depression, miosis, constipation, and decreased GI motility. Morphine also causes histamine release (itching, hypotension). Fentanyl is 100x more potent than morphine.",
    system: "Pharmacology",
    highYield: "Naloxone (IV) reverses opioid overdose — short half-life may require repeated dosing. Constipation is the one side effect to which tolerance does NOT develop. Methadone and buprenorphine used for opioid use disorder maintenance therapy."
  },

  // ── Pathology ──
  {
    concept: "Necrosis Types",
    keywords: ["necrosis", "coagulative", "liquefactive", "caseous", "fat necrosis", "fibrinoid", "gangrenous"],
    summary: "Coagulative: most common, ischemic (preserves tissue architecture). Liquefactive: brain infarcts and abscesses (enzymatic digestion). Caseous: TB granulomas (cheese-like). Fat: pancreatitis, breast trauma (saponification). Fibrinoid: vasculitis, malignant HTN.",
    system: "Pathology",
    highYield: "Brain is the only organ where ischemia causes liquefactive (not coagulative) necrosis. Gangrenous necrosis is coagulative necrosis of a limb. Wet gangrene = superimposed liquefactive from bacterial infection."
  },
  {
    concept: "Inflammation Mediators",
    keywords: ["inflammation", "prostaglandins", "leukotrienes", "histamine", "complement", "TNF-alpha", "IL-1", "bradykinin"],
    summary: "Acute inflammation: vasodilation (histamine, prostaglandins), increased permeability (histamine, bradykinin, C3a/C5a), and leukocyte recruitment (LTB4, C5a, IL-8). TNF-alpha and IL-1 cause fever and acute phase reactants.",
    system: "Pathology",
    highYield: "LTB4 = neutrophil chemotaxis. C5a = neutrophil chemotaxis + mast cell degranulation. IL-8 = neutrophil chemotaxis (CXC chemokine). COX inhibitors (NSAIDs) block prostaglandins but shunt to leukotriene pathway — important in aspirin-exacerbated respiratory disease."
  },
  {
    concept: "Neoplasia Concepts",
    keywords: ["neoplasia", "tumor suppressor", "oncogene", "p53", "Rb", "metastasis", "paraneoplastic", "tumor markers"],
    summary: "Oncogenes: gain of function (one allele sufficient) — RAS, MYC, HER2. Tumor suppressors: loss of function (both alleles needed — Knudson two-hit) — p53, Rb, APC, BRCA. p53 is the most commonly mutated gene in human cancers.",
    system: "Pathology",
    highYield: "p53 (guardian of the genome): induces G1 arrest, apoptosis, and DNA repair. Li-Fraumeni syndrome: germline p53 mutation causing multiple early cancers. Rb controls G1-to-S checkpoint. Loss of Rb causes retinoblastoma and osteosarcoma."
  },
  {
    concept: "Amyloidosis",
    keywords: ["amyloidosis", "amyloid", "Congo red", "apple-green birefringence", "AL", "AA", "beta-2 microglobulin"],
    summary: "Extracellular deposition of misfolded proteins as insoluble fibrils. AL amyloidosis: immunoglobulin light chains (plasma cell dyscrasias). AA amyloidosis: serum amyloid A (chronic inflammatory states). Congo red stain shows apple-green birefringence under polarized light.",
    system: "Pathology",
    highYield: "Nephrotic syndrome is the most common renal presentation. Restrictive cardiomyopathy with low voltage ECG is a feared cardiac complication. Beta-2 microglobulin amyloid: dialysis-associated amyloidosis."
  },

  // ── Biochemistry ──
  {
    concept: "Glycolysis and Gluconeogenesis",
    keywords: ["glycolysis", "gluconeogenesis", "PFK-1", "fructose-1,6-bisphosphatase", "pyruvate kinase", "hexokinase", "Cori cycle"],
    summary: "Glycolysis: glucose to pyruvate in cytoplasm, net 2 ATP + 2 NADH. Key irreversible enzymes: hexokinase, PFK-1 (rate-limiting), pyruvate kinase. Gluconeogenesis: pyruvate to glucose, mainly in liver (bypasses 3 irreversible steps).",
    system: "Biochemistry",
    highYield: "PFK-1 is the rate-limiting enzyme of glycolysis, activated by AMP and fructose-2,6-bisphosphate, inhibited by ATP and citrate. Pyruvate kinase deficiency causes chronic hemolytic anemia (RBCs depend entirely on glycolysis for ATP)."
  },
  {
    concept: "TCA Cycle",
    keywords: ["TCA", "Krebs cycle", "citric acid cycle", "acetyl-CoA", "NADH", "FADH2", "alpha-ketoglutarate dehydrogenase"],
    summary: "Acetyl-CoA enters by combining with oxaloacetate to form citrate. Produces 3 NADH, 1 FADH2, 1 GTP per turn. Occurs in mitochondrial matrix. Rate-limiting enzyme: isocitrate dehydrogenase.",
    system: "Biochemistry",
    highYield: "Alpha-ketoglutarate dehydrogenase requires same cofactors as pyruvate dehydrogenase: thiamine (B1), lipoic acid, CoA (pantothenate/B5), FAD (B2), NAD+ (B3). Mnemonic: 'Tender Loving Care For Nancy.'"
  },
  {
    concept: "Phenylketonuria (PKU)",
    keywords: ["PKU", "phenylketonuria", "phenylalanine hydroxylase", "tyrosine", "musty odor", "intellectual disability", "BH4"],
    summary: "Autosomal recessive deficiency of phenylalanine hydroxylase (or cofactor BH4). Cannot convert phenylalanine to tyrosine. Accumulated phenylalanine is neurotoxic. Presents with intellectual disability, seizures, musty/mousy body odor, fair skin.",
    system: "Biochemistry",
    highYield: "Newborn screening is mandatory. Fair skin and hair because tyrosine (melanin precursor) is not synthesized. Treatment: low phenylalanine diet (avoid aspartame, which contains phenylalanine). Maternal PKU: elevated Phe is teratogenic — causes microcephaly, cardiac defects."
  },
  {
    concept: "Vitamin B12 Deficiency",
    keywords: ["B12", "cobalamin", "megaloblastic anemia", "subacute combined degeneration", "pernicious anemia", "methylmalonic acid", "homocysteine"],
    summary: "Causes megaloblastic anemia (hypersegmented neutrophils) AND neurologic symptoms (subacute combined degeneration of dorsal columns and lateral corticospinal tracts). Pernicious anemia: autoantibodies against intrinsic factor or parietal cells.",
    system: "Biochemistry",
    highYield: "Both B12 and folate deficiency cause megaloblastic anemia with elevated homocysteine. Only B12 deficiency causes elevated methylmalonic acid and neurologic symptoms. Never give folate alone if B12 deficiency is possible — it corrects anemia but worsens neurologic damage."
  },

  // ── Immunology ──
  {
    concept: "Hypersensitivity Types",
    keywords: ["hypersensitivity", "type I", "type II", "type III", "type IV", "IgE", "anaphylaxis", "immune complex", "delayed"],
    summary: "Type I: IgE-mediated, immediate (anaphylaxis, atopy). Type II: IgG/IgM against cell surface antigens (autoimmune hemolytic anemia, Goodpasture). Type III: immune complex deposition (SLE, serum sickness). Type IV: T-cell mediated, delayed (TB test, contact dermatitis).",
    system: "Immunology",
    highYield: "Type I is the only one involving IgE and mast cell degranulation. Type II can be cytotoxic (complement) or non-cytotoxic (antibody blocks receptor, e.g., myasthenia gravis). Type III deposits in vessels, joints, kidneys (Arthus reaction is local, serum sickness is systemic)."
  },
  {
    concept: "Systemic Lupus Erythematosus (SLE)",
    keywords: ["SLE", "lupus", "ANA", "anti-dsDNA", "anti-Smith", "butterfly rash", "nephritis", "type III hypersensitivity"],
    summary: "Systemic autoimmune disease with multiorgan involvement. Type III hypersensitivity (immune complex deposition). Affects young women (especially Black women). ANA is sensitive screening test; anti-dsDNA and anti-Smith are specific.",
    system: "Immunology",
    highYield: "Anti-dsDNA correlates with disease activity and lupus nephritis. Drug-induced lupus (hydralazine, procainamide, isoniazid): anti-histone antibodies, no renal/CNS involvement. Libman-Sacks endocarditis: sterile vegetations on both sides of mitral valve."
  },
  {
    concept: "Major Histocompatibility Complex (MHC)",
    keywords: ["MHC", "HLA", "MHC class I", "MHC class II", "antigen presentation", "CD8", "CD4"],
    summary: "MHC I (HLA-A, B, C): on all nucleated cells, presents intracellular peptides to CD8+ T cells. MHC II (HLA-DP, DQ, DR): on antigen-presenting cells (macrophages, dendritic cells, B cells), presents extracellular peptides to CD4+ T cells.",
    system: "Immunology",
    highYield: "MHC I: rule of 8 (CD8 = cytotoxic T cells recognize MHC I). MHC II: rule of 4 (CD4 = helper T cells recognize MHC II). HLA-B27 is associated with ankylosing spondylitis, reactive arthritis, IBD-associated arthritis, and psoriatic arthritis."
  },
  {
    concept: "Complement System",
    keywords: ["complement", "C3", "C5", "MAC", "C1 inhibitor", "hereditary angioedema", "classical pathway", "alternative pathway"],
    summary: "Classical: C1 activated by antigen-antibody complexes (IgG, IgM). Alternative: C3 spontaneously activates on microbial surfaces. Lectin: mannose-binding lectin on microbial surfaces. All converge at C3 convertase, then C5-C9 form MAC.",
    system: "Immunology",
    highYield: "C3 is the most abundant complement protein. C5a is the most potent chemotactic factor and anaphylatoxin. Hereditary angioedema: C1 inhibitor deficiency causing uncontrolled bradykinin and complement activation. Terminal complement deficiency (C5-C9): recurrent Neisseria infections."
  },

  // ── Musculoskeletal ──
  {
    concept: "Rheumatoid Arthritis",
    keywords: ["rheumatoid arthritis", "RA", "RF", "anti-CCP", "pannus", "MCP", "PIP", "swan neck", "boutonniere"],
    summary: "Chronic autoimmune inflammatory arthritis targeting synovial joints symmetrically. Affects MCP and PIP joints (spares DIP). Pannus formation erodes cartilage and bone. RF and anti-CCP antibodies are diagnostic markers.",
    system: "Musculoskeletal",
    highYield: "Anti-CCP is more specific than RF. Swan neck deformity (PIP hyperextension + DIP flexion) and boutonniere deformity (PIP flexion + DIP hyperextension). Morning stiffness > 1 hour (improves with activity). Methotrexate is first-line DMARD."
  },
  {
    concept: "Gout",
    keywords: ["gout", "uric acid", "monosodium urate", "negatively birefringent", "podagra", "tophi", "colchicine", "allopurinol"],
    summary: "Monosodium urate crystal deposition in joints. Acute attacks: sudden severe joint pain (classically first MTP = podagra). Needle-shaped negatively birefringent crystals under polarized light. Risk factors: purine-rich diet, alcohol, thiazide diuretics, tumor lysis.",
    system: "Musculoskeletal",
    highYield: "Negatively birefringent (yellow under parallel light) = gout. Positively birefringent (blue under parallel light) = pseudogout (CPPD, rhomboid crystals). Acute treatment: NSAIDs, colchicine, corticosteroids. Chronic: allopurinol (xanthine oxidase inhibitor) or febuxostat."
  },
  {
    concept: "Osteoporosis",
    keywords: ["osteoporosis", "DEXA", "T-score", "bisphosphonates", "bone density", "compression fracture", "postmenopausal"],
    summary: "Decreased bone density and disrupted microarchitecture increasing fracture risk. T-score <= -2.5 on DEXA scan. Most common in postmenopausal women (estrogen withdrawal accelerates bone loss). Common fractures: vertebral compression, hip, distal radius (Colles).",
    system: "Musculoskeletal",
    highYield: "Bisphosphonates (alendronate) are first-line therapy — inhibit osteoclasts. Must take upright with water on empty stomach to prevent esophagitis. T-score between -1 and -2.5 = osteopenia. Long-term bisphosphonate use associated with atypical femur fractures and osteonecrosis of jaw."
  },

  // ── Reproductive ──
  {
    concept: "Ectopic Pregnancy",
    keywords: ["ectopic pregnancy", "beta-hCG", "adnexal mass", "ampulla", "methotrexate", "ruptured ectopic"],
    summary: "Implantation outside the uterine cavity, most commonly in the fallopian tube ampulla. Presents with abdominal pain, vaginal bleeding, and positive pregnancy test. Ruptured ectopic is a surgical emergency with hemodynamic instability.",
    system: "Reproductive",
    highYield: "Beta-hCG above discriminatory zone (1500-2000) with empty uterus on transvaginal ultrasound suggests ectopic. Stable unruptured: methotrexate (if hCG < 5000, no fetal cardiac activity, < 3.5 cm). Ruptured: emergent laparoscopic salpingectomy."
  },
  {
    concept: "Preeclampsia and Eclampsia",
    keywords: ["preeclampsia", "eclampsia", "hypertension", "proteinuria", "HELLP", "magnesium sulfate", "gestational hypertension"],
    summary: "Preeclampsia: new-onset hypertension (>= 140/90) after 20 weeks gestation with proteinuria or end-organ damage. Eclampsia: preeclampsia + seizures. HELLP syndrome: Hemolysis, Elevated Liver enzymes, Low Platelets. Caused by abnormal placental spiral artery remodeling.",
    system: "Reproductive",
    highYield: "Magnesium sulfate for seizure prophylaxis (and treatment in eclampsia). Definitive treatment is delivery. Severe features: BP >= 160/110, platelets < 100k, elevated creatinine, liver enzymes > 2x normal, pulmonary edema, cerebral/visual symptoms."
  },
  {
    concept: "Placental Abruption vs Placenta Previa",
    keywords: ["placental abruption", "placenta previa", "vaginal bleeding", "third trimester", "painful", "painless"],
    summary: "Abruption: premature separation of normally implanted placenta. Painful vaginal bleeding with rigid/tender uterus. Risk factors: HTN, trauma, cocaine. Previa: placenta overlying cervical os. Painless bright red vaginal bleeding.",
    system: "Reproductive",
    highYield: "Previa: painless bleeding, diagnosed by ultrasound, NEVER do digital vaginal exam (can cause massive hemorrhage). Abruption: painful bleeding, may have concealed hemorrhage (blood trapped behind placenta), associated with DIC. Both require monitoring for fetal distress."
  },

  // ── Psychiatry ──
  {
    concept: "Major Depressive Disorder",
    keywords: ["depression", "MDD", "SSRI", "serotonin", "anhedonia", "suicide", "antidepressant"],
    summary: "Requires >= 5 symptoms (including depressed mood or anhedonia) for >= 2 weeks: SIG E CAPS — Sleep changes, Interest loss, Guilt, Energy loss, Concentration difficulty, Appetite changes, Psychomotor changes, Suicidal ideation.",
    system: "Psychiatry",
    highYield: "SSRIs (fluoxetine, sertraline) are first-line treatment. Black box warning: increased suicidality in patients < 25 years during first weeks of treatment. Serotonin syndrome: altered mental status, autonomic instability, clonus/hyperreflexia — can occur with SSRI + MAOI combination."
  },
  {
    concept: "Schizophrenia",
    keywords: ["schizophrenia", "psychosis", "hallucinations", "delusions", "dopamine", "antipsychotic", "positive symptoms", "negative symptoms"],
    summary: "Chronic psychotic disorder with positive symptoms (hallucinations, delusions, disorganized thought/behavior) and negative symptoms (flat affect, alogia, avolition, anhedonia, social withdrawal). Onset typically late teens/early 20s in males.",
    system: "Psychiatry",
    highYield: "Positive symptoms from mesolimbic dopamine excess, negative symptoms from mesocortical dopamine deficiency. First-gen antipsychotics (haloperidol): block D2, treat positive symptoms, cause EPS. Second-gen (risperidone, olanzapine, clozapine): also block 5-HT2A, better for negative symptoms."
  },
  {
    concept: "Bipolar Disorder",
    keywords: ["bipolar", "mania", "lithium", "valproate", "mood stabilizer", "grandiosity", "pressured speech"],
    summary: "Bipolar I: at least one manic episode (>= 1 week or hospitalization). Bipolar II: hypomania + major depressive episodes. Mania: elevated mood, decreased sleep, grandiosity, pressured speech, increased goal-directed activity, risky behavior.",
    system: "Psychiatry",
    highYield: "Lithium is first-line for bipolar disorder (narrow therapeutic index, monitor levels). Side effects: nephrogenic DI, hypothyroidism, Ebstein anomaly (teratogenic). Valproate is alternative (teratogenic: neural tube defects). Never give antidepressants alone in bipolar — can trigger mania."
  },
  {
    concept: "Antipsychotic Side Effects",
    keywords: ["antipsychotic", "EPS", "tardive dyskinesia", "neuroleptic malignant syndrome", "NMS", "QT prolongation", "metabolic syndrome"],
    summary: "First-gen (typical): EPS (dystonia, akathisia, parkinsonism, tardive dyskinesia), NMS, hyperprolactinemia. Second-gen (atypical): metabolic syndrome (weight gain, diabetes, dyslipidemia), QT prolongation. Clozapine: agranulocytosis.",
    system: "Psychiatry",
    highYield: "NMS: high fever, rigidity ('lead pipe'), altered mental status, autonomic instability — treat with dantrolene and bromocriptine. Distinguished from serotonin syndrome by rigidity vs clonus. Clozapine is the most effective antipsychotic but requires weekly CBC monitoring for agranulocytosis."
  },

  // ── Additional High-Yield Topics ──
  {
    concept: "Diabetic Ketoacidosis (DKA)",
    keywords: ["DKA", "diabetic ketoacidosis", "anion gap", "ketones", "Kussmaul breathing", "insulin", "potassium"],
    summary: "Life-threatening complication of type 1 DM (or type 2 in severe stress). Absolute insulin deficiency causes uninhibited lipolysis and ketone production. Presents with hyperglycemia, anion gap metabolic acidosis, ketonemia, Kussmaul respirations.",
    system: "Endocrine",
    highYield: "Treat with IV fluids (first priority), then insulin drip, and potassium replacement. Total body potassium is depleted even if serum K+ is normal or high (acidosis shifts K+ out of cells). Must check potassium before giving insulin — insulin drives K+ intracellularly and can cause fatal hypokalemia."
  },
  {
    concept: "Myasthenia Gravis",
    keywords: ["myasthenia gravis", "acetylcholine receptor", "AChR antibodies", "thymoma", "ptosis", "diplopia", "edrophonium", "pyridostigmine"],
    summary: "Autoimmune antibodies against nicotinic acetylcholine receptors at the neuromuscular junction. Fatigable weakness worsening with repeated use (ptosis, diplopia, dysphagia). Associated with thymoma and thymic hyperplasia.",
    system: "Neurology",
    highYield: "Edrophonium (Tensilon) test: rapid improvement with AChE inhibitor confirms diagnosis. Treatment: pyridostigmine (long-acting AChE inhibitor), immunosuppression, thymectomy. Myasthenic crisis (respiratory failure): IVIG or plasmapheresis. Avoid aminoglycosides, which worsen weakness."
  },
  {
    concept: "Anemias Overview",
    keywords: ["anemia", "microcytic", "normocytic", "macrocytic", "MCV", "reticulocyte count", "hemolytic"],
    summary: "Microcytic (MCV < 80): iron deficiency, thalassemia, anemia of chronic disease, lead poisoning, sideroblastic. Macrocytic (MCV > 100): B12/folate deficiency, alcoholism, liver disease. Normocytic: acute blood loss, anemia of chronic disease, hemolytic anemias.",
    system: "Heme/Onc",
    highYield: "Reticulocyte count distinguishes production problems (low reticulocytes) from destruction/blood loss (high reticulocytes). Anemia of chronic disease: low iron, low TIBC, high ferritin (iron is trapped in macrophages by hepcidin). Thalassemia: microcytic with normal/high iron studies and target cells."
  },
  {
    concept: "Autosomal Dominant Polycystic Kidney Disease (ADPKD)",
    keywords: ["ADPKD", "polycystic kidney", "PKD1", "berry aneurysm", "flank pain", "hepatic cysts", "hypertension"],
    summary: "Mutation in PKD1 (85%, chromosome 16) or PKD2. Progressive bilateral renal cyst formation leading to ESRD. Presents with flank pain, hematuria, hypertension, palpable kidneys. Associated with berry aneurysms, hepatic cysts, mitral valve prolapse.",
    system: "Renal",
    highYield: "Berry aneurysm rupture causing subarachnoid hemorrhage is a feared extrarenal complication. Screen family members with renal ultrasound. Unlike autosomal recessive PKD (infantile, associated with hepatic fibrosis), ADPKD presents in adulthood."
  },
  {
    concept: "Goodpasture Syndrome",
    keywords: ["Goodpasture", "anti-GBM", "type II hypersensitivity", "linear immunofluorescence", "hemoptysis", "glomerulonephritis"],
    summary: "Type II hypersensitivity with anti-GBM antibodies targeting collagen type IV in glomerular and alveolar basement membranes. Presents with pulmonary hemorrhage (hemoptysis) and rapidly progressive glomerulonephritis.",
    system: "Immunology",
    highYield: "Linear IgG immunofluorescence pattern along GBM (distinguishes from granular pattern in immune complex diseases). Young men who smoke. Treat with plasmapheresis (remove antibodies), cyclophosphamide, and corticosteroids."
  },
  {
    concept: "Conn Syndrome (Primary Hyperaldosteronism)",
    keywords: ["Conn syndrome", "hyperaldosteronism", "aldosterone", "renin", "hypokalemia", "adrenal adenoma", "metabolic alkalosis"],
    summary: "Excess aldosterone (usually from adrenal adenoma or bilateral hyperplasia). Causes hypertension, hypokalemia, and metabolic alkalosis. Renin is suppressed (high aldosterone negative-feeds back on renin). Most common cause of secondary hypertension.",
    system: "Endocrine",
    highYield: "Screen with aldosterone-to-renin ratio (ARR). High aldosterone + low renin = primary hyperaldosteronism. CT to look for adrenal adenoma. Unilateral adenoma: surgical resection. Bilateral hyperplasia: spironolactone (aldosterone antagonist)."
  },
  {
    concept: "Cystic Fibrosis",
    keywords: ["cystic fibrosis", "CFTR", "chloride channel", "sweat test", "Pseudomonas", "meconium ileus", "bronchiectasis"],
    summary: "Autosomal recessive mutation in CFTR chloride channel (most common: delta-F508). Thick, viscous secretions affecting lungs (recurrent infections, bronchiectasis), pancreas (insufficiency, malabsorption), and GI tract (meconium ileus in newborns).",
    system: "Pulmonology",
    highYield: "Sweat chloride > 60 mEq/L is diagnostic. Pseudomonas aeruginosa is the most common chronic lung pathogen. Pancreatic insufficiency leads to fat-soluble vitamin deficiency (ADEK). Male infertility from absent vas deferens. CFTR modulators (ivacaftor) are game-changing therapies."
  },
  {
    concept: "Obstructive vs Restrictive Lung Disease",
    keywords: ["obstructive", "restrictive", "FEV1", "FVC", "TLC", "PFTs", "spirometry", "pulmonary function"],
    summary: "Obstructive: difficulty exhaling (FEV1/FVC < 0.7). Includes asthma, COPD, bronchiectasis. Restrictive: difficulty expanding lungs (decreased TLC, FVC decreased proportionally to FEV1, so FEV1/FVC is normal or increased). Includes pulmonary fibrosis, obesity, neuromuscular disease.",
    system: "Pulmonology",
    highYield: "In obstructive disease, TLC and RV are increased (air trapping). In restrictive disease, ALL lung volumes are decreased. DLCO is decreased in emphysema and pulmonary fibrosis, but normal in asthma and chest wall restriction."
  },
  {
    concept: "Nephrolithiasis",
    keywords: ["kidney stone", "nephrolithiasis", "calcium oxalate", "uric acid", "struvite", "cystine", "renal colic"],
    summary: "Most common: calcium oxalate (80%). Uric acid stones are radiolucent on X-ray. Struvite: staghorn calculi from urease-producing organisms (Proteus). Cystine: hexagonal crystals in cystinuria. Presents with severe colicky flank pain radiating to groin.",
    system: "Renal",
    highYield: "Calcium oxalate stones: envelope-shaped crystals, associated with Crohn disease (increased oxalate absorption) and ethylene glycol poisoning. Uric acid stones: only type dissolvable with urine alkalinization. Struvite stones form in alkaline urine (urease splits urea to ammonia)."
  },
  {
    concept: "Coagulation Cascade",
    keywords: ["coagulation", "intrinsic pathway", "extrinsic pathway", "PT", "PTT", "factor V Leiden", "thrombin", "fibrinogen"],
    summary: "Extrinsic pathway (PT): tissue factor activates factor VII. Intrinsic pathway (PTT): contact activation (XII, XI, IX, VIII). Both converge at common pathway (X, V, prothrombin, fibrinogen). PT monitors warfarin; PTT monitors heparin.",
    system: "Heme/Onc",
    highYield: "Factor V Leiden (most common inherited thrombophilia): factor V resistant to inactivation by protein C. Hemophilia A: factor VIII deficiency (X-linked, prolonged PTT, normal PT). Hemophilia B: factor IX deficiency. Von Willebrand disease: most common inherited bleeding disorder."
  },
  {
    concept: "Adrenal Enzyme Deficiencies",
    keywords: ["21-hydroxylase deficiency", "congenital adrenal hyperplasia", "CAH", "ambiguous genitalia", "17-alpha hydroxylase", "11-beta hydroxylase"],
    summary: "21-hydroxylase deficiency (most common CAH): can't make cortisol or aldosterone, shunts to androgens. Female virilization, salt wasting. 11-beta hydroxylase: similar virilization but with hypertension (excess 11-deoxycorticosterone). 17-alpha hydroxylase: no sex hormones or cortisol.",
    system: "Endocrine",
    highYield: "21-hydroxylase: elevated 17-OH progesterone is the screening test. XX females present with ambiguous genitalia. XY males may present later with salt-wasting crisis. 17-alpha hydroxylase deficiency: XY phenotypic females with hypertension and hypokalemia."
  },
  {
    concept: "Diuretics",
    keywords: ["diuretic", "furosemide", "hydrochlorothiazide", "spironolactone", "loop diuretic", "thiazide", "potassium"],
    summary: "Loop (furosemide): inhibits Na-K-2Cl in thick ascending limb, most potent. Thiazide (HCTZ): inhibits NaCl cotransporter in DCT. K+-sparing: spironolactone (aldosterone antagonist), amiloride/triamterene (block ENaC).",
    system: "Pharmacology",
    highYield: "Loops and thiazides cause hypokalemia, metabolic alkalosis, hyperuricemia. Thiazides cause hypercalcemia (increased calcium reabsorption). Loops cause hypocalcemia. Spironolactone causes hyperkalemia and gynecomastia (anti-androgen effect)."
  },
  {
    concept: "Hepatocellular Carcinoma",
    keywords: ["HCC", "hepatocellular carcinoma", "AFP", "cirrhosis", "hepatitis B", "hepatitis C", "liver mass"],
    summary: "Most common primary liver malignancy, usually arising in background of cirrhosis. Major risk factors: chronic hepatitis B (can occur WITHOUT cirrhosis), hepatitis C, alcoholic cirrhosis, NAFLD. Alpha-fetoprotein (AFP) is the tumor marker.",
    system: "GI",
    highYield: "Hepatitis B is the #1 cause worldwide (can cause HCC without cirrhosis via direct oncogenesis). Screen cirrhotics with ultrasound and AFP every 6 months. Budd-Chiari syndrome (hepatic vein thrombosis) can be a presentation."
  },
  {
    concept: "Turner Syndrome",
    keywords: ["Turner syndrome", "45 XO", "monosomy X", "short stature", "webbed neck", "coarctation of aorta", "streak gonads"],
    summary: "45,X monosomy. Short stature, webbed neck, shield chest, lymphedema at birth, streak gonads (primary amenorrhea), horseshoe kidney. Most common cause of primary amenorrhea. Associated with bicuspid aortic valve and coarctation of aorta.",
    system: "Reproductive",
    highYield: "Cystic hygroma seen on prenatal ultrasound. No Barr bodies (one X must be inactivated, but only one X exists). Estrogen replacement for puberty development. Increased risk of aortic dissection (especially with bicuspid aortic valve and coarctation)."
  },
  {
    concept: "Melanoma",
    keywords: ["melanoma", "ABCDE", "Breslow depth", "Clark level", "S-100", "dysplastic nevus", "BRAF"],
    summary: "Most deadly skin cancer from malignant melanocytes. ABCDE criteria: Asymmetry, Border irregularity, Color variation, Diameter > 6mm, Evolution. S-100 and HMB-45 are immunohistochemical markers. Breslow depth is the most important prognostic factor.",
    system: "Pathology",
    highYield: "Superficial spreading is the most common subtype. Nodular melanoma is the most aggressive (vertical growth phase). BRAF V600E mutation present in ~50% — targetable with vemurafenib. Sentinel lymph node biopsy for staging when Breslow > 1mm."
  },
  {
    concept: "Shock Types",
    keywords: ["shock", "hypovolemic", "cardiogenic", "distributive", "obstructive", "septic shock", "neurogenic"],
    summary: "Hypovolemic: decreased preload (hemorrhage, dehydration). Cardiogenic: pump failure (MI, tamponade). Distributive: vasodilation (septic, anaphylactic, neurogenic). Obstructive: physical obstruction of blood flow (PE, tension pneumothorax, cardiac tamponade).",
    system: "Cardiology",
    highYield: "Septic shock: warm (vasodilation) early, cold later. High CO, low SVR. Cardiogenic: low CO, high SVR, elevated PCWP. Hypovolemic: low CO, high SVR, low PCWP. Treat septic shock with fluids, then vasopressors (norepinephrine first-line)."
  },
  {
    concept: "Prostate Cancer",
    keywords: ["prostate cancer", "PSA", "Gleason score", "BPH", "LUTS", "androgen deprivation", "posterior prostate"],
    summary: "Most common cancer in men. Adenocarcinoma arising from the posterior/peripheral zone (unlike BPH which is periurethral). Diagnosed by elevated PSA and transrectal ultrasound-guided biopsy. Gleason score grades differentiation (higher = worse).",
    system: "Reproductive",
    highYield: "BPH is periurethral (causes urinary obstruction early). Prostate cancer is peripheral (often asymptomatic early, found on screening). Osteoblastic bone metastases (elevated alkaline phosphatase) — unlike most metastases which are osteolytic."
  },
  {
    concept: "Acute Appendicitis",
    keywords: ["appendicitis", "McBurney point", "RLQ pain", "periumbilical pain", "psoas sign", "obturator sign", "appendicolith"],
    summary: "Most common surgical emergency. Classically: periumbilical pain migrating to RLQ (McBurney point). Caused by obstruction of appendiceal lumen (fecalith, lymphoid hyperplasia). Diagnosis: CT with contrast. Leukocytosis with left shift.",
    system: "GI",
    highYield: "Pain migration from periumbilical to RLQ occurs as inflammation progresses from visceral (referred) to parietal (localized) peritoneal irritation. Psoas sign: pain on right hip extension (retrocecal appendix). If perforated: peritonitis or abscess formation."
  },
  {
    concept: "Pneumothorax",
    keywords: ["pneumothorax", "tension pneumothorax", "spontaneous", "tracheal deviation", "chest tube", "needle decompression"],
    summary: "Air in pleural space. Primary spontaneous: tall thin young men, rupture of apical blebs. Secondary: underlying lung disease. Tension pneumothorax: one-way valve mechanism causes mediastinal shift away from affected side, with hemodynamic compromise.",
    system: "Pulmonology",
    highYield: "Tension pneumothorax is a clinical diagnosis — do NOT wait for imaging. Needle decompression at 2nd intercostal space, midclavicular line (immediate treatment), followed by chest tube at 5th ICS, midaxillary line. Tracheal deviation AWAY from the affected side, JVD, hypotension."
  },
  {
    concept: "Alcoholic Liver Disease Spectrum",
    keywords: ["alcoholic liver", "fatty liver", "steatosis", "alcoholic hepatitis", "Mallory bodies", "AST ALT ratio"],
    summary: "Spectrum: fatty liver (steatosis, reversible) to alcoholic hepatitis (Mallory-Denk bodies, neutrophilic infiltration) to cirrhosis (irreversible). AST:ALT ratio > 2:1 is characteristic of alcoholic liver disease.",
    system: "GI",
    highYield: "AST > ALT (2:1 ratio) because alcohol depletes pyridoxal phosphate (B6, a cofactor for ALT more than AST). Mallory-Denk bodies are damaged intermediate filaments (cytokeratin), also seen in NASH and Wilson disease. Alcoholic hepatitis: fever, jaundice, hepatomegaly, leukocytosis."
  },
  {
    concept: "Testicular Tumors",
    keywords: ["testicular cancer", "seminoma", "nonseminoma", "AFP", "beta-hCG", "LDH", "germ cell tumor", "cryptorchidism"],
    summary: "Most common solid tumor in young men (15-35). Seminomas: most common, radiosensitive, good prognosis, elevated hCG (no AFP). Nonseminomas: yolk sac (AFP, most common in children), choriocarcinoma (hCG), embryonal carcinoma, teratoma.",
    system: "Reproductive",
    highYield: "Cryptorchidism is the strongest risk factor (even after orchiopexy). Seminoma: large, homogeneous, fried egg cells. AFP is elevated ONLY in nonseminomas — if AFP is elevated, it's not a pure seminoma regardless of histology. Radical inguinal orchiectomy (NOT transscrotal biopsy)."
  },
  {
    concept: "Calcium Homeostasis",
    keywords: ["calcium", "PTH", "vitamin D", "calcitonin", "hypercalcemia", "hypocalcemia", "parathyroid"],
    summary: "PTH: increases serum Ca (bone resorption, renal reabsorption, activates vitamin D). Vitamin D (1,25-OH): increases Ca and PO4 absorption from gut. Calcitonin: lowers Ca (inhibits osteoclasts). Most common cause of hypercalcemia: primary hyperparathyroidism (outpatient), malignancy (inpatient).",
    system: "Endocrine",
    highYield: "PTH increases calcium but DECREASES phosphate (inhibits renal phosphate reabsorption). In primary hyperparathyroidism: high Ca, low PO4, high PTH. In malignancy-associated hypercalcemia: high Ca, PTH is LOW (suppressed by high Ca). PTHrP is the culprit in squamous cell cancers."
  },
  {
    concept: "Down Syndrome (Trisomy 21)",
    keywords: ["Down syndrome", "trisomy 21", "intellectual disability", "AV canal defect", "Alzheimer", "duodenal atresia", "atlantoaxial instability"],
    summary: "Most common chromosomal disorder and cause of genetic intellectual disability. Features: flat facies, epicanthal folds, single palmar crease, sandal gap toe, hypotonia. Major cardiac defect: endocardial cushion defect (AV canal). Increased risk of ALL and early Alzheimer disease.",
    system: "Pathology",
    highYield: "First trimester screening: increased nuchal translucency, decreased PAPP-A, increased free beta-hCG. Second trimester quad screen: decreased AFP, increased hCG, decreased estriol, increased inhibin A. Duodenal atresia (double bubble sign). Risk increases dramatically with maternal age > 35."
  },
  {
    concept: "Peptic Ulcer Disease",
    keywords: ["peptic ulcer", "H. pylori", "NSAID", "duodenal ulcer", "gastric ulcer", "PPI", "urea breath test"],
    summary: "Duodenal ulcers (more common): pain improves with eating. Gastric ulcers: pain worsens with eating. H. pylori (#1 cause) diagnosed by urea breath test, stool antigen, or biopsy. NSAIDs are #2 cause. Treat with triple therapy (PPI + clarithromycin + amoxicillin).",
    system: "GI",
    highYield: "Duodenal ulcers almost never malignant. Gastric ulcers require biopsy to rule out malignancy. Posterior duodenal ulcers can erode into gastroduodenal artery causing massive hemorrhage. Anterior duodenal ulcers can perforate into peritoneal cavity (free air under diaphragm)."
  },
  {
    concept: "Benign Prostatic Hyperplasia (BPH)",
    keywords: ["BPH", "benign prostatic hyperplasia", "LUTS", "alpha blocker", "5-alpha reductase inhibitor", "tamsulosin", "finasteride"],
    summary: "Age-related hyperplasia of the periurethral (transitional) zone of the prostate. Causes lower urinary tract symptoms: frequency, urgency, nocturia, weak stream, incomplete emptying, hesitancy. PSA may be mildly elevated.",
    system: "Reproductive",
    highYield: "Alpha-1 blockers (tamsulosin): relax smooth muscle for rapid symptom relief. 5-alpha reductase inhibitors (finasteride): shrink prostate over months by blocking testosterone to DHT conversion. Finasteride lowers PSA by ~50% — adjust when screening for cancer."
  },
  {
    concept: "Subarachnoid Hemorrhage",
    keywords: ["subarachnoid hemorrhage", "SAH", "berry aneurysm", "thunderclap headache", "xanthochromia", "vasospasm", "Hunt-Hess"],
    summary: "Most commonly from ruptured berry (saccular) aneurysm at Circle of Willis (especially anterior communicating artery). Presents with sudden-onset 'worst headache of my life' (thunderclap). CT head is first test; if negative, do LP (xanthochromia).",
    system: "Neurology",
    highYield: "Vasospasm peaks at days 4-14 (treat with nimodipine, a calcium channel blocker). Rebleeding risk highest in first 24 hours. Berry aneurysms associated with ADPKD, Ehlers-Danlos, and coarctation of aorta. Anterior communicating artery is the most common location."
  },
  {
    concept: "Abdominal Aortic Aneurysm (AAA)",
    keywords: ["AAA", "abdominal aortic aneurysm", "atherosclerosis", "pulsatile mass", "screening ultrasound", "rupture"],
    summary: "Dilation of abdominal aorta >= 3 cm, most commonly infrarenal. Caused by atherosclerosis. Risk factors: smoking, hypertension, male, age > 65, family history. Most are asymptomatic; rupture presents with triad: hypotension, pulsatile abdominal mass, back/flank pain.",
    system: "Cardiology",
    highYield: "Screen men aged 65-75 who have ever smoked with one-time abdominal ultrasound. Rupture risk increases with size (>5.5 cm: repair). Elective repair: open surgery or endovascular aneurysm repair (EVAR). Ruptured AAA is a surgical emergency with high mortality."
  },
  {
    concept: "Hereditary Spherocytosis",
    keywords: ["spherocytosis", "spectrin", "ankyrin", "osmotic fragility", "splenectomy", "MCHC", "Coombs negative"],
    summary: "Autosomal dominant defect in RBC cytoskeleton proteins (spectrin, ankyrin, band 3). RBCs lose membrane and become spherical, trapped and destroyed in spleen. Coombs-negative hemolytic anemia with splenomegaly, jaundice, gallstones.",
    system: "Heme/Onc",
    highYield: "Elevated MCHC (spherocytes are small and dense). Positive osmotic fragility test. Diagnosed by eosin-5-maleimide (EMA) binding test. Splenectomy is curative (but increases infection risk — vaccinate against encapsulated organisms first). Howell-Jolly bodies appear post-splenectomy."
  },
  {
    concept: "Gastroesophageal Reflux Disease (GERD)",
    keywords: ["GERD", "reflux", "Barrett esophagus", "PPI", "lower esophageal sphincter", "esophagitis", "adenocarcinoma"],
    summary: "Chronic reflux of gastric acid into esophagus due to incompetent lower esophageal sphincter. Symptoms: heartburn, regurgitation, chronic cough, hoarseness. Complications: erosive esophagitis, strictures, Barrett esophagus (intestinal metaplasia).",
    system: "GI",
    highYield: "Barrett esophagus: normal squamous epithelium replaced by columnar intestinal epithelium with goblet cells (intestinal metaplasia). Premalignant — increases risk of esophageal adenocarcinoma. Requires surveillance endoscopy. PPIs are first-line treatment for GERD."
  },
  {
    concept: "Kawasaki Disease",
    keywords: ["Kawasaki", "mucocutaneous lymph node", "coronary aneurysm", "strawberry tongue", "desquamation", "IVIG", "children"],
    summary: "Acute self-limited vasculitis of medium-sized arteries in children < 5 years. Diagnostic criteria (CRASH and Burn): Conjunctivitis (bilateral, non-exudative), Rash (polymorphous), Adenopathy (cervical, unilateral), Strawberry tongue/lip changes, Hand/foot edema with desquamation, Fever >= 5 days.",
    system: "Cardiology",
    highYield: "Feared complication: coronary artery aneurysms (can cause MI). Treat with high-dose IVIG + aspirin within first 10 days to prevent coronary damage. One of the few pediatric conditions where aspirin is used (normally avoided due to Reye syndrome risk)."
  },
  {
    concept: "Achalasia",
    keywords: ["achalasia", "dysphagia", "LES", "bird beak", "myenteric plexus", "Chagas", "esophageal manometry"],
    summary: "Failure of LES relaxation and absent esophageal peristalsis due to loss of myenteric (Auerbach) plexus ganglion cells. Progressive dysphagia to both solids AND liquids (distinguishes from mechanical obstruction). Bird-beak appearance on barium swallow.",
    system: "GI",
    highYield: "Dysphagia to solids AND liquids suggests motility disorder (not obstruction). Esophageal manometry is the gold standard (high LES pressure, incomplete LES relaxation). Increased risk of squamous cell carcinoma of esophagus. Secondary achalasia: Chagas disease (T. cruzi destroys myenteric plexus)."
  },
  {
    concept: "Chronic Kidney Disease Complications",
    keywords: ["CKD", "chronic kidney disease", "renal osteodystrophy", "erythropoietin", "uremia", "secondary hyperparathyroidism", "dialysis"],
    summary: "Progressive loss of kidney function (GFR < 60 for >= 3 months). Complications: anemia (decreased EPO), secondary hyperparathyroidism (phosphate retention causes low calcium, high PTH), uremia (fatigue, nausea, pericarditis, platelet dysfunction), metabolic acidosis.",
    system: "Renal",
    highYield: "Renal osteodystrophy: phosphate retention causes decreased calcitriol (1,25-OH vitamin D), leading to hypocalcemia and secondary hyperparathyroidism with bone resorption. Treat with phosphate binders, calcitriol, and cinacalcet (calcimimetic). Start dialysis for refractory symptoms (AEIOU: Acidosis, Electrolytes, Intoxication, Overload, Uremia)."
  },
  {
    concept: "Breast Cancer",
    keywords: ["breast cancer", "BRCA", "ductal carcinoma", "lobular carcinoma", "ER positive", "HER2", "sentinel lymph node", "mammography"],
    summary: "Most common cancer in women. Invasive ductal carcinoma is the most common type (~70%). Risk factors: BRCA1/2 mutations, family history, early menarche, late menopause, nulliparity, HRT. Screen with mammography starting at age 40-50.",
    system: "Reproductive",
    highYield: "ER+/PR+ tumors: tamoxifen (premenopausal) or aromatase inhibitor (postmenopausal). HER2+ tumors: trastuzumab (Herceptin). Triple negative (ER-/PR-/HER2-): worst prognosis, common in BRCA1 carriers. Paget disease of nipple: eczematous changes from underlying DCIS or invasive cancer."
  },
  {
    concept: "Vasculitis Overview",
    keywords: ["vasculitis", "giant cell arteritis", "polyarteritis nodosa", "granulomatosis with polyangiitis", "ANCA", "Henoch-Schonlein"],
    summary: "Large vessel: giant cell (temporal) arteritis, Takayasu. Medium vessel: polyarteritis nodosa (HBV), Kawasaki. Small vessel ANCA+: granulomatosis with polyangiitis (c-ANCA/PR3), microscopic polyangiitis (p-ANCA/MPO). Small vessel immune complex: IgA vasculitis (HSP), cryoglobulinemia.",
    system: "Immunology",
    highYield: "Giant cell arteritis: headache, jaw claudication, vision loss — ESR elevated, treat immediately with corticosteroids to prevent blindness. GPA (Wegener): upper/lower respiratory + renal (c-ANCA). PAN: does NOT involve lungs, associated with HBV, string-of-pearls on angiography."
  },
  {
    concept: "Restrictive Cardiomyopathy",
    keywords: ["restrictive cardiomyopathy", "amyloidosis", "sarcoidosis", "hemochromatosis", "diastolic dysfunction", "Loeffler"],
    summary: "Stiff, non-compliant ventricles with impaired filling (diastolic dysfunction). Normal or near-normal systolic function. Causes: amyloidosis (most common), sarcoidosis, hemochromatosis, radiation, Loeffler endocarditis (eosinophilic).",
    system: "Cardiology",
    highYield: "Distinguish from constrictive pericarditis (both cause diastolic failure with JVD and Kussmaul sign). Constrictive: pericardial thickening on CT, prominent y descent. Restrictive: biopsy shows infiltrate, no pericardial thickening. Amyloid: low voltage on ECG despite thick walls."
  },
  {
    concept: "Wilson Disease",
    keywords: ["Wilson disease", "copper", "ceruloplasmin", "Kayser-Fleischer", "penicillamine", "hepatolenticular degeneration", "ATP7B"],
    summary: "Autosomal recessive defect in ATP7B (copper-transporting ATPase) causing copper accumulation in liver, brain, cornea. Presents with liver disease, neuropsychiatric symptoms, and Kayser-Fleischer rings (copper in Descemet membrane of cornea).",
    system: "GI",
    highYield: "Low serum ceruloplasmin and elevated 24-hour urine copper. Kayser-Fleischer rings are pathognomonic but not always present (especially early liver disease). Treatment: penicillamine (copper chelator) or trientine. Zinc acetate blocks intestinal copper absorption. Can present as acute liver failure with Coombs-negative hemolytic anemia."
  },
];
