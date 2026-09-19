/**
 * Extracts all [[WikiLink]] targets from raw markdown content.
 * Example: "Refers to [[Project Roadmap]] and [[Architecture]]"
 * Returns: ["Project Roadmap", "Architecture"]
 */

export const extractWikiLinks = (content: string): string[] => {
    if (!content) return [];
    const wikiLinkRegex = /\[\[(.*?)\]\]/g;
    const matches = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = wikiLinkRegex.exec(content)) !== null) {
        if (match[1] && match[1].trim().length >0) {
            matches.add(match[1].trim());
        }
    }

    return Array.from(matches);
};