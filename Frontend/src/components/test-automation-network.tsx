import React, { useEffect, useRef, useState } from 'react';

const TestAutomationNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Feature nodes for the testing platform
    const nodes = [
      { label: 'Test Hub', type: 'hub', color: '#a855f7', icon: '⚡' },
      { label: 'Parallel Testing', type: 'feature', color: '#3b82f6', icon: '⚙️' },
      { label: 'Cross Browser', type: 'feature', color: '#10b981', icon: '🌐' },
      { label: 'Chrome', type: 'browser', color: '#ef4444', icon: '🔴' },
      { label: 'Firefox', type: 'browser', color: '#f59e0b', icon: '🟠' },
      { label: 'Reports', type: 'feature', color: '#06b6d4', icon: '📊' }
    ];

    const centerX = dimensions.width / 2 + dimensions.width * 0.15;
    const centerY = dimensions.height / 2;
    const networkRadius = Math.min(dimensions.width, dimensions.height) * 0.28;

    // Position nodes in circular pattern
    nodes.forEach((node: any, i: number) => {
      if (i === 0) {
        // Center hub
        node.x = centerX;
        node.y = centerY;
        node.baseX = centerX;
        node.baseY = centerY;
      } else {
        const angle = ((i - 1) / (nodes.length - 1)) * Math.PI * 2 - Math.PI / 2;
        node.x = centerX + Math.cos(angle) * networkRadius;
        node.y = centerY + Math.sin(angle) * networkRadius;
        node.baseX = node.x;
        node.baseY = node.y;
      }
      node.speed = 0.15 + Math.random() * 0.25;
      node.phase = Math.random() * Math.PI * 2;
      node.pulse = Math.random() * Math.PI * 2;
      node.pulseSpeed = 0.015 + Math.random() * 0.02;
      node.size = i === 0 ? 40 : 32;
    });

    // Background particles
    const particles: any[] = [];
    const numParticles = 120;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 1 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.4,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        color: ['#3b82f6', '#a855f7', '#10b981', '#06b6d4'][Math.floor(Math.random() * 4)]
      });
    }

    // Data packets flowing through network
    const dataPackets: any[] = [];

    // Orbiting particles around nodes
    const orbitParticles: any[] = [];
    nodes.forEach((node: any, i: number) => {
      if (i === 0) return;
      for (let j = 0; j < 3; j++) {
        orbitParticles.push({
          nodeIndex: i,
          angle: (j / 3) * Math.PI * 2,
          speed: 0.02 + Math.random() * 0.02,
          distance: 45 + Math.random() * 10,
          size: 2 + Math.random() * 1
        });
      }
    });

    let animationId: number;

    const animate = () => {
      // Create trail effect
      ctx.fillStyle = 'rgba(10, 10, 20, 0.12)';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw background particles
      particles.forEach((p: any) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > dimensions.width) p.vx *= -1;
        if (p.y < 0 || p.y > dimensions.height) p.vy *= -1;

        p.pulsePhase += p.pulseSpeed;
        const pulseOpacity = p.opacity * (0.6 + Math.sin(p.pulsePhase) * 0.4);

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, p.color + Math.floor(pulseOpacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, p.color + '00');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Update node positions
      nodes.forEach((node: any, i: number) => {
        if (i === 0) return; // Hub stays centered
        node.phase += node.speed * 0.008;
        const offsetX = Math.cos(node.phase) * 15;
        const offsetY = Math.sin(node.phase) * 15;
        node.x = node.baseX + offsetX;
        node.y = node.baseY + offsetY;
      });

      // Draw connections with animated gradient
      nodes.forEach((node: any, i: number) => {
        if (i === 0) return;
        
        const hub = nodes[0];
        const dx = hub.x - node.x;
        const dy = hub.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Animated gradient
        const gradient = ctx.createLinearGradient(node.x, node.y, hub.x, hub.y);
        const alpha = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2;
        gradient.addColorStop(0, node.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, '#ffffff40');
        gradient.addColorStop(1, hub.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(hub.x, hub.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Create data packets
        if (Math.random() < 0.012) {
          dataPackets.push({
            startX: node.x,
            startY: node.y,
            targetX: hub.x,
            targetY: hub.y,
            progress: 0,
            speed: 0.012 + Math.random() * 0.018,
            color: node.color,
            life: 1,
            reverse: Math.random() > 0.5
          });
        }
      });

      // Update and draw data packets
      for (let i = dataPackets.length - 1; i >= 0; i--) {
        const packet = dataPackets[i];
        packet.progress += packet.speed;
        packet.life -= 0.006;

        if (packet.progress >= 1 || packet.life <= 0) {
          dataPackets.splice(i, 1);
          continue;
        }

        const prog = packet.reverse ? 1 - packet.progress : packet.progress;
        const x = packet.startX + (packet.targetX - packet.startX) * prog;
        const y = packet.startY + (packet.targetY - packet.startY) * prog;

        // Packet with intense glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        glowGradient.addColorStop(0, packet.color);
        glowGradient.addColorStop(0.3, packet.color + 'aa');
        glowGradient.addColorStop(1, packet.color + '00');
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // Draw orbiting particles
      orbitParticles.forEach((op: any) => {
        op.angle += op.speed;
        const node = nodes[op.nodeIndex];
        const x = node.x + Math.cos(op.angle) * op.distance;
        const y = node.y + Math.sin(op.angle) * op.distance;

        ctx.beginPath();
        ctx.arc(x, y, op.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color + 'cc';
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((node: any, i: number) => {
        node.pulse += node.pulseSpeed;
        const pulseSize = 1 + Math.sin(node.pulse) * 0.2;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 1.8 * pulseSize, 0, Math.PI * 2);
        const outerGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 1.8 * pulseSize);
        outerGlow.addColorStop(0, node.color + '60');
        outerGlow.addColorStop(0.5, node.color + '20');
        outerGlow.addColorStop(1, node.color + '00');
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Main node circle with gradient
        const nodeGradient = ctx.createRadialGradient(
          node.x - node.size * 0.3, node.y - node.size * 0.3, 0,
          node.x, node.y, node.size
        );
        nodeGradient.addColorStop(0, node.color + 'ff');
        nodeGradient.addColorStop(1, node.color + 'cc');
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = nodeGradient;
        ctx.fill();

        // Bright border
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${i === 0 ? 24 : 20}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.icon, node.x, node.y);

        // Label with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${i === 0 ? 16 : 14}px Arial`;
        ctx.fillText(node.label, node.x, node.y + node.size + 25);
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [dimensions]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 animate-in fade-in duration-1000"
      />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
    </div>
  );
};

export default TestAutomationNetwork;
