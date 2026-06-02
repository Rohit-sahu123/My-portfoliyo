/* ==========================================================================
   ROHIT'S PREMIUM INTERACTIVE ENGINE - script.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. DUAL-RING LAGGED CUSTOM CURSOR
  // ==========================================================================
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorOutline = document.querySelector('.custom-cursor-outline');
  
  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;
  
  // Track cursor position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot moves instantly
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });
  
  // Animate outline with a lag (lerp animation)
  function animateCursor() {
    // Lerp formulation: value = value + (target - value) * speed
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    
    cursorOutline.style.left = `${outlineX}px`;
    cursorOutline.style.top = `${outlineY}px`;
    
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);
  
  // Add hover states on interactive links
  const interactiveElements = document.querySelectorAll('a, button, .clickable-value, .cert-item, .contact-option-card, input, textarea');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(1.8)';
      cursorDot.style.backgroundColor = 'var(--secondary)';
      cursorOutline.style.width = '48px';
      cursorOutline.style.height = '48px';
      cursorOutline.style.borderColor = 'var(--secondary)';
      cursorOutline.style.background = 'rgba(168, 85, 247, 0.05)';
    });
    
    el.addEventListener('mouseleave', () => {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorDot.style.backgroundColor = 'var(--accent)';
      cursorOutline.style.width = '32px';
      cursorOutline.style.height = '32px';
      cursorOutline.style.borderColor = 'var(--accent)';
      cursorOutline.style.background = 'transparent';
    });
  });

  // ==========================================================================
  // 2. HTML5 CANVAS PARTICLE CONSTELLATION ENGINE
  // ==========================================================================
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  
  let particlesArray = [];
  let particleCount = window.innerWidth < 768 ? 40 : 100; // Optimize for mobile screens
  const connectionDistance = 120;
  
  // Size canvas to viewport
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Mouse coordinates inside canvas
  let canvasMouse = {
    x: null,
    y: null,
    radius: 180
  };
  
  window.addEventListener('mousemove', (e) => {
    canvasMouse.x = e.clientX;
    canvasMouse.y = e.clientY;
  });
  
  window.addEventListener('mouseout', () => {
    canvasMouse.x = null;
    canvasMouse.y = null;
  });

  // Touch tracking to support interactive mobile constellations
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      canvasMouse.x = e.touches[0].clientX;
      canvasMouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      canvasMouse.x = e.touches[0].clientX;
      canvasMouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    canvasMouse.x = null;
    canvasMouse.y = null;
  });
  
  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1.2;
      this.color = Math.random() > 0.5 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(20, 184, 166, 0.4)';
      this.renderedX = this.x;
      this.renderedY = this.y;
    }
    
    draw(renderedY) {
      ctx.beginPath();
      ctx.arc(this.x, renderedY, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    
    update() {
      // Keep inside bounds
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      
      this.x += this.vx;
      this.y += this.vy;
      
      // Mouse/Touch interaction
      if (canvasMouse.x != null && canvasMouse.y != null) {
        let dx = this.x - canvasMouse.x;
        let dy = this.y - canvasMouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < canvasMouse.radius) {
          const force = (canvasMouse.radius - dist) / canvasMouse.radius;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }
      }
      
      // 3D Parallax Scroll-depth displacement
      const scrollFactor = this.radius * 0.08; // Foreground stars drift faster, background slower
      const displacedY = this.y - (window.scrollY * scrollFactor);
      
      let renderedY = displacedY % canvas.height;
      if (renderedY < 0) renderedY += canvas.height;
      
      this.renderedX = this.x;
      this.renderedY = renderedY;
      
      this.draw(renderedY);
    }
  }
  
  // Init particles
  function initParticles() {
    particlesArray = [];
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push(new Particle());
    }
  }
  initParticles();
  
  // Draw connecting line threads matching parallax rendered offsets
  function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a + 1; b < particlesArray.length; b++) {
        let dx = particlesArray[a].renderedX - particlesArray[b].renderedX;
        let dy = particlesArray[a].renderedY - particlesArray[b].renderedY;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDistance) {
          const opacity = (connectionDistance - dist) / connectionDistance * 0.12;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].renderedX, particlesArray[a].renderedY);
          ctx.lineTo(particlesArray[b].renderedX, particlesArray[b].renderedY);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }
  
  // Particles Animation loop
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    
    connectParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ==========================================================================
  // 3. 3D CARD TILT EFFECT (FOR PREMIUM DECKS)
  // ==========================================================================
  const tiltCards = document.querySelectorAll('.tilt-card');
  
  tiltCards.forEach(card => {
    const glow = card.querySelector('.card-glow-element');
    
    // Only register mouse moves on non-touch viewports to avoid scroll lags
    if (window.innerWidth > 1024) {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position inside the card
        const y = e.clientY - rect.top;  // y position inside the card
        
        // Calculate rotation ranges (-10 to 10 degrees)
        const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 10;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
        
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        
        // Move internal light reflection bubble
        if (glow) {
          glow.style.left = `${x}px`;
          glow.style.top = `${y}px`;
        }
      });
      
      card.addEventListener('mouseleave', () => {
        // Smoothly restore defaults
        card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    }
  });

  // ==========================================================================
  // 4. HERO SECTION TYPING CONTROLLER
  // ==========================================================================
  const roleTextEl = document.getElementById('role-text');
  const roles = [
    "Full-Stack Developer",
    "Frontend Architect",
    "Angular & Spring Boot Specialist",
    "UI/UX & Design Thinkerer"
  ];
  
  let currentRoleIdx = 0;
  let currentCharIdx = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  function typeRoles() {
    const currentFullRoleName = roles[currentRoleIdx];
    
    if (isDeleting) {
      // Remove characters
      roleTextEl.textContent = currentFullRoleName.substring(0, currentCharIdx - 1);
      currentCharIdx--;
      typingSpeed = 50; // Deletes faster
    } else {
      // Add characters
      roleTextEl.textContent = currentFullRoleName.substring(0, currentCharIdx + 1);
      currentCharIdx++;
      typingSpeed = 120; // Types at standard speed
    }
    
    // Switch states
    if (!isDeleting && currentCharIdx === currentFullRoleName.length) {
      isDeleting = true;
      typingSpeed = 2200; // Pause showing full word
    } else if (isDeleting && currentCharIdx === 0) {
      isDeleting = false;
      currentRoleIdx = (currentRoleIdx + 1) % roles.length;
      typingSpeed = 500; // Small pause before starting next word
    }
    
    setTimeout(typeRoles, typingSpeed);
  }
  
  if (roleTextEl) {
    typeRoles();
  }

  // ==========================================================================
  // 5. TECHNICAL PROGRESS BARS & SCROLL REVEALS (OBSERVERS)
  // ==========================================================================
  
  // Section Fade/Slide Observer
  const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .timeline-item');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.classList.add('active'); // for timeline item
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => revealObserver.observe(el));
  
  // Technical Skill Indicator Observer
  const progressBars = document.querySelectorAll('.progress-bar-fill');
  
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, {
    threshold: 0.1
  });
  
  progressBars.forEach(bar => skillObserver.observe(bar));

  // ==========================================================================
  // 6. SCROLL DETECTOR FOR NAV ACTIVE STATES & FLOATING BG
  // ==========================================================================
  const header = document.querySelector('.glass-header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
  
  window.addEventListener('scroll', () => {
    // Floating Nav sizing
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Highlight Active section links
    let activeSec = 'hero';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        activeSec = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-sec') === activeSec) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================================================
  // 7. MOBILE OVERLAY PANEL TOGGLE
  // ==========================================================================
  const mobileToggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  
  function toggleMobileMenu() {
    mobileToggleBtn.classList.toggle('open');
    mobileOverlay.classList.toggle('active');
    document.body.classList.toggle('overflow-hidden');
  }
  
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', toggleMobileMenu);
    
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mobileOverlay.classList.contains('active')) {
          toggleMobileMenu();
        }
      });
    });
  }

  // ==========================================================================
  // 8. INTERACTIVE VISUAL CLI TERMINAL SANDBOX
  // ==========================================================================
  const terminalInput = document.getElementById('terminal-cmd-input');
  const terminalOutputs = document.getElementById('terminal-outputs');
  const terminalBody = document.getElementById('terminal-body');
  
  // Available Commands Registry
  const terminalRegistry = {
    help: () => `
<span class="text-cyan font-bold">List of Available Commands:</span>
=========================================
  <span class="text-indigo font-bold">help</span>       - Displays this comprehensive dashboard list
  <span class="text-indigo font-bold">about</span>      - Visual output of Rohit's core vision
  <span class="text-indigo font-bold">skills</span>     - Prints core full-stack competency ratings
  <span class="text-indigo font-bold">projects</span>   - Catalogs primary software systems built
  <span class="text-indigo font-bold">project &lt;id&gt;</span>- Navigates and isolates a specific project
                 (e.g., <span class="text-cyan">project campusevent</span> or <span class="text-cyan">project score</span>)
  <span class="text-indigo font-bold">education</span>  - Prints academic logs and degrees
  <span class="text-indigo font-bold">contact</span>    - Provides quick secure email, phone coordinates
  <span class="text-indigo font-bold">hack</span>       - High-clearance database bypass sequence
  <span class="text-indigo font-bold">clear</span>      - Flushes the terminal log history
=========================================`,
    
    about: () => `
<span class="text-cyan font-bold">Rohit Sahu - Software & Frontend Developer</span>
-----------------------------------------
Seeking a Software Engineering Internship or Entry-Level SDE role.
Focused on Angular, Spring Boot, REST APIs, and modern responsive visual design.
"Bridges the gap between raw data architectures and gorgeous user interfaces."`,
    
    skills: () => `
<span class="text-cyan font-bold">Current Competency Audit Matrix:</span>
-----------------------------------------
  [FRONTEND ARCH]
  - Angular (TypeScript)   : ■■■■■■■■□□  85%
  - HTML5 & Semantics      : ■■■■■■■■■□  90%
  - CSS3 & SCSS Layouts    : ■■■■■■■■■□  88%
  - ES6 JavaScript         : ■■■■■■■■□□  82%
  
  [BACKEND ARCH]
  - Java Core & OOPs       : ■■■■■■■■□□  80%
  - Spring Boot Framework  : ■■■■■■■□□□  75%
  - RESTful API & CRUD     : ■■■■■■■■□□  80%
  
  [DATABASES & ENV]
  - MySQL Relational       : ■■■■■■■■□□  80%
  - JDBC Conn Struct       : ■■■■■■■■□□  78%
  - Git & Github Version   : ■■■■■■■■■□  85%`,
    
    projects: () => `
<span class="text-cyan font-bold">Featured Projects:</span>
-----------------------------------------
  1. <span class="text-indigo font-bold">campuseventhub</span>   - Full-stack Event management (Angular, Spring Boot, JWT, QR Code)
                      Live: <span class="text-yellow">campush-event-hub.netlify.app</span>
  2. <span class="text-indigo font-bold">college</span>          - Online College Management backend system (Java, Spring Boot, JSP)
  3. <span class="text-indigo font-bold">score</span>            - Modern responsive coaching institute site (Angular)
                      Live: <span class="text-yellow">score-more-academy.vercel.app</span>
                      
Type <span class="text-cyan font-bold">project campusevent</span> or <span class="text-cyan font-bold">project score</span> to auto-scroll and blink that card!`,
    
    education: () => `
<span class="text-cyan font-bold">Academic Record:</span>
-----------------------------------------
  🎓 <span class="text-indigo font-bold">B.Tech (IT)</span> - Bansal Institute of Science & Technology
     Bhopal, MP | CGPA: 6.50 | 2023 - 2027
  🎓 <span class="text-indigo font-bold">Class XII</span>  - Govt. High School Amarpatan (Maihar)
     MPBSE | Score: 60% | 2022 - 2023
  🎓 <span class="text-indigo font-bold">Class X</span>    - Govt. High School Amarpatan (Maihar)
     MPBSE | Score: 68% | 2019 - 2020`,
     
    contact: () => {
      setTimeout(() => {
        copyContact('iamrohit.jmd@gmail.com', 'Email Address');
      }, 500);
      return `
<span class="text-cyan font-bold">Direct Channels:</span>
-----------------------------------------
  📧 Email  : <span class="text-yellow">iamrohit.jmd@gmail.com</span> (Clickable in Contact Card)
  📞 Phone  : <span class="text-yellow">+91-7610492446</span>
  📍 Base   : Bhopal, MP, India
  
  [AUTOPROCESS] Initiated clipboard copy for: <span class="text-cyan font-bold">iamrohit.jmd@gmail.com</span>...`;
    },
    
    hack: () => {
      // Cyber matrix terminal sequence
      let dots = 0;
      const interval = setInterval(() => {
        const lines = [
          `⚡ BYPASSING FIREWALL DEFENSES` + '.'.repeat(dots),
          `🔑 ACQUIRING INTERNAL KERNEL TOKENS` + '.'.repeat(dots),
          `🧬 PARSING ROHIT_SAHU CORE SKILL STACK -- CRITICAL LEVEL OVERRIDE ACHIEVED`,
          `🚀 SYSTEM BACKDOOR OPENED: ENCRYPTED PROFILE DECODED`,
          `💯 ROHIT SAHU STAT: [PASSION FOR HIGH-END DESIGN: 100% | WORK ETHIC: MAX]`
        ];
        
        // Remove previous matrix lines if needed or append
        if(dots < 5) {
          const matrixLine = document.createElement('div');
          matrixLine.className = 'terminal-output-line text-cyan font-bold';
          matrixLine.innerHTML = lines[dots % lines.length];
          terminalOutputs.appendChild(matrixLine);
          terminalBody.scrollTop = terminalBody.scrollHeight;
          dots++;
        } else {
          clearInterval(interval);
          const matrixDone = document.createElement('div');
          matrixDone.className = 'terminal-output-line text-yellow font-bold';
          matrixDone.innerHTML = `🌟 SUCCESS: Core security metrics bypassed! You unlocked the hidden hiring portal. Contact Rohit immediately!`;
          terminalOutputs.appendChild(matrixDone);
          terminalBody.scrollTop = terminalBody.scrollHeight;
        }
      }, 550);
      
      return `<span class="text-yellow font-bold">⚡ INITIATING HIGH-CLEARANCE SYSTEM Matrix OVERRIDE PROCESS...</span>`;
    }
  };
  
  // Input Commands Parser listener
  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const inputString = terminalInput.value.trim().toLowerCase();
        terminalInput.value = '';
        
        // Output prompt line first
        const promptLine = document.createElement('div');
        promptLine.className = 'terminal-output-line';
        promptLine.innerHTML = `<span class="terminal-prompt">rohit_sahu@guest:~$</span> <span class="text-dim">${inputString}</span>`;
        terminalOutputs.appendChild(promptLine);
        
        if (inputString === '') {
          terminalBody.scrollTop = terminalBody.scrollHeight;
          return;
        }
        
        const outputLine = document.createElement('div');
        outputLine.className = 'terminal-output-line';
        
        // Special command handling (clear)
        if (inputString === 'clear') {
          terminalOutputs.innerHTML = '';
          terminalBody.scrollTop = terminalBody.scrollHeight;
          return;
        }
        
        // Project navigation command handler (e.g. project campusevent)
        if (inputString.startsWith('project ')) {
          const projectArg = inputString.split(' ')[1];
          if (projectArg.includes('campus') || projectArg.includes('hub') || projectArg.includes('event')) {
            outputLine.innerHTML = `<span class="text-cyan">Target located: CampusEventHub. Auto-scrolling to section and activating core glows...</span>`;
            terminalOutputs.appendChild(outputLine);
            triggerScrollBlink('proj-campush');
          } else if (projectArg.includes('score') || projectArg.includes('academy') || projectArg.includes('more')) {
            outputLine.innerHTML = `<span class="text-cyan">Target located: Score More Academy. Auto-scrolling to section and activating core glows...</span>`;
            terminalOutputs.appendChild(outputLine);
            triggerScrollBlink('proj-score');
          } else if (projectArg.includes('college') || projectArg.includes('online') || projectArg.includes('management')) {
            outputLine.innerHTML = `<span class="text-cyan">Target located: Online College Management System. Auto-scrolling to section and activating core glows...</span>`;
            terminalOutputs.appendChild(outputLine);
            triggerScrollBlink('proj-college');
          } else {
            outputLine.innerHTML = `<span class="text-yellow">Project ID not recognized. Type <span class="text-cyan font-bold">projects</span> to view valid keys.</span>`;
            terminalOutputs.appendChild(outputLine);
          }
          terminalBody.scrollTop = terminalBody.scrollHeight;
          return;
        }
        
        // Standard Registry commands lookup
        if (terminalRegistry[inputString]) {
          outputLine.innerHTML = terminalRegistry[inputString]();
        } else {
          outputLine.innerHTML = `<span class="text-yellow">Command not recognized: "${inputString}". Type <span class="text-cyan font-bold">help</span> to view system utilities.</span>`;
        }
        
        terminalOutputs.appendChild(outputLine);
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
    });
    
    // Auto-focus terminal on body click inside the terminal element
    const terminalBlock = document.querySelector('.terminal-container-block');
    if (terminalBlock) {
      terminalBlock.addEventListener('click', () => {
        terminalInput.focus();
      });
    }
  }

  // Auto-scroll and blink target card visual
  function triggerScrollBlink(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Blink target element
      el.style.borderColor = 'var(--accent)';
      el.style.boxShadow = '0 0 40px rgba(20, 184, 166, 0.4)';
      
      setTimeout(() => {
        el.style.borderColor = 'var(--glass-border)';
        el.style.boxShadow = 'none';
      }, 2000);
    }
  }

  // ==========================================================================
  // 9. COPY TO CLIPBOARD AND TOAST
  // ==========================================================================
  window.copyContact = function(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      const toast = document.getElementById('clipboard-toast');
      const toastText = document.getElementById('toast-text');
      
      if (toast && toastText) {
        toastText.textContent = `${label} copied to clipboard successfully!`;
        toast.classList.add('show');
        
        // Hide after timer
        setTimeout(() => {
          toast.classList.remove('show');
        }, 2800);
      }
    }).catch(err => {
      console.error('Failed to copy to clipboard: ', err);
    });
  };

  // ==========================================================================
  // 10. MOCK CONTACT TRANSMISSION HUB FORM
  // ==========================================================================
  window.handleFormSubmit = function(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const responseMsg = document.getElementById('form-response');
    
    // Disable inputs and show transmitting status
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Encrypting & Sending...';
    submitBtn.style.background = 'var(--yellow)';
    submitBtn.style.boxShadow = '0 0 15px var(--yellow-glow)';
    
    setTimeout(() => {
      // Completed response visual
      submitBtn.querySelector('span').textContent = 'Transmission Complete!';
      submitBtn.style.background = 'var(--accent)';
      submitBtn.style.boxShadow = '0 0 15px var(--accent-glow)';
      
      if (responseMsg) {
        responseMsg.textContent = '✓ Secure signal transmitted successfully! Rohit will follow up on your transmission shortly.';
        responseMsg.classList.add('success');
      }
      
      // Reset form fields
      event.target.reset();
      
      setTimeout(() => {
        // Restore standard button defaults
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Transmit Signal';
        submitBtn.style.background = 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
        submitBtn.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
        if (responseMsg) {
          responseMsg.classList.remove('success');
          responseMsg.textContent = '';
        }
      }, 5000);
      
    }, 1800);
  };

  // ==========================================================================
  // 11. CLICKABLE CLI COMMAND BADGES (TOUCH-FRIENDLY UTILITY)
  // ==========================================================================
  window.executeCLICommand = function(cmdText) {
    if (!terminalInput) return;
    
    terminalInput.value = cmdText;
    
    // Create and dispatch an Enter keydown event to execute in terminalRegistry
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      keyCode: 13,
      bubbles: true
    });
    terminalInput.dispatchEvent(enterEvent);
  };
  
  // Bind click listeners to all hint elements
  const commandBadges = document.querySelectorAll('.terminal-command-hint');
  commandBadges.forEach(badge => {
    badge.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = badge.textContent.trim().toLowerCase();
      
      const terminalSection = document.getElementById('terminal');
      if (terminalSection) {
        terminalSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Execute command with a subtle delay for smooth scroll visual finish
      setTimeout(() => {
        executeCLICommand(cmd);
        terminalInput.focus();
      }, 350);
    });
  });

  // ==========================================================================
  // 12. GYROSCOPE-BASED 3D CARD TILT (MOBILE ORIENTATION ENHANCEMENT)
  // ==========================================================================
  function handleOrientation(event) {
    const gamma = event.gamma; // Left-to-right tilt (-90 to 90 degrees)
    const beta = event.beta;   // Front-to-back tilt (-180 to 180 degrees)
    
    if (gamma === null || beta === null) return;
    
    // Normalize tilt rotations to a reasonable angle range (-10 to 10 degrees)
    // Holding the phone normally is roughly at a 50-degree beta angle.
    const rotationX = Math.max(-10, Math.min(10, (beta - 50) * 0.4));
    const rotationY = Math.max(-10, Math.min(10, gamma * 0.4));
    
    tiltCards.forEach(card => {
      card.style.transform = `rotateX(${-rotationX}deg) rotateY(${rotationY}deg) translateY(-2px)`;
    });
  }

  // Safely check device orientation permissions
  if (window.innerWidth <= 1024) {
    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        document.addEventListener('click', function requestOrientationPerms() {
          DeviceOrientationEvent.requestPermission()
            .then(state => {
              if (state === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
              }
            })
            .catch(err => console.log('Gyroscope access rejected:', err));
          document.removeEventListener('click', requestOrientationPerms);
        }, { once: true });
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
  }

  // ==========================================================================
  // 13. CYBER BOTTOM DOCK NAV CONTROLS
  // ==========================================================================
  const bottomDock = document.querySelector('.cyber-bottom-dock');
  const dockItems = document.querySelectorAll('.cyber-bottom-dock .dock-item:not(.dock-hack-btn)');
  const dockHackTrigger = document.getElementById('dock-hack-trigger');

  if (bottomDock) {
    // Show/hide floating bottom dock on vertical scroll threshold
    window.addEventListener('scroll', () => {
      if (window.scrollY > 250) {
        bottomDock.classList.add('visible');
      } else {
        bottomDock.classList.remove('visible');
      }
    });

    // Highlight current active section dock link icon
    window.addEventListener('scroll', () => {
      let activeSec = 'hero';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 250;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          activeSec = section.getAttribute('id');
        }
      });

      dockItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-sec') === activeSec) {
          item.classList.add('active');
        }
      });
    });

    // Hack trigger auto CLI matrix command run
    if (dockHackTrigger) {
      dockHackTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        
        const terminalSection = document.getElementById('terminal');
        if (terminalSection) {
          terminalSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        setTimeout(() => {
          window.executeCLICommand('hack');
        }, 500);
        
        // Haptic active flash indicator
        dockHackTrigger.classList.add('active');
        setTimeout(() => {
          dockHackTrigger.classList.remove('active');
        }, 1500);
      });
    }
  }

  // ==========================================================================
  // 14. 2D MAGNETIC CTA PHYSICS ENGINE (HIGH-END DESKTOP PHYSICS DETAIL)
  // ==========================================================================
  const magneticButtons = document.querySelectorAll('.magnetic-btn');
  
  if (window.innerWidth > 1024) { // Active only on desktop viewports to prevent layout jumps on tap
    magneticButtons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Dynamic attraction interpolation: 30% strength
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        btn.style.boxShadow = `0 10px 25px rgba(99, 102, 241, 0.3), ${-x * 0.1}px ${-y * 0.1}px 15px rgba(99, 102, 241, 0.15)`;
        
        // Inner text elements drag slightly less (15% strength) to establish a layered 3D depth feel
        const btnText = btn.querySelector('span');
        if (btnText) {
          btnText.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        }
      });
      
      btn.addEventListener('mouseleave', () => {
        // Smoothly snap back on hover leave
        btn.style.transform = 'translate(0px, 0px)';
        btn.style.boxShadow = '';
        
        const btnText = btn.querySelector('span');
        if (btnText) {
          btnText.style.transform = 'translate(0px, 0px)';
        }
      });
    });
  }
});
