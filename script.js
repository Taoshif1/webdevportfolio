// ============================================
// SUBTLE THREE.JS BACKGROUND (SILENT LUXURY)
// ============================================

let scene, camera, renderer, wireframe;
let animationId;

function initThreeJS() {
  if (!document.getElementById("canvas-container")) return;

  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 8;

  // Renderer setup - subtle background only
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false, // Performance
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower for subtlety
  const container = document.getElementById("canvas-container");
  container.appendChild(renderer.domElement);

  // Create subtle wireframe geometry (slow rotation)
  const geometry = new THREE.IcosahedronGeometry(3, 1); // Low detail
  const material = new THREE.MeshBasicMaterial({
    color: 0x2a2a2a, // Very dark gray
    wireframe: true,
    transparent: true,
    opacity: 0.15, // Very subtle
  });

  wireframe = new THREE.Mesh(geometry, material);
  scene.add(wireframe);

  // Position in corner/background
  wireframe.position.set(0, 0, 0);
  wireframe.rotation.x = Math.PI / 6;
  wireframe.rotation.y = Math.PI / 4;

  // Slow rotation animation
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (wireframe) {
      wireframe.rotation.y += 0.002; // Very slow
      wireframe.rotation.x += 0.001;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Handle resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  });
}

// Cleanup function
function disposeThreeJS() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
  if (wireframe && wireframe.geometry) {
    wireframe.geometry.dispose();
  }
  if (wireframe && wireframe.material) {
    wireframe.material.dispose();
  }
}

// ============================================
// INSTANT SCROLL (NO DELAY)
// ============================================

let lenis;

function initSmoothScroll() {
  // Disable smooth scroll for mouse wheel - use native instant scroll
  // Only use Lenis for smooth anchor link navigation
  document.documentElement.style.scrollBehavior = "auto"; // Instant scroll
  
  if (typeof Lenis !== "undefined") {
    // Initialize Lenis but disable smooth wheel for instant response
    lenis = new Lenis({
      duration: 0.1, // Minimal duration
      easing: (t) => t, // Linear easing for instant feel
      smoothWheel: false, // DISABLED - instant mouse wheel scroll
      wheelMultiplier: 1.0,
      smoothTouch: false,
      touchMultiplier: 1.0,
      infinite: false,
    });

    // Minimal RAF loop (only for anchor links)
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    
    // Sync with ScrollTrigger
    lenis.on("scroll", () => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.update();
      }
    });
  } else {
    // Fallback: ensure native scroll is instant
    document.documentElement.style.scrollBehavior = "auto";
  }
}

// ============================================
// SUBTLE GSAP FADE-UP ANIMATIONS
// ============================================

function initScrollAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Simple fade-up for sections
  gsap.utils.toArray("section").forEach((section) => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  });

  // Fade-up for section titles
  gsap.utils.toArray(".section-title").forEach((title) => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: "top 90%",
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  // Stagger for grid items (subtle)
  gsap.utils.toArray(".skill-card, .project-card, .education-item").forEach((item) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  // Skill bars animation
  const skillBars = document.querySelectorAll(".skill-progress");
  skillBars.forEach((bar) => {
    const progress = bar.getAttribute("data-progress");
    ScrollTrigger.create({
      trigger: bar,
      start: "top 90%",
      onEnter: () => {
        gsap.to(bar, {
          width: `${progress}%`,
          duration: 1.2,
          ease: "power2.out",
        });
      },
    });
  });
}

// ============================================
// MAGNETIC HOVER (BUTTONS & PROJECT CARDS ONLY)
// ============================================

function initMagneticEffect() {
  if (typeof gsap === "undefined") return;

  const magneticElements = document.querySelectorAll(
    ".magnetic-btn, .project-card"
  );

  magneticElements.forEach((el) => {
    const magneticArea = 30; // Smaller area

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const distance = Math.sqrt(x * x + y * y);
      const force = Math.min(magneticArea / distance, 1);

      gsap.to(el, {
        x: x * force * 0.2, // Subtle movement
        y: y * force * 0.2,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    });
  });
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
  const mobileToggle = document.getElementById("mobileToggle");
  const navLinks = document.getElementById("navLinks");

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      mobileToggle.classList.toggle("active");
    });

    // Close menu on link click
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        mobileToggle.classList.remove("active");
      });
    });
  }
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

function initSmoothAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        if (lenis) {
          // Use Lenis for smooth anchor link navigation (user-initiated)
          lenis.scrollTo(target, {
            offset: -80,
            duration: 0.8, // Smooth but quick
          });
        } else {
          // Fallback to native smooth scroll for anchor links only
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });
}

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener("DOMContentLoaded", () => {
  // Initialize subtle Three.js background
  initThreeJS();

  // Initialize smooth scroll
  initSmoothScroll();

  // Initialize GSAP animations
  setTimeout(() => {
    initScrollAnimations();
  }, 100);

  // Initialize magnetic effects (buttons & cards only)
  initMagneticEffect();

  // Initialize mobile menu
  initMobileMenu();

  // Initialize smooth anchor links
  setTimeout(() => {
    initSmoothAnchorLinks();
  }, 200);

  // Respect reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (lenis) lenis.destroy();
    if (wireframe) wireframe.visible = false;
    gsap.set("*", { clearProps: "all" });
  }
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  disposeThreeJS();
  if (lenis) lenis.destroy();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
});

// Handle form submission
function handleSubmit(event) {
  event.preventDefault();
  alert("Thank you for your message! I'll get back to you soon.");
}
