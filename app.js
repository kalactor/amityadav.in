class PortfolioApp {
  constructor() {
    this.projectsExpanded = false;
    this.currentProjectFilter = 'all';
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeApp();
      });
    } else {
      this.initializeApp();
    }
  }

  initializeApp() {
    this.setupThemeToggle();
    this.setupMobileMenu();
    this.setupNavigation();
    this.setupProjectFilter();
    this.setupContactForm();
    this.setupScrollAnimations();
    this.setupScrollToTop();
    this.setupReducedMotion();
    
    console.log('Portfolio app initialized');
  }

  // Theme Toggle Functionality
  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (!themeToggle) {
      console.warn('Theme toggle button not found');
      return;
    }
    
    // Get initial theme mode from localStorage or default to system sync
    const savedMode = localStorage.getItem('portfolio-theme');
    const initialMode = this.normalizeThemeMode(savedMode) || 'system';
    
    // Set initial theme mode
    this.setThemeMode(initialMode);
    
    // Theme toggle click handler (cycle through modes)
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const currentMode = this.getThemeMode();
      const nextMode = this.getNextThemeMode(currentMode);
      this.setThemeMode(nextMode);
      localStorage.setItem('portfolio-theme', nextMode);
      console.log('Theme mode changed to:', nextMode);
    });
    
    // Listen for system theme changes
    const handleSystemChange = (e) => {
      if (this.getThemeMode() === 'system') {
        this.applyColorScheme(e.matches ? 'dark' : 'light');
        this.updateThemeToggleLabel('system', e.matches ? 'dark' : 'light');
      }
    };
    
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  normalizeThemeMode(mode) {
    if (mode === 'light' || mode === 'dark' || mode === 'system') {
      return mode;
    }
    return null;
  }

  getThemeMode() {
    return document.documentElement.getAttribute('data-theme-mode') || 'system';
  }

  getNextThemeMode(currentMode) {
    const modes = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(currentMode);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % modes.length;
    return modes[nextIndex];
  }

  setThemeMode(mode) {
    const html = document.documentElement;
    const normalizedMode = this.normalizeThemeMode(mode) || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const colorScheme = normalizedMode === 'system' ? (prefersDark ? 'dark' : 'light') : normalizedMode;
    
    html.setAttribute('data-theme-mode', normalizedMode);
    this.applyColorScheme(colorScheme);
    this.updateThemeToggleLabel(normalizedMode, colorScheme);
    
    console.log('Theme mode set to:', normalizedMode);
  }

  applyColorScheme(colorScheme) {
    const html = document.documentElement;
    html.setAttribute('data-color-scheme', colorScheme);
    document.body.classList.toggle('dark', colorScheme === 'dark');
    
    // Force a repaint to ensure theme change is applied
    html.offsetHeight;
  }

  updateThemeToggleLabel(mode, colorScheme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    let label = 'Theme: ';
    if (mode === 'system') {
      label += `System (${colorScheme})`;
    } else {
      label += mode.charAt(0).toUpperCase() + mode.slice(1);
    }
    
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
  }

  // Mobile Menu Functionality - Fixed
  setupMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!mobileToggle || !navMenu) {
      console.warn('Mobile menu elements not found');
      return;
    }
    
    let isMenuOpen = false;
    
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      isMenuOpen = !isMenuOpen;
      
      if (isMenuOpen) {
        this.openMobileMenu();
      } else {
        this.closeMobileMenu();
      }
      
      console.log('Mobile menu toggled:', isMenuOpen);
    });
    
    // Close menu when clicking on nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
        isMenuOpen = false;
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (isMenuOpen && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        this.closeMobileMenu();
        isMenuOpen = false;
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        this.closeMobileMenu();
        isMenuOpen = false;
      }
    });
  }

  openMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileToggle && navMenu) {
      mobileToggle.classList.add('active');
      navMenu.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      
      // Trap focus in menu
      const firstLink = navMenu.querySelector('.nav-link');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }
    }
  }

  closeMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileToggle && navMenu) {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  }

  // Navigation and Smooth Scrolling
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"], .brand-link[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    
    // Smooth scroll to sections
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
          const targetPosition = targetSection.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Update active nav link on scroll
    let throttleTimer = null;
    window.addEventListener('scroll', () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        this.updateActiveNavLink(sections, navLinks);
        throttleTimer = null;
      }, 100);
    });
    
    // Initial active link update
    this.updateActiveNavLink(sections, navLinks);
  }

  updateActiveNavLink(sections, navLinks) {
    const scrollPosition = window.scrollY + 100;
    
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  // Project Filtering - Fixed
  setupProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    const toggleButton = document.getElementById('projects-toggle');
    
    if (!filterButtons.length || !projectCards.length) {
      console.warn('Project filter elements not found');
      return;
    }
    
    console.log('Found', filterButtons.length, 'filter buttons and', projectCards.length, 'project cards');
    
    const setActiveFilterButton = (filter) => {
      filterButtons.forEach(btn => {
        const isActive = btn.getAttribute('data-filter') === filter;
        btn.classList.toggle('active', isActive);
      });
    };

    const applyFilter = (filter, updateUrl = true) => {
      const normalizedFilter = filter || 'all';
      this.currentProjectFilter = normalizedFilter;
      setActiveFilterButton(normalizedFilter);
      this.filterProjects(normalizedFilter, projectCards, toggleButton);

      if (!updateUrl) {
        return;
      }

      const url = new URL(window.location);
      if (normalizedFilter === 'all') {
        url.searchParams.delete('filter');
      } else {
        url.searchParams.set('filter', normalizedFilter);
      }
      window.history.replaceState({}, '', url);
    };

    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = button.getAttribute('data-filter');
        console.log('Filtering projects by:', filter);
        applyFilter(filter, true);
      });
    });

    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        const wasExpanded = this.projectsExpanded;
        this.projectsExpanded = !this.projectsExpanded;
        this.filterProjects(this.currentProjectFilter, projectCards, toggleButton);

        if (wasExpanded && !this.projectsExpanded) {
          this.scrollToProjects();
        }
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    const hasFilter = filterParam && document.querySelector(`[data-filter="${filterParam}"]`);
    applyFilter(hasFilter ? filterParam : 'all', false);
  }
  
  filterProjects(filter, projectCards, toggleButton) {
    const maxVisible = this.projectsExpanded ? Number.POSITIVE_INFINITY : 4;
    const matchingCards = [];
    let visibleCount = 0;
    
    projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const shouldShow = filter === 'all' || category === filter;
      
      if (shouldShow) {
        matchingCards.push(card);
      }
    });

    projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const shouldShow = filter === 'all' || category === filter;
      const withinLimit = shouldShow && visibleCount < maxVisible;

      if (withinLimit) {
        card.style.display = 'block';
        card.classList.remove('hidden');
        card.classList.add('show');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('hidden');
        card.classList.remove('show');
      }
    });
    
    if (toggleButton) {
      const hasMoreThanLimit = matchingCards.length > maxVisible;
      const shouldShowToggle = this.projectsExpanded || hasMoreThanLimit;
      toggleButton.hidden = !shouldShowToggle;
      toggleButton.textContent = this.projectsExpanded ? 'Show less projects' : 'Load all projects';
    }

    console.log('Filtered projects - showing', visibleCount, 'of', matchingCards.length);
  }

  scrollToProjects() {
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;

    const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
    const targetPosition = projectsSection.offsetTop - headerHeight - 20;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  // Contact Form - Fixed
  setupContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('form-message');
    
    if (!form) {
      console.warn('Contact form not found');
      return;
    }
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Form submitted');
      
      // Get form data
      const formData = new FormData(form);
      const data = {
        name: formData.get('name')?.trim() || '',
        email: formData.get('email')?.trim() || '',
        message: formData.get('message')?.trim() || '',
        website: formData.get('website') || '' // honeypot field
      };
      
      // Basic validation
      if (!data.name || !data.email || !data.message) {
        this.showFormMessage('Please fill in all required fields.', 'error');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        this.showFormMessage('Please enter a valid email address.', 'error');
        return;
      }
      
      // Honeypot check (spam protection)
      if (data.website) {
        console.log('Spam detected via honeypot');
        this.showFormMessage('Thank you for your message!', 'success');
        form.reset();
        return;
      }
      
      // Show loading state
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }
      
      try {
        // Simulate form submission (in real implementation, this would be an API call)
        await this.simulateFormSubmission(data);
        
        this.showFormMessage('Thank you for your message! I\'ll get back to you soon.', 'success');
        form.reset();
        
        // Track successful form submission
        console.log('Form submitted successfully:', { 
          name: data.name, 
          email: data.email, 
          messageLength: data.message.length 
        });
        
      } catch (error) {
        console.error('Form submission error:', error);
        this.showFormMessage('Sorry, there was an error sending your message. Please try again or email me directly at hello@amityadav.in', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }
      }
    });
  }

  async simulateFormSubmission(data) {
    // Simulate API call delay and success
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Form data processed:', data);
        resolve();
      }, 1500);
    });
  }

  showFormMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    
    // Force reflow to ensure transition works
    messageDiv.offsetHeight;
    messageDiv.classList.add('show');
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      messageDiv.classList.remove('show');
    }, 8000);
  }

  // Scroll Animations
  setupScrollAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported');
      return;
    }
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
      '.skill-category, .project-card, .timeline-item, .blog-card'
    );
    
    animateElements.forEach(el => {
      el.classList.add('scroll-animate');
      observer.observe(el);
    });
    
    console.log('Scroll animations set up for', animateElements.length, 'elements');
  }

  // Scroll-to-top button with progress
  setupScrollToTop() {
    const scrollButton = document.getElementById('scroll-top');
    if (!scrollButton) {
      return;
    }

    const indicator = scrollButton.querySelector('.scroll-top__indicator');
    if (!indicator) {
      return;
    }

    const radius = indicator.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    indicator.style.strokeDasharray = `${circumference} ${circumference}`;
    indicator.style.strokeDashoffset = `${circumference}`;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      const offset = circumference - progress * circumference;
      indicator.style.strokeDashoffset = `${offset}`;
      scrollButton.classList.toggle('visible', scrollTop > 300);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    scrollButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  // Reduced Motion Support
  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Disable animations for users who prefer reduced motion
      document.documentElement.style.setProperty('--duration-fast', '0ms');
      document.documentElement.style.setProperty('--duration-normal', '0ms');
      
      // Remove scroll animations
      const animatedElements = document.querySelectorAll('.scroll-animate');
      animatedElements.forEach(el => {
        el.classList.add('animate');
      });
      
      console.log('Reduced motion preferences detected - animations disabled');
    }
  }
}

// Utility Functions
class Utils {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}

// Performance Optimization
class PerformanceOptimizer {
  constructor() {
    this.setupLazyLoading();
    this.setupPreloadCriticalResources();
  }

  setupLazyLoading() {
    // Lazy load images when they come into view
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      });

      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  setupPreloadCriticalResources() {
    // Critical resources are already loaded via HTML link tags
    console.log('Performance optimizations applied');
  }
}

// Accessibility Enhancements
class AccessibilityEnhancer {
  constructor() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
  }

  setupKeyboardNavigation() {
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Skip links navigation
      if (e.key === 'Tab' && e.shiftKey) {
        const skipLink = document.querySelector('.skip-link');
        if (document.activeElement === skipLink) {
          e.preventDefault();
          const mainContent = document.querySelector('main');
          if (mainContent) {
            mainContent.focus();
          }
        }
      }
    });
  }

  setupFocusManagement() {
    // Ensure focus is visible and well-managed
    let mouseUser = false;

    document.addEventListener('mousedown', () => {
      mouseUser = true;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        mouseUser = false;
      }
    });

    document.addEventListener('focusin', (e) => {
      if (mouseUser && e.target) {
        e.target.classList.add('mouse-focus');
      } else if (e.target) {
        e.target.classList.remove('mouse-focus');
      }
    });
  }

  setupScreenReaderSupport() {
    // Create live region for announcements
    let liveRegion = document.getElementById('live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'live-region';
      document.body.appendChild(liveRegion);
    }

    // Announce form messages to screen readers
    const formMessage = document.getElementById('form-message');
    if (formMessage) {
      const observer = new MutationObserver(() => {
        const messageText = formMessage.textContent.trim();
        if (messageText && liveRegion) {
          liveRegion.textContent = messageText;
        }
      });

      observer.observe(formMessage, { childList: true, characterData: true, subtree: true });
    }
  }
}

// Error Handling
class ErrorHandler {
  constructor() {
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('Global error caught:', e.error);
      this.logError('JavaScript Error', e.error?.message || 'Unknown error', e.filename, e.lineno);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.logError('Promise Rejection', e.reason);
      e.preventDefault(); // Prevent the default browser behavior
    });
  }

  logError(type, message, filename = '', line = 0) {
    const errorData = {
      type,
      message,
      filename,
      line,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.log('Error logged:', errorData);
  }
}

// Initialize Application
let app = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  try {
    // Initialize main application
    app = new PortfolioApp();
    
    // Initialize performance optimizations
    const performanceOptimizer = new PerformanceOptimizer();
    
    // Initialize accessibility enhancements
    const accessibilityEnhancer = new AccessibilityEnhancer();
    
    // Initialize error handling
    const errorHandler = new ErrorHandler();
    
    console.log('Portfolio application fully initialized!');
  } catch (error) {
    console.error('Failed to initialize portfolio application:', error);
  }
}
