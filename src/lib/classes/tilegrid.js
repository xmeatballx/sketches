class TileGrid {
  constructor(rows, cols, rowSize, colSize, tileFactory) {
    this.tiles = [];
    this.rows = rows;
    this.cols = cols;
    this.rowSize = rowSize;
    this.colSize = colSize;
    this.w = rowSize*rows-rowSize;
    this.d = colSize*cols-colSize;
    this.activeTile = null;
    let i = 0;
    for (let z = 0; z < cols; z++) {
      for (let x = 0; x < rows; x++) {
        let pos = this.getCellPosition(x, z);
        this.tiles[i] = tileFactory({
          row: x,
          col: z,
          pos,
          rowSize,
          index: i,
          colSize
        }); 
        i++;
      }
    }
  }
  resetActiveTile() {
    this.activeTile = null;
  }
  setActiveTile(row, col) {
    this.activeTile = this.tiles[row+col*this.rows];
  }
  getActiveTile() {
    return this.activeTile;
  }
  getTile(x, z) {
    return this.tiles[x+z*this.rows]
  }
  getCellPosition(row, col) {
    return {
      x: row*this.rowSize-this.w/2,
      y: 0,
      z: (col*this.colSize)-this.d/2
    }
  }
}

