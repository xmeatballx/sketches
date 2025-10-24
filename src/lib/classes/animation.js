class Animation {
  constructor(frameFactory = null) {
    this.frames = [];
    this.currentFrame = 0;
    this.frameRate = 1;
    this.playState = 'idle';
    this.frameAccumulator = 0;
    this.frameFactory = frameFactory;
  }
  
  play() { this.playState = 'playing'; }
  pause() { this.playState = 'paused'; }
  stop() { 
    this.playState = 'idle';
    this.currentFrame = 0;
  }
  
  scrub(frame) {
    this.currentFrame = Math.max(0, Math.min(frame, this.frames.length - 1));
  }
  
  getCurrentFrame() {
    return this.frames[this.currentFrame];
  }
  
  update(deltaTime) {
    if (this.playState !== 'playing') return;
    this.frameAccumulator += deltaTime / 1000;
    const frameTime = 1 / this.frameRate;
    
    while (this.frameAccumulator >= frameTime) {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.frameAccumulator -= frameTime;
    }
  }
  
  setLength(n) {
    if (n > this.frames.length) {
      while (this.frames.length < n) {
        this.frames.push(this.frameFactory());
      }
    } else {
      this.frames.length = n;
    }
    this.scrub(Math.min(this.currentFrame, this.frames.length - 1));
  }
  
  getFrame(index) {
    return this.frames[index];
  }
  
  setFrame(index, frame) {
    if (index >= 0 && index < this.frames.length) {
      this.frames[index] = frame;
    }
  }
}

