'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function SpatialCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050508, 0.04)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, 7)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Spatial Group
    const mainGroup = new THREE.Group()
    scene.add(mainGroup)

    // 1. Central Prismatic Core (Icosahedron with wireframe + glass-like core)
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 1)
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x181824,
      roughness: 0.15,
      metalness: 0.85,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    mainGroup.add(coreMesh)

    // 2. Wireframe Cage
    const wireGeo = new THREE.IcosahedronGeometry(1.68, 1)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    mainGroup.add(wireMesh)

    // 3. Floating Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(2.3, 0.02, 16, 100)
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.2,
    })
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
    ring1.rotation.x = Math.PI / 3
    mainGroup.add(ring1)

    const ring2Geo = new THREE.TorusGeometry(2.7, 0.015, 16, 100)
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15,
    })
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = -Math.PI / 4
    ring2.rotation.y = Math.PI / 6
    mainGroup.add(ring2)

    // 4. Ambient Data Particles
    const particleCount = 200
    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14
      particlePositions[i + 1] = (Math.random() - 0.5) * 14
      particlePositions[i + 2] = (Math.random() - 0.5) * 10 - 2
    }

    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    )

    const particleMat = new THREE.PointsMaterial({
      color: 0xc4b5fd,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(5, 5, 4)
    scene.add(keyLight)

    const violetLight = new THREE.PointLight(0x8b5cf6, 4, 15)
    violetLight.position.set(-3, -2, 2)
    scene.add(violetLight)

    const cyanLight = new THREE.PointLight(0x38bdf8, 3, 15)
    cyanLight.position.set(3, -3, -1)
    scene.add(cyanLight)

    // Interaction & Animation Loop
    let targetX = 0
    let targetY = 0
    let targetScroll = 0
    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2
      targetY = -(e.clientY / window.innerHeight - 0.5) * 2
    }

    const handleScroll = () => {
      const maxScroll = Math.max(
        document.body.scrollHeight - window.innerHeight,
        1
      )
      targetScroll = window.scrollY / maxScroll
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Clock
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Slow idle rotations
      coreMesh.rotation.y = elapsedTime * 0.15
      coreMesh.rotation.x = Math.sin(elapsedTime * 0.2) * 0.2
      wireMesh.rotation.y = -elapsedTime * 0.12
      wireMesh.rotation.x = Math.cos(elapsedTime * 0.15) * 0.15

      ring1.rotation.z = elapsedTime * 0.2
      ring2.rotation.z = -elapsedTime * 0.15

      // Particle subtle drifting
      particles.rotation.y = elapsedTime * 0.02

      // Scroll-driven positioning and rotation
      // In hero (scroll = 0): positioned slightly to the right or center
      // On scroll down: smoothly glides and changes angles
      const scrollRotation = targetScroll * Math.PI * 2
      const scrollYOffset = targetScroll * -2.5

      // Smooth interpolation (lerp)
      mainGroup.rotation.y += (targetX * 0.35 + scrollRotation * 0.5 - mainGroup.rotation.y) * 0.05
      mainGroup.rotation.x += (-targetY * 0.35 + Math.sin(scrollRotation) * 0.3 - mainGroup.rotation.x) * 0.05
      mainGroup.position.y += (scrollYOffset - mainGroup.position.y) * 0.05

      // Horizontal subtle parallax response
      const targetPosX = targetX * 0.3
      mainGroup.position.x += (targetPosX - mainGroup.position.x) * 0.05

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      coreGeometry.dispose()
      coreMaterial.dispose()
      wireGeo.dispose()
      wireMat.dispose()
      ring1Geo.dispose()
      ring1Mat.dispose()
      ring2Geo.dispose()
      ring2Mat.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-85 transition-opacity duration-1000"
      aria-hidden="true"
    />
  )
}
