import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startupsRouter = Router();

// In-memory / JSON file store
let startupsData = [];

function loadStartupsData() {
    try {
        const jsonPath = path.join(__dirname, "../../../Frontend/Startups/src/data/startups.json");
        if (fs.existsSync(jsonPath)) {
            const raw = fs.readFileSync(jsonPath, "utf-8");
            const parsed = JSON.parse(raw);
            startupsData = parsed.startups || [];
        }
    } catch (e) {
        console.warn("Could not load startups.json, using fallback data:", e.message);
    }

    if (!startupsData || startupsData.length === 0) {
        startupsData = [
            {
                id: "vedabio-01",
                name: "VedaBio Phytotherapeutics",
                category: "Ayurveda",
                tagline: "Standardized nano-liposomal Curcuminoids and Ashwagandha Withanolide formulations",
                description: "Standardized nano-liposomal Curcuminoids and Ashwagandha Withanolide formulations for metabolic syndrome clinical trials.",
                stage: "Growth",
                fundingAmount: "₹24.5 Cr",
                location: "Bengaluru, Karnataka",
                standardMark: "Compliant (Class B)",
                trialSize: "1,200 Subjects (AIIMS)",
                score: 24.2,
                status: "investor_visible"
            },
            {
                id: "pranaveda-02",
                name: "PranaVeda Diagnostics",
                category: "Ayurveda",
                tagline: "Nadi Pariksha AI sensor wristband mapping real-time Vata-Pitta-Kapha bio-frequencies",
                description: "Nadi Pariksha AI sensor wristband mapping real-time Vata-Pitta-Kapha bio-frequencies with clinical-grade accuracy.",
                stage: "Seed",
                fundingAmount: "₹4.5 Cr",
                location: "Pune, Maharashtra",
                standardMark: "Compliant (Class B)",
                trialSize: "1,200 Subjects (AIIMS)",
                score: 22.8,
                status: "investor_visible"
            },
            {
                id: "hakim-03",
                name: "Hakim Bio-Extracts",
                category: "Unani",
                tagline: "Khamira and Majun precision micro-encapsulation addressing neuro-protective pathways",
                description: "Khamira and Majun precision micro-encapsulation addressing neuro-protective pathways and cognitive health.",
                stage: "Pre-Series A",
                fundingAmount: "₹8.2 Cr",
                location: "Hyderabad, Telangana",
                standardMark: "Verified GMP",
                trialSize: "GCC & ASEAN Ready",
                score: 21.4,
                status: "investor_visible"
            },
            {
                id: "agastya-04",
                name: "Agastya Varmam Systems",
                category: "Siddha",
                tagline: "Robotic assisted neuromuscular stimulation based on canonical Siddha Varmam points",
                description: "Robotic assisted neuromuscular stimulation based on canonical Siddha Varmam points for stroke rehabilitation.",
                stage: "Grants",
                fundingAmount: "₹1.8 Cr",
                location: "Chennai, Tamil Nadu",
                standardMark: "Under Review",
                trialSize: "National Inst. of Siddha",
                score: 19.9,
                status: "investor_visible"
            }
        ];
    }
}

loadStartupsData();

// GET /api/startups - List all startups with query filters
startupsRouter.get("/", (req, res) => {
    let results = [...startupsData];
    const { category, search, stage, stream } = req.query;

    const filterCategory = stream || category;
    if (filterCategory && filterCategory.toLowerCase() !== "all") {
        results = results.filter(s => 
            s.category && s.category.toLowerCase().includes(filterCategory.toLowerCase())
        );
    }

    if (stage && stage.toLowerCase() !== "all") {
        results = results.filter(s =>
            s.stage && s.stage.toLowerCase() === stage.toLowerCase()
        );
    }

    if (search) {
        const q = search.toLowerCase();
        results = results.filter(s =>
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.tagline && s.tagline.toLowerCase().includes(q)) ||
            (s.description && s.description.toLowerCase().includes(q)) ||
            (s.location && s.location.toLowerCase().includes(q))
        );
    }

    res.json({
        total: results.length,
        startups: results
    });
});

// GET /api/startups/:id - Get single startup
startupsRouter.get("/:id", (req, res) => {
    const startup = startupsData.find(s => s.id === req.params.id);
    if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
    }
    res.json({ startup });
});

// POST /api/startups - Register new startup
startupsRouter.post("/", (req, res) => {
    const { name, category, tagline, description, location, stage, fundingAmount } = req.body;
    if (!name || !category) {
        return res.status(400).json({ message: "Startup name and category are required" });
    }

    const newStartup = {
        id: `ayush-${Date.now()}`,
        name,
        category,
        tagline: tagline || "",
        description: description || "",
        location: location || "India",
        stage: stage || "Seed",
        fundingAmount: fundingAmount || "₹0",
        standardMark: "Pending Review",
        trialSize: "N/A",
        score: 20.0,
        status: "investor_visible",
        createdAt: new Date().toISOString()
    };

    startupsData.unshift(newStartup);
    res.status(201).json({
        message: "Startup registered successfully",
        startup: newStartup
    });
});

export default startupsRouter;
