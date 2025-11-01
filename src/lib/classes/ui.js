class UI {
  constructor() {
    this.elements = {};
    this.actions = new Map();
    this.mouseDown = false;
  }
  
  initialize(elements) {
    this.elements = elements;
    return this;
  }

  registerCanvas(query) {
    this.elements.canvas = document.querySelector(query);
    this.elements.canvas.addEventListener('mousedown', () => this.mouseDown = true);
    this.elements.canvas.addEventListener('mouseup', () => this.mouseDown = false);
    this.elements.canvas.addEventListener('mouseleave', () => this.mouseDown = false);
  }

  onCanvasMouseDown(callback) {
    this.elements.canvas.addEventListener('mousedown', (e) => {
      callback(e);
    });
  }

  onCanvasMouseDrag(callback) {
    this.elements.canvas.addEventListener('mousemove', (e) => {
      if (!this.mouseDown) return;
      callback(e);
    });
  }

  onCanvasMouseMove(callback) {
    this.elements.canvas.addEventListener('mousemove', (e) => {
      callback(e);
    });
  }

  onCanvasClick(callback) {
    this.elements.canvas.addEventListener('click', (e) => {
      callback(e);
    });
  }
  
  registerAction(alias, element, eventType) {
    this.actions.set(alias, { element, eventType });
    return this;
  }
  
  on(alias, callback) {
    const action = this.actions.get(alias);
    if (!action) {
      console.warn(`No action registered for alias: ${alias}`);
      return this;
    }
    
    const { element, eventType } = action;
    if (element instanceof NodeList) element.forEach(el => el.addEventListener(eventType, callback)); 
    else element.addEventListener(eventType, callback);
    
    return this;
  }
}
