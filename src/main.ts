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

const root = document.body;
const scene = new Scene();
const camera = new PerspectiveCamera();
const grid = { colum: 14, row: 4 } as const;
const mouse = new Vector2(NaN, NaN);
const panels = Array.from({ length: grid.colum * grid.row }, () => {
  const geometry = new PlaneGeometry();
  const material = new MeshBasicMaterial({
    color: new Color("white"),
    transparent: true,
  });
  const mesh = new Mesh(geometry, material);
  return mesh;
});
const renderer = new WebGLRenderer();
const canvas = renderer.domElement;
const raycaster = new Raycaster();

function drawRect() {
  initPanels(panels);
  raycaster.setFromCamera(mouse, camera);
  const [intersect] = raycaster.intersectObjects(panels);
  if (!intersect) return;

  (intersect.object as Mesh<
    PlaneGeometry,
    MeshBasicMaterial
  >).material.opacity = 0.25;
  const c16s = ["red", "green", "blue", "cyan", "magenta", "yellow"];
  const c16 = c16s[randomInt(c16s.length - 1)];
  const color = new Color(c16);
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({
    color,
  });
  const mesh = new Mesh(geometry, material);
  mesh.scale.set(0.1, 0.1, 1);
  Object.assign(mesh.position, intersect.point);
  scene.add(mesh);
}

function initPanels(panels: Mesh<PlaneGeometry, MeshBasicMaterial>[]) {
  const width = camera.aspect / grid.colum;
  const height = 1 / grid.row;
  for (const [i, panel] of panels.entries()) {
    panel.material.opacity = 0;
    panel.scale.set(width, height, 1);
    Object.assign(panel.position, {
      x: width * ((i % grid.colum) - (grid.colum - 1) / 2),
      y: height * (-Math.floor(i / grid.colum) + (grid.row - 1) / 2),
    });
  }
}

const layouts = {
  default: [
    `\` 1 2 3 4 5 6 7 8 9 0 - = Backspace`,
    `Tab q w e r t y u i o p [ ] \\`,
    `CapsLock a s d f g h j k l ; ' Enter`,
    `Shift z x c v b n m , . /`,
  ],
  shift: [
    `~ ! @ # $ % ^ & * ( ) _ + Backspace`,
    `Tab Q W E R T Y U I O P { } |`,
    `CapsLock A S D F G H J K L : " Enter`,
    `Shift Z X C V B N M < > ?`,
  ],
} as const;

function position(
  layout: readonly string[],
  key: string
): [number, number] | [] {
  const [x, y] = layout
    .map((row) => row.split(" ").indexOf(key))
    .flatMap((x, y) => (x >= 0 ? [x, y] : []));

  return x >= 0 ? [x, y] : [];
}

function handleKeydown({ key }: KeyboardEvent) {
  if (key === " ") {
    scene.clear();
    setup();
    return;
  }

  const [x = randomInt(grid.colum - 1), y = randomInt(grid.row - 1)] = [
    ...position(layouts.default, key),
    ...position(layouts.shift, key),
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

function setup() {
  scene.background = new Color();
  initPanels(panels);
  scene.add(...panels);
  camera.position.z = 1;
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
}

function tick() {
  window.requestAnimationFrame(tick);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function main() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  Object.assign(canvas.style, { width: "100vw", height: "100vh" });
  root.appendChild(canvas);
  setup();
  tick();
}

main();
