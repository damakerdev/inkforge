import { type Note } from '../stores/useNoteStore';

export const extractTags = (content: string): string[] => {
    const tagRegex = /(?:^|\s)#([a-zA-Z][a-zA-Z0-9_-]*)/g;
    const tags = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(content)) !== null) {
        tags.add(match[1].toLowerCase());
    }
    return Array.from(tags);
};

export const getAllTags = (notes: Note[]): Map<string, number> => {
    const counts = new Map<string, number>();
    notes.forEach((note) => {
        extractTags(note.content).forEach((tag) => {
            counts.set(tag, (counts.get(tag) || 0) + 1);
        });
    });
    return counts;
};