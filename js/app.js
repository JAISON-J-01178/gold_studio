// js/app.js
import { db } from './data.js';
import { isSupabaseConnected } from './supabase-config.js';
import { initAdmin, renderAdminLogin, renderAdminDashboard } from './admin.js';

// Global SPA Router and Controller
class App {
  constructor() {
    this.contentArea = document.getElementById('app-content');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.navMenu = document.querySelector('.nav-menu');
    this.navToggle = document.querySelector('.nav-toggle');
    this.header = document.querySelector('.header');
    
    // Lightbox State
    this.currentGalleryItems = [];
    this.lightboxIndex = 0;
    this.isZoomed = false;

    this.init();
  }

  async init() {
    // Register routing listener
    window.addEventListener('hashchange', () => this.route());
    window.addEventListener('load', () => this.route());

    // Setup Header Scroll Effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    });

    // Mobile Navigation Toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => {
        this.navMenu.classList.toggle('active');
        // Toggle animation for hamburger lines if needed
      });
    }

    // Close mobile nav when clicking a link
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link') && this.navMenu.classList.contains('active')) {
        this.navMenu.classList.remove('active');
      }
    });

    // Initialize Lightbox Events
    this.initLightbox();

    // Init Admin Controller
    initAdmin(this);
  }

  // Router handler
  async route() {
    const hash = window.location.hash || '#home';
    const settings = await db.getSettings();

    // Set page dynamic SEO headers
    document.title = settings.seo_title || "Gold Studio";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', settings.seo_description);

    // Active state highlighting in Nav
    this.navLinks.forEach(link => {
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close any open modals
    this.closeLightbox();

    // Routing match
    switch(hash) {
      case '#home':
        await this.renderHome();
        break;
      case '#about':
        await this.renderAbout();
        break;
      case '#portfolio':
        await this.renderPortfolio();
        break;
      case '#services':
        await this.renderServices();
        break;
      case '#packages':
        await this.renderPackages();
        break;
      case '#testimonials':
        await this.renderTestimonials();
        break;
      case '#blog':
        await this.renderBlog();
        break;
      case '#contact':
        await this.renderContact();
        break;
      case '#booking':
        await this.renderBooking();
        break;
      case '#admin-login':
        renderAdminLogin(this);
        break;
      case '#admin-dashboard':
        renderAdminDashboard(this);
        break;
      default:
        await this.renderHome();
    }

    // Scroll to top on page navigation
    window.scrollTo(0, 0);
  }

  // --- COMPONENT RENDERERS ---

  async renderHome() {
    const settings = await db.getSettings();
    const portfolio = await db.get(portfolioTable());
    const testimonials = await db.get('testimonials');
    const blogs = await db.get('blogs');

    const featuredMedia = portfolio.filter(item => item.is_featured).slice(0, 4);
    if (featuredMedia.length === 0 && portfolio.length > 0) {
      featuredMedia.push(...portfolio.slice(0, 4));
    }

    this.contentArea.innerHTML = `
      <!-- HERO BANNER -->
      <section class="hero">
        <div class="hero-background">
          <img src="assets/hero_cover.jpg" class="hero-media" alt="Cinematic Studio Cover">
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <p class="hero-tagline">${settings.tagline || 'Fine Art Staging & Cinematic Stories'}</p>
          <h1 class="hero-title serif">${settings.studio_name || 'Gold Studio'}</h1>
          <div class="hero-buttons">
            <a href="#booking" class="btn btn-primary">Book Session</a>
            <a href="#portfolio" class="btn btn-secondary">View Portfolio</a>
          </div>
        </div>
      </section>

      <!-- INTRO SECTION -->
      <section class="py-section container">
        <div class="about-grid">
          <div class="about-img-container">
            <img src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80" class="about-img" alt="Gold Studio Space">
          </div>
          <div class="about-text">
            <h2 class="section-title text-gold serif" style="text-align: left; margin-bottom: 1.5rem;">Luxury Cinematic Photography</h2>
            <p>At Gold Studio, we specialize in high-end wedding, portrait, and commercial photography. We believe that photography is not just about capturing a subject; it is about staging a cinematic story, crafting light, and shaping timeless expressions.</p>
            <p>From drone recordings and same-day cinematic trailers to leather-bound, fine-art wedding albums, our packages deliver an absolute masterpiece to our clients globally.</p>
            <a href="#about" class="btn btn-outline" style="margin-top: 1rem;">Discover Our Story</a>
          </div>
        </div>
      </section>

      <!-- FEATURED PORTFOLIO -->
      <section class="py-section" style="background: var(--bg-dark);">
        <div class="container">
          <h2 class="section-title serif">Featured Portfolios</h2>
          <p class="section-subtitle">A curated selection of our finest captures</p>
          
          <div class="gallery-grid" id="home-featured-grid">
            ${featuredMedia.map((item, index) => this.generateGalleryHTML(item, index, 'featured')).join('')}
          </div>
          
          <div style="text-align: center; margin-top: 3.5rem;">
            <a href="#portfolio" class="btn btn-secondary">Explore Complete Gallery</a>
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS TEASER -->
      <section class="py-section container">
        <h2 class="section-title serif">Client Experiences</h2>
        <p class="section-subtitle">Real feedback from our golden moments</p>
        <div class="testimonials-grid">
          ${testimonials.slice(0, 3).map(item => `
            <div class="testimonial-card">
              <div class="testimonial-stars">
                ${Array(item.rating || 5).fill().map(() => `
                  <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                `).join('')}
              </div>
              <p class="testimonial-text">"${item.review}"</p>
              <div class="testimonial-author">
                <img src="${item.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}" class="author-avatar" alt="${item.name}">
                <div>
                  <h4 class="author-name">${item.name}</h4>
                  <p class="author-role">${item.role || 'Client'}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;

    // Bind lightbox events to home portfolio grid
    this.currentGalleryItems = featuredMedia;
    this.bindGalleryClicks('home-featured-grid', featuredMedia);
  }

  async renderAbout() {
    const settings = await db.getSettings();
    this.contentArea.innerHTML = `
      <section class="py-section container" style="padding-top: 140px;">
        <h2 class="section-title text-gold serif">Our Studio Story</h2>
        <p class="section-subtitle">Elegance, Artistry, and Technical Precision</p>

        <div class="about-grid">
          <div class="about-text">
            <h3>Vision & Journey</h3>
            <p>Gold Studio was created with a simple purpose—to capture genuine moments and turn them into lasting memories. As an independent photographer, I believe every photograph should tell a meaningful story, whether it's a wedding, birthday celebration, family gathering, portrait session, or any special occasion. Every project is approached with creativity, patience, and attention to detail, ensuring that each client receives a personalized experience from the first conversation to the final delivery.

              Photography is more than taking pictures; it is about preserving emotions, relationships, and moments that cannot be recreated. I take the time to understand each client's expectations, plan every shoot carefully, and create images that reflect natural expressions and authentic memories. My goal is to make every session comfortable and enjoyable so that every photograph feels genuine and timeless.</p>
            <p>Gold Studio is built on dedication, continuous learning, and a passion for visual storytelling. By combining creative photography techniques with professional editing, I strive to deliver high-quality images that clients can treasure for years to come. Every customer is important, and every project—whether large or small—receives the same level of care, commitment, and attention. My vision is to build lasting relationships through trust, quality, and memorable photography, one story at a time.</p>
            <h3>Our Craft & Equipment</h3>
            <p>At Gold Studio, every photoshoot is handled with creativity, attention to detail, and a passion for capturing genuine moments. Using professional camera equipment, quality lenses, and modern editing tools, every image is carefully crafted to deliver natural, vibrant, and timeless memories for every client.</p>
          </div>
          <div class="about-img-container">
            <img src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80" class="about-img" alt="Photographer in Action">
          </div>
        </div>

        <!-- METRICS -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">10+</div>
            <div class="stat-label">Years of Experience</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">500+</div>
            <div class="stat-label">Events Covered</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">150+</div>
            <div class="stat-label">Memories Captured</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">100%</div>
            <div class="stat-label">Client Satisfaction</div>
          </div>
        </div>

        <!-- WHY CHOOSE US -->
        <h3 class="serif" style="text-align: center; font-size: 2rem; margin-bottom: 3.5rem;">Why Gold Studio?</h3>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <h4 class="feature-title">Personalized Photography Experience</h4>
            <p class="feature-desc">Every photoshoot is planned with care, ensuring a comfortable experience and capturing genuine moments that reflect your unique story.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            </div>
            <h4 class="feature-title">Professional Quality</h4>
            <p class="feature-desc">Using professional camera equipment and modern editing techniques, every photograph is carefully enhanced to deliver sharp, natural, and timeless results.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
            </div>
            <h4 class="feature-title">Timely Delivery</h4>
            <p class="feature-desc">Your edited photographs and albums are delivered on time without compromising quality, so you can relive your special moments as soon as possible.</p>
          </div>
        </div>

        <!-- STUDIO OPERATIONAL DETAILS -->
        <h3 class="serif" style="text-align: center; font-size: 2rem; margin-bottom: 2.5rem;">Operational Details</h3>
        <div class="feature-card" style="max-width: 600px; margin: 0 auto;">
          <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.95rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.8rem;">
              <strong style="color: var(--text-white);">Studio Hours:</strong>
              <span style="color: var(--text-muted);">${settings.business_hours}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.8rem;">
              <strong style="color: var(--text-white);">Service Coverages:</strong>
              <span style="color: var(--text-muted);">Available for Local Photography Sessions, Weddings, Events, and Outdoor Shoots. Travel to nearby cities upon request.</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.8rem;">
              <strong style="color: var(--text-white);">Lead Photographer:</strong>
              <span style="color: var(--text-muted);">Gold Studio Photography</span>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async renderPortfolio() {
    const portfolio = await db.get(portfolioTable());
    const categories = [
      "All", "Wedding", "Pre-Wedding", "Engagement", "Reception", "Birthday",
      "Baby Shoot", "Maternity", "Fashion", "Product Photography",
      "Food Photography", "Corporate Events", "Commercial Photography",
      "Travel", "Nature", "Cinematic Videography"
    ];

    this.contentArea.innerHTML = `
      <section class="py-section container" style="padding-top: 140px;">
        <h2 class="section-title text-gold serif">Studio Portfolios</h2>
        <p class="section-subtitle">Filter by category to explore our professional photography collections</p>

        <!-- CATEGORIES TABS -->
        <div class="portfolio-tabs" id="portfolio-category-tabs">
          ${categories.map((cat, idx) => `
            <div class="portfolio-tab ${idx === 0 ? 'active' : ''}" data-category="${cat}">${cat}</div>
          `).join('')}
        </div>

        <!-- PORTFOLIO GRID -->
        <div class="gallery-grid" id="portfolio-gallery-grid">
          ${portfolio.map((item, index) => this.generateGalleryHTML(item, index, 'all')).join('')}
        </div>
      </section>
    `;

    this.currentGalleryItems = [...portfolio];
    this.bindGalleryClicks('portfolio-gallery-grid', portfolio);

    // Dynamic Filter Handler
    const tabs = document.querySelectorAll('#portfolio-category-tabs .portfolio-tab');
    const grid = document.getElementById('portfolio-gallery-grid');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const selectedCat = tab.getAttribute('data-category');
        let filtered = [];

        if (selectedCat === 'All') {
          filtered = portfolio;
        } else {
          filtered = portfolio.filter(item => item.category === selectedCat);
        }

        this.currentGalleryItems = filtered;
        
        if (filtered.length === 0) {
          grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted); font-size: 1rem;">No media files published in ${selectedCat} yet. Check back soon!</div>`;
        } else {
          grid.innerHTML = filtered.map((item, idx) => this.generateGalleryHTML(item, idx, selectedCat)).join('');
          this.bindGalleryClicks('portfolio-gallery-grid', filtered);
        }
      });
    });
  }

  async renderServices() {
    const services = await db.get('services');

    this.contentArea.innerHTML = `
      <section class="py-section container" style="padding-top: 140px;">
        <h2 class="section-title text-gold serif">Bespoke Services</h2>
        <p class="section-subtitle">Explore our premium photography and filming packages designed around you</p>

        <div class="services-grid">
          ${services.map(srv => `
            <div class="service-card">
              <img src="${srv.image_url}" class="service-cover" alt="${srv.title}">
              <div class="service-details">
                <h3 class="service-title">${srv.title}</h3>
                <p class="service-desc">${srv.description}</p>
                <div class="service-meta">
                  <div class="service-meta-item">
                    <span class="service-meta-label">Duration</span>
                    <span class="service-meta-value">${srv.duration}</span>
                  </div>
                  <div class="service-meta-item">
                    <span class="service-meta-label">Deliverables</span>
                    <span class="service-meta-value">${srv.deliverables}</span>
                  </div>
                  <div class="service-meta-item">
                    <span class="service-meta-label">Starting Price</span>
                    <span class="service-meta-value text-gold" style="-webkit-text-fill-color: initial; font-weight: 700;">${srv.price}</span>
                  </div>
                </div>
                <a href="#booking?service=${encodeURIComponent(srv.title)}" class="btn btn-secondary" style="width: 100%; text-align: center;">Book Consultation</a>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  async renderPackages() {
    const packages = await db.get('packages');

    this.contentArea.innerHTML = `
      <section class="py-section container" style="padding-top: 140px;">
        <h2 class="section-title text-gold serif">Photography Packages</h2>
        <p class="section-subtitle">Compare our carefully structured plans to fit your event style and budget</p>

        <div class="packages-grid">
          ${packages.map(pkg => `
            <div class="package-card ${pkg.featured ? 'featured' : ''}">
              ${pkg.badge ? `<div class="package-badge">${pkg.badge}</div>` : ''}
              <h3 class="package-title">${pkg.title}</h3>
              <div class="package-price-box">
                <span class="package-price">${pkg.price}</span>
                <span class="package-price-period">/ event</span>
              </div>
              <ul class="package-features">
                ${pkg.features.map(f => `
                  <li>
                    <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    <span>${f}</span>
                  </li>
                `).join('')}
              </ul>
              <a href="#booking?package=${encodeURIComponent(pkg.title)}" class="btn ${pkg.featured ? 'btn-primary' : 'btn-secondary'}" style="width: 100%; text-align: center;">Choose ${pkg.title}</a>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  async renderTestimonials() {
    const testimonials = await db.get('testimonials');

    this.contentArea.innerHTML = `
      <section class="py-section container" style="padding-top: 140px;">
        <h2 class="section-title text-gold serif">Client Reviews</h2>
        <p class="section-subtitle">Timeless testimonials from the people who trusted us with their core memories</p>

        <div class="testimonials-grid" style="margin-bottom: 6rem;">
          ${testimonials.map(item => `
            <div class="testimonial-card">
              <div class="testimonial-stars">
                ${Array(item.rating || 5).fill().map(() => `
                  <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                `).join('')}
              </div>
              <p class="testimonial-text">"${item.review}"</p>
              <div class="testimonial-author">
                <img src="${item.image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}" class="author-avatar" alt="${item.name}">
                <div>
                  <h4 class="author-name">${item.name}</h4>
                  <p class="author-role">${item.role || 'Client'}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- LEAVE A TESTIMONIAL FORM -->
        <div class="booking-section">
          <div class="contact-form-card">
            <h3 class="serif text-gold" style="font-size: 1.8rem; text-align: center; margin-bottom: 2rem;">Write a Review</h3>
            <form id="submit-review-form">
              <div class="form-feedback" id="review-form-feedback">Thank you! Your testimonial has been submitted for admin approval.</div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Your Name</label>
                  <input type="text" class="form-control" name="name" required placeholder="e.g. Emma & Liam">
                </div>
                <div class="form-group">
                  <label class="form-label">Client Role</label>
                  <input type="text" class="form-control" name="role" required placeholder="e.g. Bride & Groom, Portrait Client">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Rating</label>
                <select class="form-control" name="rating" required>
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Great)</option>
                  <option value="3">3 Stars (Average)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Your Review</label>
                <textarea class="form-control" name="review" required placeholder="Share your experience shooting with Gold Studio..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Testimonial</button>
            </form>
          </div>
        </div>
      </section>
    `;

    // Handle Review Form Submission
    const form = document.getElementById('submit-review-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const newReview = {
        name: formData.get('name'),
        role: formData.get('role'),
        rating: parseInt(formData.get('rating')),
        review: formData.get('review'),
        image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" // default avatar
      };

      await db.insert('testimonials', newReview);
      
      const feedback = document.getElementById('review-form-feedback');
      feedback.style.display = 'block';
      form.reset();
      
      setTimeout(() => {
        feedback.style.display = 'none';
        // Auto reload review page
        this.route();
      }, 3000);
    });
  }

  async renderBlog() {
    const blogs = await db.get('blogs');

    this.contentArea.innerHTML = `
      <section class="py-section container" style="padding-top: 140px;">
        <h2 class="section-title text-gold serif">Studio Chronicles</h2>
        <p class="section-subtitle">Behind-the-scenes stories, lighting walkthroughs, wedding guides, and announcements</p>

        <!-- SEARCH AND FILTER CONTROLS -->
        <div class="blog-controls">
          <div class="blog-search-container">
            <span class="blog-search-icon">
              <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </span>
            <input type="text" class="blog-search-input" id="blog-search" placeholder="Search articles...">
          </div>
        </div>

        <!-- BLOG GRID -->
        <div class="blog-grid" id="blog-posts-grid">
          ${blogs.map(post => this.generateBlogCardHTML(post)).join('')}
        </div>
      </section>

      <!-- BLOG MODAL -->
      <div class="blog-modal" id="blog-article-modal">
        <div class="blog-modal-container">
          <div class="blog-modal-header">
            <img src="" id="modal-blog-cover" class="blog-modal-cover" alt="Blog Cover">
            <span class="blog-modal-close" id="modal-blog-close">&times;</span>
          </div>
          <div class="blog-modal-body">
            <span class="blog-category" id="modal-blog-category">Category</span>
            <h2 class="blog-modal-title serif" id="modal-blog-title">Blog Title</h2>
            <div class="blog-modal-meta">
              <span>By <strong id="modal-blog-author" style="color: var(--text-white);">Author</strong></span>
              <span id="modal-blog-date">Date</span>
            </div>
            <div class="blog-modal-content" id="modal-blog-content">
              Content body
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Search Event
    const searchInput = document.getElementById('blog-search');
    const postsGrid = document.getElementById('blog-posts-grid');
    
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = blogs.filter(post => 
        post.title.toLowerCase().includes(q) || 
        post.excerpt.toLowerCase().includes(q) || 
        post.content.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        postsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">No blog posts found.</div>`;
      } else {
        postsGrid.innerHTML = filtered.map(post => this.generateBlogCardHTML(post)).join('');
        this.bindBlogClicks(filtered);
      }
    });

    this.bindBlogClicks(blogs);
  }

  async renderContact() {
    const settings = await db.getSettings();

    this.contentArea.innerHTML = `
      <section class="py-section container" style="padding-top: 140px;">
        <h2 class="section-title text-gold serif">Get in Touch</h2>
        <p class="section-subtitle">Reach out for enquiries, destination sessions, or custom studio bookings</p>

        <div class="contact-grid">
          <!-- CONTACT INFO -->
          <div class="contact-info-section">
            <h3>Contact Details</h3>
            <ul class="contact-info-list">
              <li class="contact-info-item">
                <span class="contact-info-icon">
                  <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </span>
                <div class="contact-info-text">
                  <h4>Address</h4>
                  <p>${settings.address || 'Times Square, New York, NY'}</p>
                </div>
              </li>
              <li class="contact-info-item">
                <span class="contact-info-icon">
                  <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                </span>
                <div class="contact-info-text">
                  <h4>Phone</h4>
                  <p>${settings.phone_number}</p>
                </div>
              </li>
              <li class="contact-info-item">
                <span class="contact-info-icon">
                  <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                </span>
                <div class="contact-info-text">
                  <h4>Email</h4>
                  <p>${settings.email_address}</p>
                </div>
              </li>
              <li class="contact-info-item">
                <span class="contact-info-icon">
                  <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.79L11 14.12V7h1.5v6.26l3.81 2.27-.82 1.26z"/></svg>
                </span>
                <div class="contact-info-text">
                  <h4>Studio Hours</h4>
                  <p>${settings.business_hours}</p>
                </div>
              </li>
            </ul>

            <h3 style="margin-bottom: 1rem;">Follow Us</h3>
            <div class="contact-socials">
              <a href="${settings.instagram_link}" target="_blank" class="social-icon">
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="${settings.facebook_link}" target="_blank" class="social-icon">
                <svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
              </a>
              <a href="${settings.youtube_link}" target="_blank" class="social-icon">
                <svg viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.872.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <!-- ENQUIRY FORM -->
          <div class="contact-form-card">
            <h3 class="serif text-gold" style="font-size: 1.8rem; margin-bottom: 2rem; text-align: center;">Send Enquiry</h3>
            <form id="contact-enquiry-form">
              <div class="form-feedback" id="contact-form-feedback">Your inquiry has been successfully sent. We will get in touch shortly!</div>
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" name="name" required placeholder="e.g. John Doe">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" class="form-control" name="email" required placeholder="e.g. john@example.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" name="phone" required placeholder="e.g. +91 98765 43210">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Your Message</label>
                <textarea class="form-control" name="message" required placeholder="Outline details of your event or session requirements..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
            </form>
          </div>
        </div>

        <!-- GOOGLE MAPS EMBED -->
        <div class="map-container">
          <iframe src="${settings.google_maps_embed}" allowfullscreen="" loading="lazy"></iframe>
        </div>
      </section>
    `;

    // Handle Contact Inquiry Submission
    const form = document.getElementById('contact-enquiry-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const newEnquiry = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
      };

      await db.insert('enquiries', newEnquiry);
      
      const feedback = document.getElementById('contact-form-feedback');
      feedback.style.display = 'block';
      form.reset();

      setTimeout(() => {
        feedback.style.display = 'none';
      }, 5000);
    });
  }

  async renderBooking() {
    const settings = await db.getSettings();
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const preselectedPackage = urlParams.get('package') || '';
    const preselectedService = urlParams.get('service') || '';

    const packages = await db.get('packages');
    const services = await db.get('services');

    this.contentArea.innerHTML = `
      <section class="py-section container" style="padding-top: 140px;">
        <div class="booking-section">
          <div class="booking-card">
            <h2 class="section-title text-gold serif" style="margin-bottom: 0.5rem;">Book Your Session</h2>
            <p class="section-subtitle" style="margin-bottom: 3rem;">Submit event requirements for a detailed luxury scheduling proposal</p>
            
            <form id="studio-booking-form">
              <div class="form-feedback" id="booking-form-feedback">Your booking request has been successfully submitted! Our coordinator will call you back within 24 hours.</div>
              
              <h3 class="serif text-gold" style="font-size: 1.4rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Contact Information</h3>
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" name="name" required placeholder="John Doe">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" class="form-control" name="email" required placeholder="john@example.com">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" name="phone" required placeholder="+1 (555) 000-0000">
                </div>
              </div>

              <h3 class="serif text-gold" style="font-size: 1.4rem; margin-top: 2.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Event Details</h3>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Event Type</label>
                  <select class="form-control" name="event_type" required>
                    <option value="">-- Select Event Category --</option>
                    <option value="Wedding" ${preselectedService.startsWith('Wedding') || preselectedPackage.includes('Silver') || preselectedPackage.includes('Gold') ? 'selected' : ''}>Wedding Shoot</option>
                    <option value="Pre-Wedding">Pre-Wedding Shoot</option>
                    <option value="Engagement">Engagement / Proposal</option>
                    <option value="Birthday">Birthday Staging</option>
                    <option value="Baby Shoot">Baby / Newborn Shoot</option>
                    <option value="Maternity">Maternity Shoot</option>
                    <option value="Fashion">Fashion Editorial</option>
                    <option value="Product Photography">Product Campaign</option>
                    <option value="Food Photography">Food & Beverage Campaign</option>
                    <option value="Corporate Events">Corporate Event Coverage</option>
                    <option value="Cinematic Videography">Cinematic Videography Only</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Preferred Date</label>
                  <input type="date" class="form-control" name="date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Selected Package / Service</label>
                  <select class="form-control" name="package" required>
                    <option value="">-- Select Package Plan --</option>
                    <optgroup label="Core Packages">
                      ${packages.map(pkg => `
                        <option value="${pkg.title}" ${preselectedPackage === pkg.title ? 'selected' : ''}>${pkg.title} (${pkg.price})</option>
                      `).join('')}
                    </optgroup>
                    <optgroup label="Bespoke Services">
                      ${services.map(srv => `
                        <option value="${srv.title}" ${preselectedService === srv.title ? 'selected' : ''}>${srv.title} (${srv.price})</option>
                      `).join('')}
                    </optgroup>
                    <option value="Custom Plan">Custom Tailored Proposal</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Estimated Guest Count</label>
                  <input type="number" class="form-control" name="guests" placeholder="e.g. 150">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Event Location</label>
                  <input type="text" class="form-control" name="location" required placeholder="e.g. Grand Plaza Ballroom, New York">
                </div>
                <div class="form-group">
                  <label class="form-label">Estimated Budget</label>
                  <input type="text" class="form-control" name="budget" placeholder="e.g. ₹3,000">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Additional Staging & Album Requirements</label>
                <textarea class="form-control" name="requirements" placeholder="Tell us about special event timelines, drone coverages, or specific deliverables..."></textarea>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Request Custom Booking</button>
            </form>
          </div>
        </div>
      </section>
    `;

    // Handle Form Submit
    const form = document.getElementById('studio-booking-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const bookingData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        event_type: formData.get('event_type'),
        date: formData.get('date'),
        location: formData.get('location'),
        package: formData.get('package'),
        guests: parseInt(formData.get('guests')) || 0,
        budget: formData.get('budget'),
        requirements: formData.get('requirements'),
        status: 'pending'
      };

      await db.insert('bookings', bookingData);

      const feedback = document.getElementById('booking-form-feedback');
      feedback.style.display = 'block';
      form.reset();
      
      window.scrollTo({
        top: feedback.offsetTop - 120,
        behavior: 'smooth'
      });

      setTimeout(() => {
        feedback.style.display = 'none';
      }, 6000);
    });
  }

  // --- FLOATING WIDGETS & LIGHTBOX LOGIC ---

  generateGalleryHTML(item, index, filterScope) {
    const isVideo = item.media_type === 'video';
    return `
      <div class="gallery-item" data-index="${index}" data-scope="${filterScope}">
        <img src="${isVideo ? 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80' : item.url}" style="display: ${isVideo ? 'none' : 'block'}" alt="${item.title || ''}">
        ${isVideo ? `
          <video src="${item.url}" muted loop playsinline></video>
          <div class="gallery-play-icon">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        ` : ''}
        <div class="gallery-overlay">
          <span class="gallery-cat">${item.category}</span>
          <h3 class="gallery-title">${item.title || 'Untitled Staging'}</h3>
        </div>
      </div>
    `;
  }

  bindGalleryClicks(gridId, mediaList) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const items = grid.querySelectorAll('.gallery-item');
    items.forEach(item => {
      // Play video thumbnail on hover
      const video = item.querySelector('video');
      if (video) {
        item.addEventListener('mouseenter', () => video.play().catch(e => {}));
        item.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
        });
      }

      item.addEventListener('click', () => {
        const index = parseInt(item.getAttribute('data-index'));
        this.openLightbox(index, mediaList);
      });
    });
  }

  initLightbox() {
    this.lightbox = document.getElementById('lightbox-modal');
    this.lightboxMedia = document.getElementById('lightbox-media-container');
    this.lightboxCaption = document.getElementById('lightbox-caption-container');
    this.lightboxClose = document.getElementById('lightbox-close-btn');
    this.lightboxPrev = document.getElementById('lightbox-prev-btn');
    this.lightboxNext = document.getElementById('lightbox-next-btn');

    if (!this.lightbox) return;

    this.lightboxClose.addEventListener('click', () => this.closeLightbox());
    this.lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateLightbox(-1);
    });
    this.lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateLightbox(1);
    });

    // Close on overlay click
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox || e.target.classList.contains('lightbox-content-container')) {
        this.closeLightbox();
      }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
      if (e.key === 'ArrowRight') this.navigateLightbox(1);
    });

    // Handle zoom on image click
    this.lightboxMedia.addEventListener('click', (e) => {
      const img = this.lightboxMedia.querySelector('img');
      if (img) {
        this.isZoomed = !this.isZoomed;
        img.style.transform = this.isZoomed ? 'scale(1.5)' : 'scale(1)';
        img.style.cursor = this.isZoomed ? 'zoom-out' : 'zoom-in';
      }
    });
  }

  openLightbox(index, list) {
    this.currentGalleryItems = list;
    this.lightboxIndex = index;
    this.isZoomed = false;
    
    this.lightbox.classList.add('active');
    this.renderLightboxContent();
  }

  closeLightbox() {
    if (this.lightbox) {
      this.lightbox.classList.remove('active');
      this.lightboxMedia.innerHTML = '';
    }
  }

  navigateLightbox(direction) {
    this.lightboxIndex = (this.lightboxIndex + direction + this.currentGalleryItems.length) % this.currentGalleryItems.length;
    this.isZoomed = false;
    this.renderLightboxContent();
  }

  renderLightboxContent() {
    const item = this.currentGalleryItems[this.lightboxIndex];
    if (!item) return;

    const isVideo = item.media_type === 'video';
    
    // Render media element
    if (isVideo) {
      this.lightboxMedia.innerHTML = `
        <video src="${item.url}" class="lightbox-media" controls autoplay playsinline loop></video>
      `;
    } else {
      this.lightboxMedia.innerHTML = `
        <img src="${item.url}" class="lightbox-media" style="cursor: zoom-in;" alt="${item.title || ''}">
      `;
    }

    // Render captions
    this.lightboxCaption.innerHTML = `
      <h3 class="lightbox-title">${item.title || 'Untitled Gold Staging'}</h3>
      <span class="lightbox-category">${item.category}</span>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.4rem;">${item.description || ''}</p>
    `;
  }

  // --- BLOG DETAIL ACTIONS ---

  generateBlogCardHTML(post) {
    const date = new Date(post.created_at).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
    return `
      <div class="blog-card" data-id="${post.id}">
        <img src="${post.cover_url}" class="blog-cover" alt="${post.title}">
        <div class="blog-info">
          <span class="blog-category">${post.category}</span>
          <h3 class="blog-post-title">${post.title}</h3>
          <p class="blog-excerpt">${post.excerpt}</p>
          <div class="blog-meta">
            <span>By ${post.author}</span>
            <span>${date}</span>
          </div>
        </div>
      </div>
    `;
  }

  bindBlogClicks(list) {
    const cards = document.querySelectorAll('.blog-card');
    const modal = document.getElementById('blog-article-modal');
    const closeBtn = document.getElementById('modal-blog-close');

    cards.forEach(card => {
      const id = card.getAttribute('data-id');
      const titleBtn = card.querySelector('.blog-post-title');
      const imgBtn = card.querySelector('.blog-cover');

      const openAction = () => {
        const post = list.find(p => p.id === id);
        if (!post) return;

        const date = new Date(post.created_at).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        });

        document.getElementById('modal-blog-cover').src = post.cover_url;
        document.getElementById('modal-blog-category').innerText = post.category;
        document.getElementById('modal-blog-title').innerText = post.title;
        document.getElementById('modal-blog-author').innerText = post.author;
        document.getElementById('modal-blog-date').innerText = date;
        document.getElementById('modal-blog-content').innerHTML = post.content;

        modal.classList.add('active');
      };

      if (titleBtn) titleBtn.addEventListener('click', openAction);
      if (imgBtn) imgBtn.addEventListener('click', openAction);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('blog-modal-container')) {
          modal.classList.remove('active');
        }
      });
    }
  }
}

// Utility to switch portfolio schema names if needed
function portfolioTable() {
  return 'portfolio';
}
function formatIndianPhone(phone) {
  if (!phone) return "";

  phone = phone.toString().replace(/\D/g, "");

  if (phone.startsWith("91") && phone.length === 12) {
    phone = phone.substring(2);
  }

  if (phone.length === 10) {  
    return `+91 ${phone.substring(0, 5)} ${phone.substring(5)}`;
  }

  return phone;
}
// Initialize Application on document load
let studioAppInstance = null;
document.addEventListener('DOMContentLoaded', () => {
  studioAppInstance = new App();
});
