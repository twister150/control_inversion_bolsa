'use client';

import { useEffect, useRef } from 'react';

export default function MiniSparkline({ data, color = '#00d4ff', width = 80, height = 32, onClick }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || data.length < 2) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const precios = data.map(d => d.precio);
        const min = Math.min(...precios);
        const max = Math.max(...precios);
        const range = max - min || 1;

        const padding = 2;
        const drawWidth = width - padding * 2;
        const drawHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color + '30');
        gradient.addColorStop(1, color + '00');

        // Line path
        ctx.beginPath();
        precios.forEach((p, i) => {
            const x = padding + (i / (precios.length - 1)) * drawWidth;
            const y = padding + drawHeight - ((p - min) / range) * drawHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        // Fill
        ctx.lineTo(padding + drawWidth, padding + drawHeight);
        ctx.lineTo(padding, padding + drawHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke
        ctx.beginPath();
        precios.forEach((p, i) => {
            const x = padding + (i / (precios.length - 1)) * drawWidth;
            const y = padding + drawHeight - ((p - min) / range) * drawHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Current price dot
        const lastX = padding + drawWidth;
        const lastY = padding + drawHeight - ((precios[precios.length - 1] - min) / range) * drawHeight;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }, [data, color, width, height]);

    return (
        <div
            className="sparkline-container"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
            title={onClick ? "Ver gráfico completo" : ""}
        >
            <canvas
                ref={canvasRef}
                style={{ width: `${width}px`, height: `${height}px` }}
            />
        </div>
    );
}
