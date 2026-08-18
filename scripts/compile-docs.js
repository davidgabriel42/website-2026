const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../public/agent_context.json');

// Real, detailed professional context parsed from your resume, papers, and thesis
const fallbackContext = {
  "resume": {
    "name": "David Gabriel",
    "title": "Senior Software & Systems Architect (AI & MLOps Specialist)",
    "contact": {
      "email": "contact@david-gabriel.com",
      "phone": "+1 215.678.7549",
      "github": "https://github.com/davidgabriel42",
      "linkedin": "https://www.linkedin.com/in/davidjgabriel/"
    },
    "summary": "With over 13 years of engineering experience that spans embedded systems, cloud native SaaS and PaaS applications, and cutting edge AI research, I have the technical depth to drive high impact projects. I have delivered code for life safety critical systems, and top enterprise AI platforms. AI, distributed computing and performance optimizations are some areas I have specialized in. I also hold a Masters in CS and a Bachelors in EE.",
    "education": [
      {
        "institution": "University of Nevada, Reno",
        "degree": "Master of Science in Computer Science (MS CS)",
        "period": "2018 - 2021",
        "details": [
          "AI thesis published on the topic of Super-Computer Network Throughput Prediction.",
          "Taught Graduate level Operating Systems course teaching P-threads programming in ANSI C11 to several hundred students."
        ]
      },
      {
        "institution": "Temple University",
        "degree": "Bachelor of Science in Electrical Engineering + Bio Engineering",
        "period": "2009 - 2013",
        "details": [
          "3.9 GPA in engineering courses.",
          "Worked in the Neural Instrumentation Laboratory.",
          "Filed a Provisional Patent for an orthopedic implant with the tech transfer office.",
          "Completed OpenGL graphics rendering projects."
        ]
      }
    ],
    "skills": {
      "languages": ["Go", "Python", "C/C++", "Java", "Kotlin", "Embedded C", "TypeScript", "PHP", "Matlab", "Octave"],
      "core": ["AI/ML Systems", "Agentic Security", "MLOps Pipelines", "PCI-DSS Compliance", "MFA/OIDC 2.0", "ISO-9001 Documentation", "Embedded Systems", "Life-Safety Critical Systems", "Six Sigma Green Belt"],
      "tools": ["Kubernetes", "Docker", "Apache Spark", "Altium Designer", "Orcad", "Databricks", "Azure", "Cursor", "Claude", "LangChain", "CrewAI", "Zustand", "Three.js", "Konva.js"]
    },
    "experience": [
      {
        "company": "Ridgeline Apps",
        "role": "Software Engineer / Performance Reporting",
        "period": "Feb 2026 - Current (Remote)",
        "tech_stack": ["Java", "Kotlin", "Cursor", "Claude", "Crew"],
        "highlights": [
          "Fintech Start Up role focused on Report Generation Performance Tuning.",
          "Reduced processing times for complex financial reports from 2.5 hours down to 30 minutes.",
          "Contributed to full stack UI and backend/systems design."
        ]
      },
      {
        "company": "Cloudera",
        "role": "Senior Software Engineer / Cloudera AI",
        "period": "Sept 2022 - Oct 2025 (Remote)",
        "tech_stack": ["Go", "Kubernetes", "TypeScript", "Python", "Cursor", "Claude", "Crew", "LangChain"],
        "highlights": [
          "Served as Cloudera AI Security Champion, initiating and leading product security enhancements.",
          "Developed and launched the Open Source Agentic Security CVE detection and remediation tool ('CAI_AMP_Agentic_Security_Scanning').",
          "Authored 2 Technical Security Bulletins (TSB's) to deliver critical product security improvements across AI and security teams.",
          "Contributed as MLOps feature lead on the AI Registry service upgrade for GA release.",
          "Optimized NVIDIA AI Inference Runtimes, improving API handler and microservice communication response codes.",
          "Enhanced AI Workbench scalability to optimize database performance on Apache Spark intensive parallel workloads."
        ]
      },
      {
        "company": "Swoogo",
        "role": "Software Engineer II / Product Integrations",
        "period": "May 2021 - Sept 2022 (Remote)",
        "tech_stack": ["PHP", "Python"],
        "highlights": [
          "Received the 'Best New Hire' award of the year during a major expansion phase with over 50 hires.",
          "Designed and tested Multi-Factor Authentication (MFA) Systems on OIDC 2.0 to secure logins and prevent shared accounts.",
          "Designed and implemented PCI-DSS compliant Payment Gateway integrations for secure credit card transactions.",
          "Served as ERG Leadership Chair, contributing to an award-winning culture recognized in Inc Magazine's Best Places to Work."
        ]
      },
      {
        "company": "Bruel and Kjaer Vibro",
        "role": "Electrical Engineer",
        "period": "Sept 2019 - Aug 2020 (Nevada)",
        "tech_stack": ["Python", "Altium", "C"],
        "highlights": [
          "Delivered prototype Microsoft Azure/Databricks based AI detection for critical turbine systems, achieving a 90% reduction in false positives.",
          "Performed hardware design iterations on the VC-8000 line of equipment monitors for rotating machinery condition monitoring and protection.",
          "Maintained documentation strictly according to ISO-9001 standards."
        ]
      },
      {
        "company": "Maxton Mfg",
        "role": "Electrical Engineer",
        "period": "Dec 2017 - Jan 2019 (Nevada)",
        "tech_stack": ["C", "Embedded C", "Bluetooth", "Altium"],
        "highlights": [
          "Certified the Safetach acceleration measurement system for FCC Bluetooth wireless emitter regulations (FCC PART 15.247).",
          "Completed design revisions for EMV10 hydraulic motorized valve controller hardware to update EOL integrated circuits (published 2 hardware revisions).",
          "Maintained rigorous documents in compliance with ISO-9001 standards."
        ]
      },
      {
        "company": "Luxtech",
        "role": "Director of Product Development / Electrical Engineer",
        "period": "2014 - 2017 (Philadelphia)",
        "tech_stack": ["Hardware", "Altium", "ACLED Software"],
        "highlights": [
          "Promoted to Director of Product Development, reversing a product department that lost millions into a highly profitable 8-figure business leading 8 engineers.",
          "Awarded 5 USPTO patents; successfully filed USPTO Office Actions to secure contested patent awards.",
          "Traveled twice to China to coordinate and establish secure supply chain deals (Shanghai, Shenzhen, Guangzhou, Xiamen, and Suzhou).",
          "Created a circuit reliability software simulation tool to accurately predict the MTBF of ACLED modules using Bayesian modeling and MIL-HDBK-338B with a 95% confidence window."
        ]
      },
      {
        "company": "Ionfield Systems",
        "role": "Electrical Engineer",
        "period": "2013 - 2014 (Cherry Hill, NJ)",
        "tech_stack": ["C", "Embedded C", "Orcad", "Altium", "Python"],
        "highlights": [
          "Inventor of an NIH-funded patent for a plasma cleaning system designed to eliminate plastics from hazardous waste streams.",
          "Delivered finished plasma cleaning units used by the National Institutes of Health (NIH) National Center for Advancing Translational Sciences (NCATS).",
          "Programmed embedded circuit controls in C and built a custom Python GUI/embedded interface communicating via WiFi."
        ]
      },
      {
        "company": "Inductotherm",
        "role": "Electrical Engineer",
        "period": "2013 (Cherry Hill, NJ)",
        "tech_stack": ["Matlab", "Octave", "Orcad", "Hardware"],
        "highlights": [
          "Designed PCBs for life-safety critical industrial foundry control systems.",
          "Conducted testing on 20 MW and > 2kV industrial inverter hardware.",
          "Implemented an Octave software circuit simulator to accelerate resonant RLC circuit designs."
        ]
      }
    ],
    "community": [
      {
        "role": "CTO & Founder",
        "organization": "TCCAN (501(c)(3))",
        "period": "2021 - 2023",
        "details": "Founded a non-profit organization for sustainable development of local government in South Lake Tahoe; participated in City Council sessions leading to legislative action."
      }
    ]
  },
  "thesis": {
    "title": "Throughput Prediction on Parallel File Systems using Machine Learning",
    "abstract": "As most High Performance Computing (HPC) applications deal with large volumes of data, I/O performance is of critical importance to optimize application performance. Despite having large-scale, high-performance parallel file systems, many applications still suffer from poor I/O performance. Although existing system monitoring tools gather performance statistics, it can be challenging to interpret multidimensional data, thereby distinguishing normal behavior from abnormal ones. Therefore, it is important to derive models that can process I/O statistics gathered by existing monitoring tools. In this thesis, I develop machine learning (ML) models to process file system statistics as reported by the Darshan monitoring tool to predict the I/O throughput of HPC applications, which then can be compared against the observed I/O throughput to identify performance issues. By processing Darshan logs of the BlueWaters supercomputer, I trained several ML models including Decision Tree, Random Forest, Gradient Boosting Tree, and Deep Neural Network (DNN) using different feature scaling methods. I found that the DNN model outperformed other solutions as it can estimate the throughput of I/O operations within the 16 MB/s range. We believe that this work makes an important contribution to the field by deriving accurate models to process Darshan logs to detect file system performance anomalies (e.g., overloaded metadata server, high resource interference, etc.) that can be tackled in a timely manner to minimize interruptions.",
    "methodology": "Darshan log data collection on BlueWaters supercomputer; feature scaling and normalization; training of Decision Tree, Random Forest, Gradient Boosting Tree, and Deep Neural Networks (DNN).",
    "result_metric": "DNN model achieved prediction accuracy within a 16 MB/s range."
  },
  "open_source_projects": [
    {
      "name": "CAI_AMP_Agentic_Security_Scanning",
      "author": "David Gabriel",
      "description": "A Cloudera Applied Machine Learning Prototype (AMP) that deploys intelligent multi-agent systems to perform OWASP Top 10 security analysis, documentation assessment, and test coverage evaluation on GitHub codebases.",
      "architecture": [
        "CVE Detection Agent - Identifies OWASP Top 10 vulnerabilities.",
        "Business Context Agent - Adds business impact assessments.",
        "CVE Grading Agent - Assigns CVSS 3.1 severity scores.",
        "Attack Generator Agent - Creates functional exploitation scenarios.",
        "Fix Generator Agent - Generates clean remediation and fix code.",
        "Integration Reporter Agent - Generates final reports and JSON payloads for ticketing systems."
      ],
      "compatibility": ["Cloudera AI Inference", "AWS Bedrock (Claude 3.7 Sonnet)"],
      "documentation_enhancement": "Performs code architecture analysis, build process documentation, README assessment, and generates improved documentation templates.",
      "test_coverage_improvement": "Identifies untested functions, assesses business risk, generates runnable test cases, and delivers integration-ready ticketing payloads."
    }
  ]
};

async function parsePDF(filename) {
  const filePath = path.join(DOCS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`[Parser] ${filename} not found, using fallback structured context.`);
    return null;
  }
  
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdf(dataBuffer);
    console.log(`[Parser] Successfully compiled ${filename} (${parsed.text.length} characters parsed).`);
    return parsed.text;
  } catch (err) {
    console.error(`[Error] Failed to parse ${filename}:`, err);
    return null;
  }
}

async function compile() {
  console.log("[Compiler] Starting compilation of document assets...");
  
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR);
  }

  const resumeText = await parsePDF('resume.pdf');
  const thesisText = await parsePDF('thesis.pdf');
  const paperText = await parsePDF('research_paper.pdf');

  // Construct structured result
  const finalContext = { ...fallbackContext };

  // If actual texts are compiled, we can append or inject them to keep the context accurate
  if (resumeText) {
    finalContext.resume.raw_parsed_text = resumeText.substring(0, 5000); // chunk to fit prompts
  }
  if (thesisText) {
    finalContext.thesis.raw_parsed_text = thesisText.substring(0, 5000);
  }
  if (paperText) {
    finalContext.open_source_projects.push({
      "name": "Research Paper Core Abstract & Content (Parsed)",
      "content": paperText.substring(0, 5000)
    });
  }

  // Ensure public folder exists
  const publicDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write minified JSON output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalContext, null, 2), 'utf8');
  console.log(`[Compiler] Structured agent context successfully written to: ${OUTPUT_FILE}`);
}

compile();
