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

function render() {
  renderer.render(scene, camera);
}

function drawRect() {
  raycaster.setFromCamera(mouse, camera);
  const [intersect] = raycaster.intersectObjects(panels);
  if (!intersect) return;

  const color = pallet[randomInt(pallet.length - 1)];
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({ color });
  const mesh = new Mesh(geometry, material);
  mesh.scale.set(0.1, 0.1, 1);
  Object.assign(mesh.position, intersect.point);
  scene.add(mesh);
  render();
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
  mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;

  drawRect();
}

function handleTouchmove(event: TouchEvent) {
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

function adjustCanvasSize() {
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
  adjustCanvasSize();
}

function main() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  Object.assign(canvas.style, { width: "100vw", height: "100vh" });
  root.addEventListener("keydown", handleKeydown);
  root.addEventListener("touchmove", handleTouchmove);
  root.addEventListener("keyup", handleMouseMoveEnd);
  root.addEventListener("touchend", handleMouseMoveEnd);
  root.addEventListener("mousedown", () => {
    root.addEventListener("mousemove", handleMouseMove);
  });
  for (const event of ["mouseup", "mouseleave"] as const) {
    root.addEventListener(event, () => {
      root.removeEventListener("mousemove", handleMouseMove);
      handleMouseMoveEnd();
    });
  }
  root.appendChild(canvas);
  window.addEventListener("resize", adjustCanvasSize);
  setup();
}

main();
