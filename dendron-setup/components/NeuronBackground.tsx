"use client"

import { useEffect, useRef } from "react"

export default function NeuronBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let width = canvas.width = window.innerWidth
        let height = canvas.height = window.innerHeight

        const nodes: Node[] = []
        const NODE_COUNT = 60
        const CONNECTION_DISTANCE = 150
        const MOUSE_DISTANCE = 200

        class Node {
            x: number
            y: number
            vx: number
            vy: number
            baseX: number
            baseY: number
            size: number

            constructor() {
                this.x = Math.random() * width
                this.y = Math.random() * height
                this.baseX = this.x
                this.baseY = this.y
                this.vx = (Math.random() - 0.5) * 0.5
                this.vy = (Math.random() - 0.5) * 0.5
                this.size = Math.random() * 2 + 1
            }

            update(mouse: { x: number, y: number }) {
                // Brownion motion
                this.x += this.vx
                this.y += this.vy

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1
                if (this.y < 0 || this.y > height) this.vy *= -1

                // Mouse Interaction (Force Field)
                const dx = mouse.x - this.x
                const dy = mouse.y - this.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < MOUSE_DISTANCE) {
                    const forceDirectionX = dx / distance
                    const forceDirectionY = dy / distance
                    const force = (MOUSE_DISTANCE - distance) / MOUSE_DISTANCE
                    const directionX = forceDirectionX * force * 2 // Strength
                    const directionY = forceDirectionY * force * 2

                    this.x -= directionX
                    this.y -= directionY
                } else {
                    // Return to orbit (simplified)
                    if (this.x !== this.baseX) {
                        // this.x -= (this.x - this.baseX) * 0.01;
                    }
                }
            }

            draw() {
                if (!ctx) return
                ctx.fillStyle = "rgba(148, 163, 184, 0.5)" // Slate-400
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push(new Node())
        }

        const mouse = { x: -1000, y: -1000 }

        const handleResize = () => {
            width = canvas.width = window.innerWidth
            height = canvas.height = window.innerHeight
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX
            mouse.y = e.clientY
        }

        window.addEventListener("resize", handleResize)
        window.addEventListener("mousemove", handleMouseMove)

        function animate() {
            if (!ctx) return
            ctx.clearRect(0, 0, width, height)

            // Draw connections first
            for (let a = 0; a < nodes.length; a++) {
                for (let b = a; b < nodes.length; b++) {
                    const dx = nodes[a].x - nodes[b].x
                    const dy = nodes[a].y - nodes[b].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < CONNECTION_DISTANCE) {
                        const opacity = 1 - (distance / CONNECTION_DISTANCE)
                        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.2})`
                        ctx.lineWidth = 1
                        ctx.beginPath()
                        ctx.moveTo(nodes[a].x, nodes[a].y)
                        ctx.lineTo(nodes[b].x, nodes[b].y)
                        ctx.stroke()
                    }
                }
            }

            // Update and draw nodes
            nodes.forEach(node => {
                node.update(mouse)
                node.draw()
            })

            requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("mousemove", handleMouseMove)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-50 bg-[#030712]"
        />
    )
}
