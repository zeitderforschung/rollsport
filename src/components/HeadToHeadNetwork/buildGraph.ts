import type { SkaterResult } from '../../types/SkaterResult';
import type { HeadToHeadNode } from './HeadToHeadNode';
import type { HeadToHeadLink } from './HeadToHeadLink';
import type { HeadToHeadGraph } from './HeadToHeadGraph';
import { COLORS } from './colors';

function getNodeColor(rank: number): string {
  switch (rank) {
    case 1: return COLORS.GOLD;
    case 2: return COLORS.SILVER;
    case 3: return COLORS.BRONZE;
    default: return COLORS.CYAN;
  }
}

function getNodeSize(wins: number): number {
  return 8 + (wins * 2); // Scales with wins for clear visual hierarchy
}

export function buildGraph(results: SkaterResult[]): HeadToHeadGraph {
  const nodes: HeadToHeadNode[] = results.map(skater => ({
    id: skater.name,
    name: skater.name,
    rank: skater.rank,
    wins: skater.majorityVictories,
    color: getNodeColor(skater.rank),
    size: getNodeSize(skater.majorityVictories),
  }));

  // Build M.V. map for grouping
  const mvMap = new Map<string, number>();
  results.forEach(skater => {
    mvMap.set(skater.name, skater.majorityVictories);
  });

  // Build rank map for quick lookups
  const rankMap = new Map<string, number>();
  results.forEach(skater => {
    rankMap.set(skater.name, skater.rank);
  });

  // Collect all direct victories
  const allLinks = new Map<string, Set<string>>();
  results.forEach(skater => {
    if (!skater.headToHeadResults) return;

    const victories = new Set<string>();
    skater.headToHeadResults.forEach(h2h => {
      if (h2h.won) {
        victories.add(h2h.opponent);
      }
    });
    allLinks.set(skater.name, victories);
  });

  // Apply global transitive reduction
  // Remove edge A->C if there exists a path A->B->C where B is ranked between A and C
  const reducedLinks = new Map<string, Set<string>>();

  // Helper function to check if there's a path from source to target through an intermediate
  const hasPathThrough = (source: string, target: string, allLinksMap: Map<string, Set<string>>): boolean => {
    const sourceVictories = allLinksMap.get(source);
    if (!sourceVictories) return false;

    const sourceRank = rankMap.get(source)!;
    const targetRank = rankMap.get(target)!;

    // Check all potential intermediates that source directly beats
    for (const intermediate of sourceVictories) {
      if (intermediate === target) continue;

      const intermediateRank = rankMap.get(intermediate)!;

      // Only consider intermediates ranked between source and target
      if (intermediateRank > sourceRank && intermediateRank < targetRank) {
        const intermediateVictories = allLinksMap.get(intermediate);
        // If intermediate also beats target, we found a path
        if (intermediateVictories && intermediateVictories.has(target)) {
          return true;
        }
      }
    }

    return false;
  };

  // Sort skaters by rank (ascending) for top-down processing
  const sortedSkaters = [...results].sort((a, b) => a.rank - b.rank);

  sortedSkaters.forEach(skater => {
    const directVictories = allLinks.get(skater.name);
    if (!directVictories) return;

    const necessaryVictories = new Set<string>();

    directVictories.forEach(target => {
      // Check if this victory can be inferred through any intermediate skater
      if (!hasPathThrough(skater.name, target, allLinks)) {
        necessaryVictories.add(target);
      }
    });

    reducedLinks.set(skater.name, necessaryVictories);
  });

  // Convert to link objects
  const links: HeadToHeadLink[] = [];
  reducedLinks.forEach((targets, source) => {
    targets.forEach(target => {
      links.push({
        source,
        target,
      });
    });
  });

  return { nodes, links };
}
