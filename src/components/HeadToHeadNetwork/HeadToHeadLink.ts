import type { HeadToHeadNode } from './HeadToHeadNode';

export interface HeadToHeadLink {
  source: string | HeadToHeadNode;
  target: string | HeadToHeadNode;
}
