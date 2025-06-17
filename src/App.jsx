import React, { useEffect, useState, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";

const mockHCPs = [
    { id: "hcp-1", name: "Dr. Emily Carter", education: "Stanford University School of Medicine", experience: "Chief of Cardiology at General Hospital", publications: ["The Future of Heart Disease Treatment", "Advanced Cardiac Imaging Techniques", "Genetics in Cardiology"] },
    { id: "hcp-2", name: "Dr. Ben Zhao", education: "Johns Hopkins University", experience: "Senior Cardiologist at City Clinic", publications: ["Advanced Cardiac Imaging Techniques", "Case Studies in Myocardial Infarction"] },
    { id: "hcp-3", name: "Dr. Sofia Reyes", education: "Harvard Medical School", experience: "Pediatric Cardiologist at Children's Hospital", publications: ["Congenital Heart Defects in Newborns", "The Future of Heart Disease Treatment"] },
    { id: "hcp-4", name: "Dr. Kenji Tanaka", education: "University of Tokyo", experience: "Researcher at The Heart Institute", publications: ["Genetics in Cardiology", "Advanced Cardiac Imaging Techniques"] },
    { id: "hcp-5", name: "Dr. Maria Garcia", education: "University of Barcelona", experience: "Cardiologist at Mercy West", publications: ["Preventive Cardiology Strategies"] },
];
const createMockLinks = (hcps) => {
    const links = {};
    hcps.forEach((a, i) =>
        hcps.slice(i + 1).forEach((b) => {
            const shared = a.publications.filter((p) => b.publications.includes(p));
            if (shared.length) {
                const key = [a.id, b.id].sort().join("-");
                links[key] = { source: a.id, target: b.id, sharedPublications: shared };
            }
        })
    );
    return Object.values(links);
};
const allMockData = { nodes: mockHCPs, links: createMockLinks(mockHCPs) };

const InfoPanel = ({ details, allNodes }) => {
    if (!details) {
        return (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg h-full flex flex-col justify-center">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">Network Explorer</h3>
                <p className="text-sm">Search for an HCP by name to view their network.</p>
                <p className="text-xs mt-4">Or click on any node/link in the graph.</p>
            </div>
        );
    }
    if (details.source && details.target) {
        const src = allNodes.find((n) => n.id === details.source);
        const tgt = allNodes.find((n) => n.id === details.target);
        return (
            <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200 h-full flex flex-col">
                <h3 className="text-lg font-bold text-indigo-700 mb-4">Connection Details</h3>
                <div className="text-center mb-6 flex items-center justify-center space-x-2">
                    <span className="font-semibold text-gray-800">{src?.name}</span>
                    <span className="text-indigo-500 text-xl">↔</span>
                    <span className="font-semibold text-gray-800">{tgt?.name}</span>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600 text-sm mb-2">Shared Publications</h4>
                    {details.sharedPublications.length > 0 ? (
                        <ul className="space-y-2 text-sm text-gray-700">
                            {details.sharedPublications.map((pub, i) => (
                                <li key={i} className="p-2 bg-gray-50 rounded-md">📄 {pub}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No shared publications.</p>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200 h-full flex flex-col">
            <h3 className="text-lg font-bold text-blue-700 mb-4">HCP Profile</h3>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {details.name?.substring(0, 2).toUpperCase() || "N/A"}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-xl">{details.name}</p>
                    <p className="text-sm text-gray-500">{details.id}</p>
                </div>
            </div>
            <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                <div>
                    <h4 className="font-semibold text-gray-600 text-sm mb-2">Education</h4>
                    <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md">{details.education}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600 text-sm mb-2">Work Experience</h4>
                    <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md">{details.experience}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600 text-sm mb-2">Publications</h4>
                    <ul className="space-y-1">
                        {details.publications.map((pub, i) => (
                            <li key={i} className="text-xs text-gray-700 p-2 bg-gray-50 rounded-md truncate" title={pub}>
                                {pub}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [searchInput, setSearchInput] = useState("");
    const [centeredNode, setCenteredNode] = useState(null);
    const [detailedInfo, setDetailedInfo] = useState(null);
    const graphRef = useRef();

    const handleSearch = () => {
        const term = searchInput.trim().toLowerCase();
        if (!term) {
            setCenteredNode(null);
            setGraphData({ nodes: [], links: [] });
            setDetailedInfo(null);
            return;
        }
        const found = allMockData.nodes.find((n) =>
            n.name.toLowerCase().includes(term)
        );
        setCenteredNode(found || null);
    };

    useEffect(() => {
        if (!centeredNode) {
            setGraphData({ nodes: [], links: [] });
            return;
        }
        const ids = new Set([centeredNode.id]);
        const direct = allMockData.links.filter(
            (l) => l.source === centeredNode.id || l.target === centeredNode.id
        );
        direct.forEach((l) => {
            ids.add(l.source);
            ids.add(l.target);
        });
        const nodes = allMockData.nodes.filter((n) => ids.has(n.id));
        const links = allMockData.links.filter(
            (l) => ids.has(l.source) && ids.has(l.target)
        );
        setGraphData({ nodes, links });
        setDetailedInfo(centeredNode);

        setTimeout(() => {
            const node = nodes.find((n) => n.id === centeredNode.id);
            if (graphRef.current && node) {
                graphRef.current.centerAt(node.x, node.y, 1000);
                graphRef.current.zoom(5, 500);
            }
        }, 100);
    }, [centeredNode]);

    const handleNodeClick = useCallback((n) => setDetailedInfo(n), []);
    const handleLinkClick = useCallback((l) => setDetailedInfo(l), []);
    const nodeCanvasObject = useCallback((node, ctx, scale) => {
        const fontSize = 14 / scale;
        const isCenter = centeredNode?.id === node.id;
        if (isCenter) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(0,123,255,0.25)";
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = isCenter ? "#0056b3" : "#007bff";
        ctx.fill();
        ctx.font = `600 ${fontSize}px Poppins, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#343a40";
        ctx.fillText(node.name, node.x, node.y + 14);
    }, [centeredNode]);

    return (
        <div className="flex h-screen font-sans bg-gray-100">
            <div className="w-[400px] bg-white p-6 shadow-lg border-r border-gray-200 z-10 flex flex-col">
                <h1 className="font-bold text-3xl text-gray-800 mb-1">HCP Network</h1>
                <p className="text-sm text-gray-500 mb-6">Explore professional connections in healthcare.</p>
                <div className="flex flex-row gap-4 flex-1 h-full">
                    <div className="w-1/3 flex flex-col gap-2">
                        <input
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Search by HCP name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button
                            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
                            onClick={handleSearch}
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <InfoPanel details={detailedInfo} allNodes={allMockData.nodes} />
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-gray-50 relative">
                <ForceGraph2D
                    ref={graphRef}
                    graphData={graphData}
                    width={window.innerWidth - 400}
                    height={window.innerHeight}
                    nodeCanvasObject={nodeCanvasObject}
                    onNodeClick={handleNodeClick}
                    onLinkClick={handleLinkClick}
                    linkColor={() => "rgba(0,0,0,0.15)"}
                    linkLabel={(l) => `Co-authored ${l.sharedPublications.length} pub(s)`}
                    linkWidth={2}
                    d3ForceManyBody={-250}
                />
                {graphData.nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xl pointer-events-none">
                        Please search for an HCP to begin.
                    </div>
                )}
            </div>
        </div>
    );
}
