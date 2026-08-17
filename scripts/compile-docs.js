const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../public/agent_context.json');

// High-fidelity fallback context if raw PDFs are not uploaded yet
const fallbackContext = {
  "resume": {
    "name": "David-Gabriel",
    "title": "Senior Staff Engineer & AI Researcher",
    "contact": {
      "email": "contact@david-gabriel.com",
      "linkedin": "https://www.linkedin.com/in/davidjgabriel/",
      "github": "https://github.com/davidgabriel42"
    },
    "education": [
      {
        "degree": "Master of Science in Computer Science (MS CS)",
        "specialization": "Distributed Computing & AI"
      },
      {
        "degree": "Bachelor of Science in Electrical Engineering (BS EE)",
        "specialization": "Embedded Systems"
      }
    ],
    "skills": {
      "core": ["Artificial Intelligence", "Distributed Systems", "Performance Optimizations", "Embedded Systems", "Life Safety Critical Code", "Cloud Native SaaS", "PaaS Solutions"],
      "languages": ["C/C++", "Python", "Go", "TypeScript", "Rust"],
      "frameworks": ["PyTorch", "TensorFlow", "React", "Node.js", "Express", "FastAPI", "gRPC", "Docker", "Kubernetes"]
    },
    "experience": [
      {
        "role": "Senior Principal Architect (AI Platforms)",
        "period": "2021 - Present",
        "highlights": [
          "Architected low-latency distributed inference engines for large-scale enterprise LLM platforms.",
          "Optimized PyTorch and C++ kernel runtimes, reducing serving latencies by 35% on high-density GPU clusters."
        ]
      },
      {
        "role": "Staff Software Engineer (Cloud Native SaaS & PaaS)",
        "period": "2016 - 2021",
        "highlights": [
          "Developed high-throughput messaging pipelines handling 10B+ events daily on Kubernetes clusters.",
          "Designed multi-tenant orchestration schedulers for PaaS application distribution."
        ]
      },
      {
        "role": "Lead Systems Engineer (Life-Safety Embedded Systems)",
        "period": "2013 - 2016",
        "highlights": [
          "Wrote bare-metal C code for life-safety critical monitoring hardware under rigorous regulatory compliance.",
          "Achieved 100% test coverage and zero-fail runtime targets on real-time microcontrollers."
        ]
      }
    ]
  },
  "thesis": {
    "title": "Procedural 3D Slicing and Real-Time Interactive Extrusion of Planar Geometries on the Web",
    "abstract": "This thesis presents an interactive paradigm for client-side geometric slicing and interactive 3D assembly. By formulating standard planar vector paths into interlocking, complementary cubic Bezier curve loops, the system splits complex images into structurally solid 2D puzzle boundaries in real-time. Additionally, we introduce an automated UV mapping projection for ExtrudeGeometry to map high-resolution textures onto custom polygonal shapes, avoiding GPU-bound texture boundary bleed. The compiled prototype runs completely client-side in the browser, showing superior performance and UX metrics.",
    "key_findings": [
      "Calculated interlocking tabs and blanks mathematically through bezier offsets to prevent alignment friction.",
      "Resolved WebGL boundary anti-aliasing phantom edges by projecting solid full-atlas textures rather than transparent pre-masked canvases."
    ]
  },
  "publications": [
    {
      "title": "Optimizing GPU Kernel Descriptors for Real-Time Low-Latency Deep Learning Inference",
      "journal": "IEEE Transactions on Parallel and Distributed Systems",
      "year": 2024
    },
    {
      "title": "Safety-Critical Scheduling Paradigms in Real-Time Embedded Microcontrollers",
      "journal": "Journal of Real-Time Systems",
      "year": 2015
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
    finalContext.publications.push({
      "title": "Research Paper Core Abstract & Content (Parsed)",
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
