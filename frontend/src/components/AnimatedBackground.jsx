import { useEffect, useRef } from "react";

const AnimatedBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        // Configuration
        const particleCount = 40;
        const lineCount = 3;
        const particles = [];
        const lines = [];

        // Initialize Particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }

        // Initialize Lines (Stock-like)
        for (let i = 0; i < lineCount; i++) {
            const points = [];
            const segmentCount = 15;
            for (let j = 0; j <= segmentCount; j++) {
                points.push({
                    x: (j / segmentCount) * canvas.width,
                    y: canvas.height * (0.3 + Math.random() * 0.4),
                    targetY: canvas.height * (0.3 + Math.random() * 0.4),
                });
            }
            lines.push({
                points,
                color: i % 2 === 0 ? "rgba(34, 211, 238, 0.15)" : "rgba(16, 185, 129, 0.15)", // Cyan or Emerald
                glow: i % 2 === 0 ? "rgba(34, 211, 238, 0.4)" : "rgba(16, 185, 129, 0.4)",
                speed: 0.002 + Math.random() * 0.005
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Gradient Background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#020617"); // Slate 950
            gradient.addColorStop(1, "#000000"); // Black
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Lines
            lines.forEach(line => {
                ctx.beginPath();
                ctx.strokeStyle = line.color;
                ctx.lineWidth = 1.5;
                ctx.shadowBlur = 15;
                ctx.shadowColor = line.glow;

                ctx.moveTo(line.points[0].x, line.points[0].y);

                for (let i = 0; i < line.points.length - 1; i++) {
                    const p1 = line.points[i];
                    const p2 = line.points[i + 1];

                    // Smooth transition to targetY
                    p1.y += (p1.targetY - p1.y) * line.speed;
                    if (Math.abs(p1.y - p1.targetY) < 1) {
                        p1.targetY = canvas.height * (0.2 + Math.random() * 0.6);
                    }

                    const cx = (p1.x + p2.x) / 2;
                    const cy = (p1.y + p2.y) / 2;
                    ctx.quadraticCurveTo(p1.x, p1.y, cx, cy);
                }

                ctx.stroke();
                ctx.shadowBlur = 0; // Reset shadow for other drawing
            });

            // Draw Particles
            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(148, 163, 184, ${p.opacity})`; // Slate 400
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        />
    );
};

export default AnimatedBackground;
