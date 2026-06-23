import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

export default function EarthGlobe({ markers = [] }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Earth sphere
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x0077B6,
      emissive: 0x003366,
      emissiveIntensity: 0.08,
      shininess: 80,
      transparent: true,
      opacity: 0.95,
      specular: 0x4fc3f7,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Wireframe overlay
    const wireGeo = new THREE.SphereGeometry(1.005, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x48CAE4,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const wireframe = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireframe);

    // Atmosphere glow
    const atmosGeo = new THREE.SphereGeometry(1.15, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x48CAE4,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // Outer glow
    const outerGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x90E0EF,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(outerGeo, outerMat));

    // Continents (simple ring markers at equator-ish)
    const addLandRing = (lat, lon, size, color) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -size * Math.sin(phi) * Math.cos(theta);
      const y = size * Math.cos(phi);
      const z = size * Math.sin(phi) * Math.sin(theta);
      const dotGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      earth.add(dot);
    };

    // Add scattered land points
    const landPoints = [
      [48, 2], [51, 0], [40, -4], [35, 139], [39, 116], [28, 77],
      [-34, 151], [-23, -43], [37, -122], [41, -74], [55, 37],
      [30, 31], [-1, 37], [6, 3], [14, 121], [1, 104], [52, 13],
      [60, 25], [59, 18], [45, 9], [31, 121], [22, 114],
      [-33, 18], [33, -7], [36, 10], [25, 55], [24, 54],
    ];
    landPoints.forEach(([lat, lon]) => addLandRing(lat, lon, 1.01, 0x2E7D32));

    // Event markers
    const markerMeshes = [];
    const severityColors = {
      critical: 0xDC2626, high: 0xFB8C00, moderate: 0xF59E0B, low: 0x0096C7,
    };
    markers.forEach((m) => {
      const phi = (90 - (m.latitude || 0)) * (Math.PI / 180);
      const theta = ((m.longitude || 0) + 180) * (Math.PI / 180);
      const r = 1.02;
      const x = -r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      const markerGeo = new THREE.SphereGeometry(0.025, 12, 12);
      const color = severityColors[m.severity] || 0x38bdf8;
      const markerMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      earth.add(marker);

      // Pulse ring
      const ringGeo = new THREE.RingGeometry(0.03, 0.045, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, z);
      ring.lookAt(0, 0, 0);
      earth.add(ring);
      markerMeshes.push({ ring, mat: ringMat });
    });

    // Orbit ring
    const orbitGeo = new THREE.TorusGeometry(1.6, 0.003, 8, 100);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0x0096C7, transparent: true, opacity: 0.18 });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 3;
    scene.add(orbit);

    // Second orbit
    const orbit2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.002, 8, 100),
      new THREE.MeshBasicMaterial({ color: 0x48CAE4, transparent: true, opacity: 0.12 })
    );
    orbit2.rotation.x = Math.PI / 2.5;
    orbit2.rotation.z = Math.PI / 4;
    scene.add(orbit2);

    // Lights
    const ambient = new THREE.AmbientLight(0xd4eeff, 1.0);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xfff8e7, 1.8);
    directional.position.set(5, 3, 5);
    scene.add(directional);
    const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.6);
    fillLight.position.set(-5, 0, -3);
    scene.add(fillLight);
    const pointLight = new THREE.PointLight(0x48CAE4, 0.4, 10);
    pointLight.position.set(-3, 2, 3);
    scene.add(pointLight);

    // Animation
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.005;
      earth.rotation.y += 0.002;
      wireframe.rotation.y += 0.0015;
      orbit.rotation.z += 0.001;
      orbit2.rotation.z -= 0.0008;

      markerMeshes.forEach((m, i) => {
        const scale = 1 + Math.sin(time * 3 + i) * 0.3;
        m.ring.scale.set(scale, scale, scale);
        m.mat.opacity = 0.2 + Math.sin(time * 3 + i) * 0.2;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [markers]);

  return (
    <div ref={mountRef} className="w-full h-full" />
  );
}