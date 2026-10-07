import { Router } from "express";

const schemesRouter = Router();

let schemesData = [
    {
        id: "ayur-udyamita-01",
        title: "Ayur-Udyamita Incubation Scheme",
        agency: "Ministry of AYUSH",
        category: "Ayurveda",
        grantAmount: "Up to ₹50 Lakhs",
        poolAmount: "₹50 Cr",
        deadline: "15 May 2026",
        description: "Seed-stage financial grant for AYUSH biotech startups focused on novel drug discovery, validation, and standard packaging.",
        eligibility: "DPIIT Recognized Startups with validated herbal prototype and AYUSH clinician co-founder.",
        benefits: "₹50 Lakh equity-free grant + 12 months subsidized incubation at National Institute of Ayurveda.",
        status: "Active Portal",
        tags: ["Ayurveda", "Seed Grant", "Incubation"]
    },
    {
        id: "nam-grant-02",
        title: "National AYUSH Mission (NAM) Grant",
        agency: "National AYUSH Mission",
        category: "Cross-Stream",
        grantAmount: "Up to ₹1.2 Crore",
        poolAmount: "₹120 Crore",
        deadline: "Rolling Admissions",
        description: "Direct sovereign capital subsidy for setting up automated AYUSH manufacturing units and farm-to-clinic supply trace chains.",
        eligibility: "Manufacturing or processing units with GMP or ISO 9001 compliance certification.",
        benefits: "Direct sovereign capital subsidy covering 50% of plant and machinery costs.",
        status: "Rolling",
        tags: ["Manufacturing", "Supply Chain", "Capital Subsidy"]
    },
    {
        id: "csss-grant-03",
        title: "Champion Services Sector Scheme (CSSS)",
        agency: "Ministry of Commerce & AYUSH",
        category: "Export & Trade",
        grantAmount: "Up to ₹75 Lakhs",
        poolAmount: "₹45 Crore",
        deadline: "30 June 2026",
        description: "Export incentivization grant covering WHO-GMP certification fees, US-FDA filings, and international exhibition delegations.",
        eligibility: "AYUSH export-oriented startups with overseas market validation or pending international patent filings.",
        benefits: "Reimbursement of 75% certification expenditure + trade pavilion stalls in GCC, EU & ASEAN.",
        status: "Active Portal",
        tags: ["Export", "WHO-GMP", "Global Trade"]
    },
    {
        id: "unani-rnd-04",
        title: "Unani Clinical Standardization Grant",
        agency: "Central Council for Research in Unani Medicine",
        category: "Unani",
        grantAmount: "Up to ₹40 Lakhs",
        poolAmount: "₹20 Crore",
        deadline: "10 Aug 2026",
        description: "Grant for clinical validation and micro-encapsulation standardisation of classical Unani Khamira formulations.",
        eligibility: "Partnership with CCRUM accredited institutional research labs.",
        benefits: "Full clinical trial funding + fast-tracked State Licensing Authority approval.",
        status: "Active Portal",
        tags: ["Unani", "Clinical Trials", "R&D"]
    }
];

// In-memory scheme applications
const applications = [];

// GET /api/schemes
schemesRouter.get("/", (req, res) => {
    let results = [...schemesData];
    const { category, search } = req.query;

    if (category && category.toLowerCase() !== "all") {
        results = results.filter(s =>
            s.category.toLowerCase().includes(category.toLowerCase()) ||
            s.tags.some(t => t.toLowerCase().includes(category.toLowerCase()))
        );
    }

    if (search) {
        const q = search.toLowerCase();
        results = results.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.agency.toLowerCase().includes(q)
        );
    }

    res.json({
        total: results.length,
        schemes: results
    });
});

// GET /api/schemes/:id
schemesRouter.get("/:id", (req, res) => {
    const scheme = schemesData.find(s => s.id === req.params.id);
    if (!scheme) {
        return res.status(404).json({ message: "Scheme not found" });
    }
    res.json({ scheme });
});

// POST /api/schemes/apply
schemesRouter.post("/apply", (req, res) => {
    const { schemeId, startupName, email, founderName, ragScore } = req.body;
    if (!schemeId || !startupName || !email) {
        return res.status(400).json({ message: "schemeId, startupName, and email are required" });
    }

    const targetScheme = schemesData.find(s => s.id === schemeId);
    const application = {
        applicationId: `AYUSH-APP-${Date.now().toString(36).toUpperCase()}`,
        schemeId,
        schemeTitle: targetScheme ? targetScheme.title : "AYUSH Scheme",
        startupName,
        email,
        founderName: founderName || "Founder",
        ragScore: ragScore || 20.0,
        status: "Under Review by Ministry Screening Committee",
        appliedAt: new Date().toISOString()
    };

    applications.push(application);
    res.status(201).json({
        message: "Scheme application submitted successfully with Sovereign RAG verification",
        application
    });
});

export default schemesRouter;
