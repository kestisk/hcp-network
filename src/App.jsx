import React, { useEffect, useState, useRef, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import InfoPanel from "./infoPanel.jsx";

const mockHCPs = [
    {
        id: "hcp-1",
        name: "Dr. Emily Carter",
        education: "Stanford University School of Medicine",
        experience: "Chief of Cardiology at General Hospital",
        publications: [
            "The Future of Heart Disease Treatment",
            "Advanced Cardiac Imaging Techniques",
            "Genetics in Cardiology",
        ],
    },
    {
        id: "hcp-2",
        name: "Dr. Ben Zhao",
        education: "Johns Hopkins University",
        experience: "Senior Cardiologist at City Clinic",
        publications: [
            "Advanced Cardiac Imaging Techniques",
            "Case Studies in Myocardial Infarction",
        ],
    },
    {
        id: "hcp-3",
        name: "Dr. Sofia Reyes",
        education: "Harvard Medical School",
        experience: "Pediatric Cardiologist at Children's Hospital",
        publications: [
            "Congenital Heart Defects in Newborns",
            "The Future of Heart Disease Treatment",
        ],
    },
    {
        id: "hcp-4",
        name: "Dr. Kenji Tanaka",
        education: "University of Tokyo",
        experience: "Researcher at The Heart Institute",
        publications: [
            "Genetics in Cardiology",
            "Advanced Cardiac Imaging Techniques",
        ],
    },
    {
        id: "hcp-5",
        name: "Dr. Maria Garcia",
        education: "University of Barcelona",
        experience: "Cardiologist at Mercy West",
        publications: ["Preventive Cardiology Strategies"],
    },
];

const createMockLinks = (hcps) => {
    const links = {};
    hcps.forEach((a, i) =>
        hcps.slice(i + 1).forEach((b) => {
            const shared = a.publications.filter((p) =>
                b.publications.includes(p)
            );
            if (shared.length) {
                const key = [a.id, b.id].sort().join("-");
                links[key] = {
                    source: a.id,
                    target: b.id,
                    sharedPublications: shared,
                };
            }
        })
    );
    return Object.values(links);
};

const allMockData = {
    nodes: mockHCPs,
    links: createMockLinks(mockHCPs),
};

export default function App() {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [searchInput, setSearchInput] = useState("");
    const [centeredNode, setCenteredNode] = useState(null);
    const [detailedInfo, setDetailedInfo] = useState(null);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const graphRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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

        const visibleNodeIds = new Set([centeredNode.id]);

        const directLinks = allMockData.links.filter((link) => {
            const sourceId =
                typeof link.source === "string" ? link.source : link.source.id;
            const targetId =
                typeof link.target === "string" ? link.target : link.target.id;
            return sourceId === centeredNode.id || targetId === centeredNode.id;
        });

        directLinks.forEach((link) => {
            const sourceId =
                typeof link.source === "string" ? link.source : link.source.id;
            const targetId =
                typeof link.target === "string" ? link.target : link.target.id;
            visibleNodeIds.add(sourceId);
            visibleNodeIds.add(targetId);
        });

        const visibleNodes = allMockData.nodes.filter((node) =>
            visibleNodeIds.has(node.id)
        );
        const visibleLinks = allMockData.links.filter((link) => {
            const sourceId =
                typeof link.source === "string" ? link.source : link.source.id;
            const targetId =
                typeof link.target === "string" ? link.target : link.target.id;
            return (
                visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId)
            );
        });

        setGraphData({ nodes: visibleNodes, links: visibleLinks });
        setDetailedInfo(centeredNode);

        setTimeout(() => {
            const node = visibleNodes.find((n) => n.id === centeredNode.id);
            if (graphRef.current && node?.x !== undefined && node?.y !== undefined) {
                graphRef.current.centerAt(node.x, node.y, 1000);
                graphRef.current.zoom(5, 500);
            }
        }, 100);
    }, [centeredNode]);

    const handleNodeClick = useCallback((n) => setDetailedInfo(n), []);
    const handleLinkClick = useCallback((l) => setDetailedInfo(l), []);
    const nodeCanvasObject = useCallback(
        (node, ctx, scale) => {
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
        },
        [centeredNode]
    );

    const sidebarWidth = dimensions.width >= 768 ? 400 : 0;

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans bg-gray-100">
            {/* Sidebar */}
            <div className="w-full md:w-[400px] bg-white p-6 shadow-lg border-b md:border-b-0 md:border-r border-gray-200 z-10 flex flex-col">
                <h1 className="font-bold text-3xl text-gray-800 mb-1">
                    HCP Network
                </h1>
                <p className="text-sm text-gray-500 mb-6">
                    Explore professional connections in healthcare.
                </p>
                <div className="flex flex-col md:flex-row gap-4 flex-1 h-full">
                    <div className="w-full md:w-1/3 flex flex-col gap-2">
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
                    <div className="flex-1 overflow-y-auto max-h-[60vh] md:max-h-full">
                        <InfoPanel
                            details={detailedInfo}
                            allNodes={allMockData.nodes}
                        />
                    </div>
                </div>
            </div>

            {/* Graph */}
            <div className="flex-1 bg-gray-50 relative">
                <ForceGraph2D
                    ref={graphRef}
                    graphData={graphData}
                    width={dimensions.width - sidebarWidth}
                    height={dimensions.height}
                    nodeCanvasObject={nodeCanvasObject}
                    onNodeClick={handleNodeClick}
                    onLinkClick={handleLinkClick}
                    linkColor={() => "rgba(0,0,0,0.15)"}
                    linkLabel={(l) =>
                        `Co-authored ${l.sharedPublications.length} pub(s)`
                    }
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
