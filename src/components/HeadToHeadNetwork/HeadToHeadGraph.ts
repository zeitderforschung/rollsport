import type { HeadToHeadNode } from './HeadToHeadNode';
import type { HeadToHeadLink } from './HeadToHeadLink';

export interface HeadToHeadGraph {
  nodes: HeadToHeadNode[];
  links: HeadToHeadLink[];
}
