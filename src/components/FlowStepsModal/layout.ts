import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    // Assuming roughly 150x80 size for nodes
    dagreGraph.setNode(node.id, { width: 180, height: 100 });
  });

  edges.forEach((edge) => {
    if (!edge.id.includes('rw-inflow')) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // We are shifting the dagre node position (anchor=center center) to the top left
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    
    // Pass positions, shifting to top-left corner
    node.position = {
      x: nodeWithPosition.x - 90,
      y: nodeWithPosition.y - 50,
    };

    return node;
  });

  return { nodes, edges };
};
