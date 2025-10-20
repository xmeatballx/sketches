class Range extends HTMLInputElement {
  constructor() {
    super();
    this.type = "range";
    this.min = 0;
    this.max = 1;
    this.step = .01;
  }
}

customElements.define("my-range", Range, { extends: "input" }); 
