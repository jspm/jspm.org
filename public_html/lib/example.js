export const exampleLandingCss = `:root {
  --primary-color: #4dabf7;
  --secondary-color: #72cc82;
  --background-color: #121212;
  --surface-color: #1e1e1e;
  --text-color: #e0e0e0;
  --accent-color: #a4a4a4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--background-color);
  color: var(--text-color);
}

.container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  position: relative;
}

.landing {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-container {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
  position: relative;
  cursor: pointer;
  transform: scale(1);
}

.logo.fade-in {
  transition: opacity 1s ease, transform 0.3s ease-out;
}

.logo:hover {
  transform: scale(1.05);
}

.glow {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  border-radius: 20%;
  background: radial-gradient(circle, rgb(129 118 71 / 20%) 40%, rgb(255 255 255 / 5%) 50%, rgb(255 255 385 / 0%) 0%);
  filter: blur(20px);
  z-index: 1;
}

.glow.glow-animate {
  animation: glow-pulse 3s ease-in-out infinite;
}

.gradient-text {
  background: linear-gradient(90deg, #808080, #78a7d8, #808080, #78a7d8);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
  font-size: 5rem;
  margin: 0 0 0.5rem 0;
  letter-spacing: 2px;
  animation: gradient-shift 10s linear infinite;
}

.gradient-text.move-up {
  animation: gradient-shift 10s linear infinite, move-up 1s ease-out forwards;
}

.tagline {
  color: var(--text-color);
  font-size: 1.6rem;
  font-weight: 300;
  margin: 0;
}

.gradient-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: #121212;
  overflow: hidden;
}


.gradient-blob {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.25;
  animation: float-blob 20s ease-in-out infinite, pulse-opacity 10s ease-in-out infinite;
  transform-origin: center center;
}

.gradient-blob-1 {
  background: #4285f4; /* Blue */
  top: 15%;
  left: 25%;
  animation-delay: 0s;
  width: 500px;
  height: 500px;
}

.gradient-blob-2 {
  background: #ffc107;
  top: 60%;
  right: 25%;
  animation-delay: -7s;
  width: 450px;
  height: 450px;
}

.gradient-blob-3 {
  background: #ea4c89;
  top: 30%;
  left: 60%;
  width: 480px;
  height: 480px;
  animation-delay: -14s;
}

@keyframes gradient-shift {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes move-up {
  0% { transform: translateY(20px); }
  100% { transform: translateY(0); }
}

@keyframes float-blob {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 40px) scale(0.95); }
  75% { transform: translate(-40px, -25px) scale(1.05); }
  100% { transform: translate(0, 0) scale(1); }
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.3; }
}

.fade-in {
  opacity: 0;
  transition: opacity 1s ease;
}

.move-up {
  animation: move-up 1s ease-out forwards;
}

@media (max-width: 768px) {
  .logo-container { width: 220px; height: 220px; }
  .gradient-text { font-size: 3.5rem; }
  .tagline { font-size: 1.2rem; }
}
`;

export const exampleLandingJs = `import style from './style.css' with { type: 'css' };

if (!document.adoptedStyleSheets.includes(style))
  document.adoptedStyleSheets.push(style);

// Render landing page
function render() {
  return \`
    <div class="container">
      <div class="gradient-background">
        <div class="gradient-blob gradient-blob-1"></div>
        <div class="gradient-blob gradient-blob-2"></div>
        <div class="gradient-blob gradient-blob-3"></div>
      </div>
      <div class="landing">
        <div class="logo-container">
          <div class="glow"></div>
          <img class="logo fade-in" src="https://jspm.org/jspm.png" alt="JSPM Logo">
        </div>
        <h1 class="gradient-text fade-in">JSPM</h1>
        <p class="tagline fade-in">Standards-based import map package management</p>
      </div>
    </div>
  \`;
}

// Attach animations and interactions
function attach(container) {
  const logo = container.querySelector('.logo');
  const glow = container.querySelector('.glow');
  const fadeElements = container.querySelectorAll('.fade-in');
  
  // Trigger fade-ins and move animations with delay
  fadeElements.forEach((el, i) => {
    const targetOpacity = el.classList.contains('logo') ? '0.8' : '1';
    setTimeout(() => {
      el.style.opacity = targetOpacity;
      
      // Add classes for animations
      if (el.classList.contains('gradient-text')) {
        el.classList.add('move-up');
      } else if (el.classList.contains('tagline')) {
        el.classList.add('move-up');
      }
    }, 300 + i * 500);
  });
  
  // Add glow pulse animation
  glow.classList.add('glow-animate');
  
  // Add confetti on logo click
  logo.addEventListener('click', async () => {
    const confetti = (await import('canvas-confetti')).default;
    const rect = logo.getBoundingClientRect();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { 
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#78a7d8', '#FFD966', '#d0d0d0']
    });
  });
}

document.body.innerHTML = render();
attach(document.body);
`;
