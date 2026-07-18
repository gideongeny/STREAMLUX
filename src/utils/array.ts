/**
 * Interleaves two arrays based on a specified ratio.
 * Example: ratio = 3 means 3 items from primary, 1 from secondary, repeat.
 */
export const interleaveArrays = <T>(primary: T[], secondary: T[], ratio: number = 3): T[] => {
    if (!secondary || secondary.length === 0) return primary || [];
    if (!primary || primary.length === 0) return secondary || [];

    const result: T[] = [];
    let pIdx = 0;
    let sIdx = 0;

    // Deduplicate by ID if dealing with Items
    const seen = new Set<string | number>();
    
    const tryPush = (item: any) => {
        if (item && item.id) {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
        }
        result.push(item);
        return true;
    };

    while (pIdx < primary.length || sIdx < secondary.length) {
        // Add `ratio` items from primary
        let addedPrimary = 0;
        while (addedPrimary < ratio && pIdx < primary.length) {
            if (tryPush(primary[pIdx])) addedPrimary++;
            pIdx++;
        }
        
        // Add 1 item from secondary
        let addedSecondary = 0;
        while (addedSecondary < 1 && sIdx < secondary.length) {
            if (tryPush(secondary[sIdx])) addedSecondary++;
            sIdx++;
        }
    }
    
    return result;
};
