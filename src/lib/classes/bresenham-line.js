class BresenhamLine {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.points = [];
  }

  start(startX, startY) {
    this.points = [];
    this.startX = startX;
    this.startY = startY;
  }
  
  calculate(newX, newY) {
    this.points = [];
    const dx = Math.abs(newX - this.startX);
    const dy = Math.abs(newY - this.startY);
    const sx = this.startX < newX ? 1 : -1;  // step direction
    const sy = this.startY < newY ? 1 : -1;
    let err = dx - dy;  // error accumulator
    
    let x = this.startX, y = this.startY;
    
    while (true) {
      let cell = new Cell(1, 1, currentColor);
      cell.setGridCoords(x, y);
      this.points.push(cell);
      
      if (x === newX && y === newY) break;
      
      const e2 = 2 * err;
      
      // Should we step in x?
      if (e2 > -dy) {
	err -= dy;
	x += sx;
      }
      
      // Should we step in y?
      if (e2 < dx) {
	err += dx;
	y += sy;
      }
    }
  }
}

