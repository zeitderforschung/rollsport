import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Paper, Stack, Text, Group } from '@mantine/core';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';

import type { SkaterResult } from '../../types/SkaterResult';
import type { HeadToHeadNode } from './HeadToHeadNode';
import type { HeadToHeadLink } from './HeadToHeadLink';
import { buildGraph } from './buildGraph';
import { COLORS } from './colors';

interface HeadToHeadNetworkProps {
  results: SkaterResult[];
  maxHeight?: number;
}

export function HeadToHeadNetwork({
  results,
  maxHeight = 800,
}: HeadToHeadNetworkProps) {
  const [selectedNode, setSelectedNode] = useState<HeadToHeadNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: maxHeight });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const graphData = useMemo(() => buildGraph(results), [results]);

  // Handle responsive sizing with aspect ratio
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Only update if we have a valid width
        if (containerWidth > 0) {
          // Use aspect ratio to calculate height (16:9 for landscape, or custom)
          // For mobile, use a taller aspect ratio (4:3)
          const isMobile = containerWidth < 768;
          const aspectRatio = isMobile ? 4 / 3 : 16 / 9;

          // Calculate height from aspect ratio
          const aspectHeight = containerWidth / aspectRatio;

          // Cap at viewport height minus some padding for header/footer (150px buffer)
          const maxViewportHeight = window.innerHeight - 150;

          // Use the smallest of: aspect ratio height, maxHeight prop, or viewport height
          const calculatedHeight = Math.min(aspectHeight, maxHeight, maxViewportHeight);

          setDimensions({
            width: containerWidth,
            height: calculatedHeight,
          });
        }
      }
    };

    // Initial size - use a small delay to ensure container is rendered
    const timer = setTimeout(updateDimensions, 0);

    // Update on resize
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [maxHeight]);

  // Configure d3 forces for better node spacing
  useEffect(() => {
    if (graphRef.current && graphData.nodes.length > 0) {
      // Small delay to ensure the graph is fully initialized
      const timer = setTimeout(() => {
        if (graphRef.current) {
          const fg = graphRef.current;

          try {
            // Configure charge force (node repulsion) - stronger for larger nodes
            const chargeForce = fg.d3Force('charge');
            if (chargeForce) {
              chargeForce.strength((node: HeadToHeadNode) => -300 * (1 + node.wins * 0.3));
            }

            // Configure link force (edge attraction) - winner pulls losers closer
            const linkForce = fg.d3Force('link');
            if (linkForce) {
              linkForce.distance((link: HeadToHeadLink) => {
                const source = link.source as HeadToHeadNode;
                // Winners (more wins) pull nodes closer
                return 120 - (source.wins * 8);
              }).strength(1.5);  // Very strong pull to create clear hub
            }

            // Configure center force (gravity toward center)
            const centerForce = fg.d3Force('center');
            if (centerForce) {
              centerForce.strength(0.05);  // Gentle center pull
            }

            // Fit to canvas when engine stops
            fg.onEngineStop(() => {
              if (graphRef.current) {
                graphRef.current.zoomToFit(400);
              }
            });

            // Reheat simulation to apply changes
            fg.d3ReheatSimulation();
          } catch (error) {
            console.warn('Could not configure d3 forces:', error);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [graphData]);

  // Handle node click
  const handleNodeClick = useCallback((node: HeadToHeadNode) => {
    setSelectedNode(node);

    // Zoom camera to selected node
    const distance = 150;
    const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);

    if (graphRef.current) {
      graphRef.current.cameraPosition(
        {
          x: (node.x || 0) * distRatio,
          y: (node.y || 0) * distRatio,
          z: (node.z || 0) * distRatio
        },
        node,
        1000
      );
    }
  }, []);

  // Handle background click to unfocus
  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  }, []);

  // Handle node hover
  const handleNodeHover = useCallback((node: HeadToHeadNode | null) => {
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'grab';
    }
  }, []);

  // Custom 3D node rendering with SpriteText
  const nodeThreeObject = useCallback((node: HeadToHeadNode) => {
    const sprite = new SpriteText(node.name);
    sprite.material.depthWrite = false; // make sprite background transparent
    sprite.color = node.color;
    sprite.textHeight = node.size * 0.8; // Scale text with node size
    return sprite;
  }, []);

  // Link color - use source node color
  const linkColor = useCallback((link: HeadToHeadLink) => {
    const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
    return sourceNode?.color || COLORS.CYAN;
  }, [graphData.nodes]);

  // Particle color - use target node color
  const linkDirectionalParticleColor = useCallback((link: HeadToHeadLink) => {
    const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target);
    return targetNode?.color || COLORS.CYAN;
  }, [graphData.nodes]);

  return (
    <Paper shadow="sm" p="md" withBorder radius="md" className="fade-in">
      <Stack gap="sm">
        <Stack gap={4}>
          <Text size="lg" fw={600}>Head-to-Head Network</Text>
          <Text size="xs" c="dimmed">
            Drag to rotate • Scroll to zoom • Click node to focus
          </Text>
        </Stack>

        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: `${dimensions.height}px`,
            position: 'relative',
            background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1b1e 100%)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {dimensions.width > 0 && dimensions.height > 0 && (
            <ForceGraph3D
              ref={graphRef}
              graphData={graphData}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="rgba(0,0,0,0)"
              nodeLabel={(node: HeadToHeadNode) =>
                `<span style="background: rgba(0,0,0,0.9); padding: 8px 12px; border-radius: 6px; font-family: sans-serif; display: inline-block;">` +
                `<span style="font-weight: 600; color: ${node.color}; display: block; margin-bottom: 4px;">${node.name}</span>` +
                `<span style="font-size: 12px; color: #c1c2c5; display: block;">Rank #${node.rank} • ${node.wins} wins</span>` +
                `<span style="font-size: 11px; color: #909296; display: block; margin-top: 4px;">Click to focus</span>` +
                `</span>`
              }
              nodeThreeObject={nodeThreeObject}
              nodeThreeObjectExtend={true}
              linkColor={linkColor}
              linkWidth={2}
              linkDirectionalArrowLength={8}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowColor={linkColor}
              linkCurvature={0.25}
              linkOpacity={0.6}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.006}
              linkDirectionalParticleWidth={2}
              linkDirectionalParticleColor={linkDirectionalParticleColor}
              enableNodeDrag={true}
              enableNavigationControls={true}
              controlType="trackball"
              showNavInfo={false}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              onBackgroundClick={handleBackgroundClick}
              d3VelocityDecay={0.4}
              d3AlphaDecay={0.0228}
              warmupTicks={150}
              cooldownTicks={Infinity}
              cooldownTime={20000}
            />
          )}
        </div>

        <Group justify="space-between">
          <Group gap="md">
            <Group gap={4}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: COLORS.GOLD, boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)' }} />
              <Text size="xs" c="dimmed">1st</Text>
            </Group>
            <Group gap={4}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: COLORS.SILVER, boxShadow: '0 0 6px rgba(192, 192, 192, 0.4)' }} />
              <Text size="xs" c="dimmed">2nd</Text>
            </Group>
            <Group gap={4}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: COLORS.BRONZE, boxShadow: '0 0 6px rgba(205, 127, 50, 0.4)' }} />
              <Text size="xs" c="dimmed">3rd</Text>
            </Group>
            <Group gap={4}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: COLORS.CYAN }} />
              <Text size="xs" c="dimmed">Others</Text>
            </Group>
          </Group>
          <Text size="xs" c="dimmed">
            {selectedNode ? 'Focused on ' + selectedNode.name : `${graphData.nodes.length} skaters • ${graphData.links.length} victories`}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
