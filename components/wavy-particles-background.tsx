"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const particleVertex = `
  attribute float scale;
  uniform float uTime;

  void main() {
    vec3 p = position;
    float s = scale;

    p.y += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
    p.x += (sin(p.y + uTime) * 0.5);
    s += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = s * 15.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragment = `
  void main() {
    float distance = length(gl_PointCoord - vec2(0.5, 0.5));
    if (distance > 0.5) {
      discard;
    }
    
    // Create a gradient from purple to blue
    vec3 color1 = vec3(0.5, 0.2, 0.9); // Purple
    vec3 color2 = vec3(0.2, 0.4, 0.9); // Blue
    vec3 finalColor = mix(color1, color2, gl_PointCoord.x);
    
    gl_FragColor = vec4(finalColor, 0.7 * (1.0 - distance * 2.0));
  }
`

export default function WavyParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Three.js
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 6, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0) // Transparent background

    // Create particles
    const gap = 0.3
    const amountX = Math.min(150, Math.floor(window.innerWidth / 15)) // Adaptive grid size
    const amountY = Math.min(150, Math.floor(window.innerHeight / 15))
    const particleNum = amountX * amountY
    const particlePositions = new Float32Array(particleNum * 3)
    const particleScales = new Float32Array(particleNum)

    let i = 0
    let j = 0

    for (let ix = 0; ix < amountX; ix++) {
      for (let iy = 0; iy < amountY; iy++) {
        particlePositions[i] = ix * gap - (amountX * gap) / 2
        particlePositions[i + 1] = 0
        particlePositions[i + 2] = iy * gap - (amountY * gap) / 2
        particleScales[j] = Math.random() * 0.5 + 0.5 // Random scale for more natural look
        i += 3
        j++
      }
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute("scale", new THREE.BufferAttribute(particleScales, 1))

    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
      },
      depthWrite: false,
    })

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // Animation loop
    let time = 0
    const animate = () => {
      time += 0.01
      particleMaterial.uniforms.uTime.value = time
      particles.rotation.y += 0.001

      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameRef.current)

      particleGeometry.dispose()
      particleMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  )
}
