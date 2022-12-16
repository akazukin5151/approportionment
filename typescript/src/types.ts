export type Setup = {
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  x_scale: d3.ScaleLinear<number, number, never>;
  y_scale: d3.ScaleLinear<number, number, never>;
  drag: d3.DragBehavior<any, Circle, Circle | d3.SubjectPosition>;
};

// This array has a len of 200 * 200 (the domain and range of the graph)
export type Simulation = Array<
  // This array always has a len of 2. It is a tuple of (voter means, seats by party)
  Array<
    // Voter means: The array always has len of 2, as it is a tuple of (x, y)
    // Seats by party: The array always has len of n_parties. The value of the ith element
    // is the number of seats won by the ith party
    Array<number>
  >
>;

export type Color = string;

export type Circle = { x: number, y: number, color: Color };
