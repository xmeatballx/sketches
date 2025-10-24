class Clipboard {
  constructor() {
    this.history = [];
  }

  copy(value, copyFunc) {
    this.history.push({
      value,
      copyFunc
    });
  }

  paste() {
    if (this.history.length === 0) return null;
    const entry = this.history[this.history.length - 1];
    return entry.copyFunc(entry.value);
  }

  pop() {
    if (this.history.length === 0) return null;
    const entry = this.history.pop();
    return entry.copyFunc(entry.value);
  }
}

