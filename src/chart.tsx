import { prettyDate } from "./date";

export interface Point {
  label: string;
  value: number;
}

export const LineChart = ({
  id,
  data,
  title,
  onHover = (_: Point) => {},
  selected = "",
}: {
  id: string;
  data: Point[];
  title: string;
  onHover?: (p: Point) => void;
  selected?: string;
}) => {
  const xMax = data.length;
  if (data.length === 0) {
    return <div>no data</div>;
  }

  // options
  const tickMax = Math.min(5, data.length + 1);
  const margin = { top: 10, bottom: 15, left: 25, right: 0 };
  const strokeWidth = 1;
  const strokeWidthPoint = 3;
  const gridYColor = "#6a708e";
  const gridAxisColor = "#6a708e";
  const pointColor = "#bd93f9";
  const pointSelectedColor = "#ff80bf";
  const fontColor = "#f2f2f2";

  const h = 100;
  const w = 500;
  // adjust width and height to accommodate margins
  const width = w - margin.left - margin.right - strokeWidth * 2;
  const height = h - margin.top - margin.bottom;
  const yValues = data.map((d) => d.value);

  // find the max Y value
  const ySort = [...yValues].sort();
  let dataMaxY = ySort[ySort.length - 1];
  // coerce to 1 to prevent failures calc when (N/0)
  if (dataMaxY === 0) {
    dataMaxY = 1;
  }

  // figure out tick intervals
  const tickIntervalY = dataMaxY / (dataMaxY === 1 ? tickMax : tickMax - 1);
  const yMax = tickIntervalY * tickMax;

  const calcY = (d: number) => {
    // find the y-value's placement on the chart by taking the current value
    // and the max value possible in this chart (including adding an extra
    // tick to the chart)
    const ypct = d / yMax;
    // svg default's 0,0 to be the top-left of the DOM element so we
    // have to do some math to invert the position based on the height of the
    // chart and the y-value's placement
    const y = Math.abs(height - height * ypct) - strokeWidth;
    return y;
  };

  const calcX = (i: number) => {
    // find x-value's placement on the chart by getting it's ratio
    // between its element number in the dedupe'd array and the last
    // element in the array
    const xpct = i / xMax;
    const x = width * xpct;
    return x;
  };

  const plot = (line = true) => {
    const path = data.reduce((acc, d, i) => {
      const x = calcX(i);
      const y = calcY(d.value);
      if (i === 0) return `M${x},${y}`;
      return `${acc} L${x},${y}`;
    }, "");

    // plot the points
    return (
      <g>
        {line ? (
          <path d={path} style={{ stroke: pointColor, fillOpacity: 0 }} />
        ) : null}

        {data.map((d, i) => {
          const x = calcX(i);
          const y = calcY(d.value);
          const isSel = selected === d.label;
          return (
            <g key={`${x},${y}`}>
              <circle
                cx={x}
                cy={y}
                r={40}
                onMouseEnter={() => onHover(d)}
                className="cursor-pointer"
                fillOpacity={0}
              />
              <circle
                cx={x}
                cy={y}
                r={isSel ? 4 : strokeWidthPoint}
                fill={isSel ? pointSelectedColor : pointColor}
              />
            </g>
          );
        })}
      </g>
    );
  };

  const yGrid = (grid = true) => {
    // grid data
    const tickY: number[] = [];
    for (let i = 1; i <= tickMax; i += 1) {
      const y = calcY(i * tickIntervalY);
      tickY.push(y);
    }
    return tickY.map((y, i) => {
      const value = (i + 1) * tickIntervalY;
      return (
        <g key={y}>
          {grid ? (
            <path
              d={`M 0,${y} H ${width}`}
              style={{ stroke: gridYColor }}
              strokeWidth={strokeWidth}
              strokeLinecap="square"
            />
          ) : null}
          <text
            transform={"translate(-5, 4)"}
            x={0}
            y={y}
            fontSize={10}
            fill={fontColor}
            textAnchor="end"
          >
            {yMax <= 10 ? value.toFixed(2) : Math.floor(value)}
          </text>
        </g>
      );
    });
  };

  const xGrid = () => {
    const tickIntervalX = Math.max(Math.floor(xMax / tickMax), 1);
    const actualTickMax = Math.min(xMax, tickMax);
    const tickX: { value: number; label: string }[] = [];
    for (let i = 0; i <= actualTickMax; i += 1) {
      const element = i * tickIntervalX;
      const index = i === actualTickMax ? element - 1 : element;
      const x = calcX(index);
      tickX.push({ value: x, label: data[index].label });
    }

    return (
      <g transform={`translate(0, ${height + 10})`}>
        {tickX.map((opt, i) => {
          return (
            <text
              key={`${opt.label}-${i}`}
              x={opt.value}
              y={0}
              fontSize={8}
              fill={fontColor}
              textAnchor="middle"
            >
              {prettyDate(opt.label)}
            </text>
          );
        })}
      </g>
    );
  };

  const yAxis = () => {
    return (
      <path
        style={{ stroke: gridAxisColor }}
        d={`M -${strokeWidth},${height} V 0`}
      />
    );
  };

  const xAxis = () => {
    return (
      <path style={{ stroke: gridAxisColor }} d={`M 0,${height} H ${width}`} />
    );
  };

  return (
    <svg
      id={id}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full chart"
    >
      <title>{title}</title>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {yGrid(false)}
        {xGrid()}

        <g strokeWidth={strokeWidth} strokeLinecap="square">
          {yAxis()}
          {xAxis()}
        </g>

        <g strokeWidth={strokeWidth} strokeLinecap="square">
          {plot()}
        </g>
      </g>
    </svg>
  );
};
