const sketchScript = document.getElementById("sketch");

if (sketchScript) {
  const code = document.createElement("pre");
  code.textContent = sketchScript.textContent;
  document.querySelector("main").appendChild(code);
}
