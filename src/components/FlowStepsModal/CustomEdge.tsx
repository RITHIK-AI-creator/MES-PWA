import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Position,
  type EdgeProps,
} from "@xyflow/react";

const getControlPoint = (
  position: Position,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  const curvature = 0.25;

  const calculateControlOffset = (distance: number) => {
    if (distance >= 0) {
      return 0.5 * distance;
    }

    return curvature * 25 * Math.sqrt(-distance);
  };

  switch (position) {
    case Position.Left:
      return [x1 - calculateControlOffset(x1 - x2), y1];

    case Position.Right:
      return [x1 + calculateControlOffset(x2 - x1), y1];

    case Position.Top:
      return [x1, y1 - calculateControlOffset(y1 - y2)];

    case Position.Bottom:
      return [x1, y1 + calculateControlOffset(y2 - y1)];
  }
};

const CustomEdge = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  style,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const sourceControl = getControlPoint(
    sourcePosition,
    sourceX,
    sourceY,
    targetX,
    targetY,
  );

  const targetControl = getControlPoint(
    targetPosition,
    targetX,
    targetY,
    sourceX,
    sourceY,
  );

  if (!sourceControl || !targetControl) {
    return <BaseEdge path={edgePath} style={style} />;
  }

  /*
   * Find the tangent direction at the middle
   * of the Bezier curve.
   */
  const t = 0.5;

  const dx =
    3 * (1 - t) ** 2 * (sourceControl[0] - sourceX) +
    6 * (1 - t) * t * (targetControl[0] - sourceControl[0]) +
    3 * t ** 2 * (targetX - targetControl[0]);

  const dy =
    3 * (1 - t) ** 2 * (sourceControl[1] - sourceY) +
    6 * (1 - t) * t * (targetControl[1] - sourceControl[1]) +
    3 * t ** 2 * (targetY - targetControl[1]);

  const rotation = Math.atan2(dy, dx) * (180 / Math.PI);

  const stroke = String(style?.stroke ?? "#008000");

  return (
    <>
      <BaseEdge path={edgePath} style={style} />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `
              translate(-50%, -50%)
              translate(${labelX}px, ${labelY}px)
            `,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              transform: `rotate(${rotation}deg)`,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: `11px solid ${stroke}`,
            }}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
