import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
} from "three";
import { Synth } from "tone";
import randomInt from "./randomInt";
import keyPosition from "./keyPosition";
import keyLayouts from "./config/keyLayouts";
import pallet from "./config/pallet";

const root = document.body;
const scene = new Scene();
const camera = new PerspectiveCamera();
const grid = { colum: 14, row: 4 } as const;
const mouse = new Vector2(NaN, NaN);
const panels = Array.from({ length: grid.colum * grid.row }, () => {
  const geometry = new PlaneGeometry();
  const material = new MeshBasicMaterial({ opacity: 0 });
  const mesh = new Mesh(geometry, material);
  return mesh;
});
const renderer = new WebGLRenderer();
const canvas = renderer.domElement;
const raycaster = new Raycaster();
const synth = new Synth({ oscillator: { type: "square" } }).toDestination();

function render() {
  renderer.render(scene, camera);
}

function drawRect() {
  raycaster.setFromCamera(mouse, camera);
  const [intersect] = raycaster.intersectObjects(panels);
  if (!intersect) return;

  try {
    // FIXME: Error: Start time must be strictly greater than previous start time.
    synth.triggerAttackRelease("C4", "16n");
  } catch {}

  const color = pallet[randomInt(pallet.length - 1)];
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({ color });
  const mesh = new Mesh(geometry, material);
  const offset = () => 0.05 * (Math.random() - 0.5);
  mesh.scale.set(0.075 + offset(), 0.075 + offset(), 0);
  Object.assign(mesh.position, intersect.point);
  scene.add(mesh);
  render();
  // NOTE: 1度だけだと正しく表示されないことがあるのでもう一度renderする。原因よくわからない。
  window.requestAnimationFrame(render);
}

function handleKeydown({ key }: KeyboardEvent) {
  if (key === " ") return setup();

  const [x = randomInt(grid.colum - 1), y = randomInt(grid.row - 1)] = [
    ...keyPosition(keyLayouts.default, key),
    ...keyPosition(keyLayouts.shift, key),
  ];

  const offset = () => Math.random() - 0.5;
  mouse.x = ((x + offset()) / (grid.colum - 1)) * 2 - 1;
  mouse.y = -((y + offset()) / (grid.row - 1)) * 2 + 1;

  drawRect();
}

function handleMouseMove(event: { clientX: number; clientY: number }) {
  const offset = () => 0.2 * (Math.random() - 0.5);
  mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1 + offset();
  mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1 + offset();

  drawRect();
}

function handleTouchmove(event: TouchEvent) {
  event.preventDefault();
  [...event.touches].map(handleMouseMove);
}

function handleMouseMoveEnd() {
  mouse.set(NaN, NaN);
}

function adjustPanelSize() {
  const width = camera.aspect / grid.colum;
  const height = 1 / grid.row;
  for (const [i, panel] of panels.entries()) {
    panel.scale.set(width, height, 1);
    Object.assign(panel.position, {
      x: width * ((i % grid.colum) - (grid.colum - 1) / 2),
      y: height * (-Math.floor(i / grid.colum) + (grid.row - 1) / 2),
    });
  }
}

function adjustRendererSize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  adjustPanelSize();
  render();
}

function setup() {
  scene.background = new Color();
  scene.clear();
  scene.add(...panels);
  camera.position.z = 1;
  adjustRendererSize();
}

function main() {
  Object.assign(canvas.style, { width: "100%", height: "100%" });
  root.addEventListener("keydown", handleKeydown);
  root.addEventListener("touchstart", handleTouchmove, { passive: false });
  root.addEventListener("touchmove", handleTouchmove, { passive: false });
  root.addEventListener("mousedown", handleMouseMove);
  root.addEventListener("mousedown", () => {
    root.addEventListener("mousemove", handleMouseMove);
  });
  for (const event of ["mouseup", "mouseleave"] as const) {
    root.addEventListener(event, () => {
      root.removeEventListener("mousemove", handleMouseMove);
    });
  }
  for (const event of ["keyup", "mouseup", "mouseleave", "touchend"] as const) {
    root.addEventListener(event, handleMouseMoveEnd);
  }
  root.appendChild(canvas);
  Object.assign(root.style, { overflow: "hidden", overscrollBehavior: "none" });
  window.addEventListener("resize", adjustRendererSize);
  setup();
}

main();
