import React from "react";

const InfoPanel = ({details, allNodes}) => {
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
                <div
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
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
                            <li key={i} className="text-xs text-gray-700 p-2 bg-gray-50 rounded-md truncate"
                                title={pub}>
                                {pub}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default InfoPanel;