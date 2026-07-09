// js/admin.js
import { db, optimizeCloudinaryUrl, extractCloudinaryPublicId, getCloudinaryResourceType } from './data.js';
import { resetSupabaseClient, isSupabaseConnected } from './supabase-config.js';

// Background cleanup helper for replaced Cloudinary assets
function deleteOldCloudinaryAsset(url) {
  const publicId = extractCloudinaryPublicId(url);
  const resourceType = getCloudinaryResourceType(url);
  if (publicId) {
    fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType })
    })
    .then(res => res.json())
    .then(data => console.log('Cleaned up replaced Cloudinary asset:', data))
    .catch(err => console.error('Cloudinary asset cleanup failed:', err));
  }
}

let appInstance = null;

export function initAdmin(app) {
  appInstance = app;
}

// Check if admin is currently authenticated
function isAdminAuthenticated() {
  return sessionStorage.getItem('gold_studio_admin_logged') === 'true';
}

// Authenticate administrator
async function loginAdmin(username, password) {
  const settings = await db.getSettings();
  const dbUsername = "admin";
  const dbPassword = settings.admin_password || "goldstudio2026";

  if (username === dbUsername && password === dbPassword) {
    sessionStorage.setItem('gold_studio_admin_logged', 'true');
    return true;
  }
  return false;
}

// Log out admin
export function logoutAdmin() {
  sessionStorage.removeItem('gold_studio_admin_logged');
  window.location.hash = '#admin-login';
}

// --- RENDER VIEWS ---

export function renderAdminLogin(app) {
  if (isAdminAuthenticated()) {
    window.location.hash = '#admin-dashboard';
    return;
  }

  app.contentArea.innerHTML = `
    <section class="py-section container" style="padding-top: 140px;">
      <div class="login-section">
        <div class="login-card">
          <img src="assets/gold_studio_logo.jpg" class="login-logo" alt="Gold Studio Logo" id="login-logo-img">
          <h2 class="login-title serif">Staff Sign In</h2>
          <p class="login-subtitle">Administrator Portal Access</p>
          
          <form id="admin-login-form">
            <div class="alert-banner" id="login-error" style="display: none; background: rgba(231, 76, 60, 0.1); border-color: #e74c3c; color: #e74c3c;">
              Invalid username or password. Please try again.
            </div>
            
            <div class="form-group" style="text-align: left;">
              <label class="form-label">Username</label>
              <input type="text" class="form-control" name="username" required placeholder="admin">
            </div>
            
            <div class="form-group" style="text-align: left;">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" name="password" required placeholder="••••••••">
            </div>
            
            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Log In</button>
          </form>
        </div>
      </div>
    </section>
  `;

  // Update logo dynamically from settings
  db.getSettings().then(settings => {
    if (settings.logo_url) {
      document.getElementById('login-logo-img').src = settings.logo_url;
    }
  });

  const form = document.getElementById('admin-login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const success = await loginAdmin(formData.get('username'), formData.get('password'));
    
    if (success) {
      window.location.hash = '#admin-dashboard';
    } else {
      const err = document.getElementById('login-error');
      err.style.display = 'block';
      setTimeout(() => err.style.display = 'none', 4000);
    }
  });
}

export async function renderAdminDashboard(app) {
  if (!isAdminAuthenticated()) {
    window.location.hash = '#admin-login';
    return;
  }

  // Fetch all DB records
  const settings = await db.getSettings();
  const portfolio = await db.get('portfolio');
  const bookings = await db.get('bookings');
  const enquiries = await db.get('enquiries');
  const testimonials = await db.get('testimonials');

  const photosCount = portfolio.filter(p => p.media_type !== 'video').length;
  const videosCount = portfolio.filter(p => p.media_type === 'video').length;

  app.contentArea.innerHTML = `
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <ul class="admin-sidebar-menu">
          <li class="admin-sidebar-item active" data-tab="admin-tab-overview">
            <button>
              <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              Overview
            </button>
          </li>
          <li class="admin-sidebar-item" data-tab="admin-tab-media">
            <button>
              <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              Media Manager
            </button>
          </li>
          <li class="admin-sidebar-item" data-tab="admin-tab-bookings">
            <button>
              <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
              Bookings
            </button>
          </li>
          <li class="admin-sidebar-item" data-tab="admin-tab-enquiries">
            <button>
              <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
              Inquiries
            </button>
          </li>
          <li class="admin-sidebar-item" data-tab="admin-tab-content">
            <button>
              <svg viewBox="0 0 24 24"><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/></svg>
              Content Management
            </button>
          </li>
          <li class="admin-sidebar-item" data-tab="admin-tab-settings">
            <button>
              <svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
              Settings
            </button>
          </li>
          <li class="admin-sidebar-item admin-logout-btn" id="btn-admin-logout">
            <button>
              <svg viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
              Sign Out
            </button>
          </li>
        </ul>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="admin-main">
        
        <!-- OVERVIEW TAB -->
        <div class="admin-tab-view active" id="admin-tab-overview">
          <div class="admin-page-header">
            <h2 class="admin-page-title">Dashboard Overview</h2>
            <div style="font-size: 0.8rem; background: ${isSupabaseConnected() ? '#2ecc71' : '#f39c12'}; color: var(--bg-deep); padding: 0.4rem 1rem; border-radius: 20px; font-weight: 700; text-transform: uppercase;">
              Database: ${isSupabaseConnected() ? 'Live (Supabase)' : 'Local Cache (Demo)'}
            </div>
          </div>
          
          <div class="admin-stats-grid">
            <div class="admin-stat-card">
              <div class="admin-stat-icon">
                <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              </div>
              <div class="admin-stat-info">
                <h5>Photos</h5>
                <div class="admin-stat-val">${photosCount}</div>
              </div>
            </div>
            <div class="admin-stat-card">
              <div class="admin-stat-icon">
                <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              </div>
              <div class="admin-stat-info">
                <h5>Videos</h5>
                <div class="admin-stat-val">${videosCount}</div>
              </div>
            </div>
            <div class="admin-stat-card">
              <div class="admin-stat-icon">
                <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
              </div>
              <div class="admin-stat-info">
                <h5>Bookings</h5>
                <div class="admin-stat-val">${bookings.length}</div>
              </div>
            </div>
            <div class="admin-stat-card">
              <div class="admin-stat-icon">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
              </div>
              <div class="admin-stat-info">
                <h5>Inquiries</h5>
                <div class="admin-stat-val">${enquiries.length}</div>
              </div>
            </div>
          </div>

          <h3 class="serif" style="color: var(--text-white); margin-bottom: 1.5rem;">Recent Bookings</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Package</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.slice(0, 5).map(b => `
                  <tr>
                    <td><strong>${b.name}</strong><br><span style="color: var(--text-muted); font-size: 0.75rem;">${b.phone}</span></td>
                    <td>${b.event_type}</td>
                    <td>${b.date}</td>
                    <td>${b.package}</td>
                    <td><span class="status-badge status-${b.status}">${b.status}</span></td>
                  </tr>
                `).join('')}
                ${bookings.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No bookings received yet.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- MEDIA MANAGER TAB -->
        <div class="admin-tab-view" id="admin-tab-media">
          <div class="admin-page-header">
            <h2 class="admin-page-title">Portfolio Manager</h2>
            <button class="btn btn-primary" id="btn-admin-add-media">+ Add Media</button>
          </div>
          
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-media-tbody">
                ${portfolio.map(p => `
                  <tr data-media-id="${p.id}">
                    <td>
                      ${p.media_type === 'video' ? `
                        <video src="${p.url}" class="table-thumbnail" muted></video>
                      ` : `
                        <img src="${p.url}" class="table-thumbnail" alt="">
                      `}
                    </td>
                    <td><strong>${p.title || 'Untitled Staging'}</strong><br><span style="color: var(--text-muted); font-size: 0.75rem;">${p.description ? p.description.substring(0, 40) + '...' : ''}</span></td>
                    <td>${p.category}</td>
                    <td style="text-transform: uppercase;">${p.media_type}</td>
                    <td>${p.is_featured ? '<span style="color: var(--gold-primary); font-weight: 700;">★ Yes</span>' : 'No'}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-btn btn-edit-media" title="Edit">
                          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </button>
                        <button class="action-btn btn-delete btn-delete-media" title="Delete">
                          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
                ${portfolio.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No portfolio items uploaded yet.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- BOOKINGS TAB -->
        <div class="admin-tab-view" id="admin-tab-bookings">
          <div class="admin-page-header">
            <h2 class="admin-page-title">Booking Requests</h2>
          </div>
          
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Client Details</th>
                  <th>Event</th>
                  <th>Date / Location</th>
                  <th>Package / Budget</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-bookings-tbody">
                ${bookings.map(b => `
                  <tr data-booking-id="${b.id}">
                    <td>
                      <strong>${b.name}</strong><br>
                      <span style="color: var(--text-muted); font-size: 0.75rem;">${b.phone}<br>${b.email}</span>
                    </td>
                    <td><strong>${b.event_type}</strong><br><span style="color: var(--text-muted); font-size: 0.75rem;">Guests: ${b.guests}</span></td>
                    <td>${b.date}<br><span style="color: var(--text-muted); font-size: 0.75rem;">${b.location}</span></td>
                    <td>${b.package}<br><span style="color: var(--text-muted); font-size: 0.75rem;">Budget: ${b.budget || 'N/A'}</span></td>
                    <td><span class="status-badge status-${b.status}">${b.status}</span></td>
                    <td>
                      <div class="action-buttons">
                        ${b.status !== 'approved' ? `
                          <button class="action-btn btn-approve-booking" title="Approve" style="color: #2ecc71;">
                            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          </button>
                        ` : ''}
                        ${b.status !== 'declined' ? `
                          <button class="action-btn btn-decline-booking" title="Decline" style="color: #e74c3c;">
                            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                          </button>
                        ` : ''}
                        <button class="action-btn btn-delete btn-delete-booking" title="Delete">
                          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
                ${bookings.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No bookings received yet.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- INQUIRIES TAB -->
        <div class="admin-tab-view" id="admin-tab-enquiries">
          <div class="admin-page-header">
            <h2 class="admin-page-title">Contact Enquiries</h2>
          </div>
          
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Contact Info</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-enquiries-tbody">
                ${enquiries.map(e => `
                  <tr data-enquiry-id="${e.id}">
                    <td><strong>${e.name}</strong></td>
                    <td>${e.phone}<br><span style="color: var(--text-muted); font-size: 0.75rem;">${e.email}</span></td>
                    <td style="max-width: 350px; line-height: 1.5;">${e.message}</td>
                    <td>${new Date(e.created_at).toLocaleDateString()}</td>
                    <td>
                      <button class="action-btn btn-delete btn-delete-enquiry" title="Delete">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                      </button>
                    </td>
                  </tr>
                `).join('')}
                ${enquiries.length === 0 ? '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No enquiries received yet.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- CONTENT MANAGEMENT TAB -->
        <div class="admin-tab-view" id="admin-tab-content">
          <div class="admin-page-header">
            <h2 class="admin-page-title">Content & Publishing</h2>
            <div class="action-buttons">
              <button class="btn btn-primary" id="btn-admin-add-testimonial">+ Add Review</button>
            </div>
          </div>
          
          <h3 class="serif" style="color: var(--text-white); margin-bottom: 1.5rem;">Testimonials Approval</h3>
          <div class="admin-table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Role</th>
                  <th>Review</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="admin-testimonials-tbody">
                ${testimonials.map(t => `
                  <tr data-testimonial-id="${t.id}">
                    <td><strong>${t.name}</strong></td>
                    <td>${t.role}</td>
                    <td style="max-width: 350px; line-height: 1.5;">"${t.review}"</td>
                    <td>${t.rating} Stars</td>
                    <td>
                      <button class="action-btn btn-delete btn-delete-testimonial" title="Delete">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- SETTINGS TAB -->
        <div class="admin-tab-view" id="admin-tab-settings">
          <div class="admin-page-header">
            <h2 class="admin-page-title">Website Settings</h2>
            <button class="btn btn-primary" id="btn-admin-save-settings">Save Configurations</button>
          </div>
          
          <form id="admin-settings-form">
            <!-- SUPABASE INTEGRATION -->
            <h3 class="serif text-gold" style="font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Supabase Live Connection</h3>
            <div class="alert-banner">
              To host dynamic photographs, blog updates, and booking requests in a live database, paste your Supabase Project credentials below. 
              Leave them blank to operate in <strong>Demo (localStorage) Mode</strong>.
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Supabase URL</label>
                <input type="text" class="form-control" name="supabase_url" id="settings-supabase-url" placeholder="https://xxxx.supabase.co">
              </div>
              <div class="form-group">
                <label class="form-label">Supabase Anon Key</label>
                <input type="password" class="form-control" name="supabase_anon_key" id="settings-supabase-key" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
              </div>
            </div>
            <div class="form-group" style="display: flex; gap: 1rem; margin-bottom: 3rem;">
              <button type="button" class="btn btn-outline" id="btn-admin-verify-supabase">Connect & Sync Data</button>
              <button type="button" class="btn btn-secondary" id="btn-admin-disconnect-supabase" style="display: ${isSupabaseConnected() ? 'block' : 'none'};">Disconnect Supabase</button>
            </div>

            <!-- BRANDING -->
            <h3 class="serif text-gold" style="font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Branding & Assets</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Studio Name</label>
                <input type="text" class="form-control" name="studio_name" value="${settings.studio_name}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Tagline / Subheading</label>
                <input type="text" class="form-control" name="tagline" value="${settings.tagline}" required>
              </div>
            </div>
            
            <div class="form-row" style="margin-bottom: 2rem;">
              <div class="form-group">
                <label class="form-label">Upload Studio Logo</label>
                <div class="file-dropzone" id="logo-dropzone">
                  <input type="file" id="logo-file-input" accept="image/*">
                  <div class="dropzone-text">Drag & drop or <span>browse</span> to replace logo</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
                  <img src="${settings.logo_url}" id="settings-logo-preview" style="height: 50px; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border);" alt="">
                  <input type="text" class="form-control" name="logo_url" id="settings-logo-url-input" value="${settings.logo_url}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Upload Website Favicon</label>
                <div class="file-dropzone" id="favicon-dropzone">
                  <input type="file" id="favicon-file-input" accept="image/*">
                  <div class="dropzone-text">Drag & drop or <span>browse</span> to replace favicon</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
                  <img src="${settings.favicon_url}" id="settings-favicon-preview" style="height: 40px; width: 40px; border-radius: 50%;" alt="">
                  <input type="text" class="form-control" name="favicon_url" id="settings-favicon-url-input" value="${settings.favicon_url}">
                </div>
              </div>
            </div>

            <div class="form-row" style="margin-bottom: 2rem;">
              <div class="form-group">
                <label class="form-label">Upload Hero Banner (Image or Video)</label>
                <div class="file-dropzone" id="hero-dropzone">
                  <input type="file" id="hero-file-input" accept="image/*,video/*">
                  <div class="dropzone-text">Drag & drop or <span>browse</span> to replace hero cover</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem; flex-grow: 1;">
                  ${settings.hero_url && (settings.hero_url.endsWith('.mp4') || settings.hero_url.includes('/video/upload/')) ? `
                    <video src="${settings.hero_url}" id="settings-hero-preview" style="height: 50px; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border);" muted autoplay loop></video>
                  ` : `
                    <img src="${settings.hero_url}" id="settings-hero-preview" style="height: 50px; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border);" alt="">
                  `}
                  <input type="text" class="form-control" name="hero_url" id="settings-hero-url-input" value="${settings.hero_url}">
                </div>
              </div>
            </div>

            <div class="form-row" style="margin-bottom: 2rem;">
              <div class="form-group">
                <label class="form-label">Upload Home Intro Section Image</label>
                <div class="file-dropzone" id="about-intro-dropzone">
                  <input type="file" id="about-intro-file-input" accept="image/*">
                  <div class="dropzone-text">Drag & drop or <span>browse</span> to replace intro image</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
                  <img src="${settings.about_intro_url}" id="settings-about-intro-preview" style="height: 50px; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border);" alt="">
                  <input type="text" class="form-control" name="about_intro_url" id="settings-about-intro-url-input" value="${settings.about_intro_url}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Upload About Page Story Image</label>
                <div class="file-dropzone" id="about-story-dropzone">
                  <input type="file" id="about-story-file-input" accept="image/*">
                  <div class="dropzone-text">Drag & drop or <span>browse</span> to replace story image</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
                  <img src="${settings.about_story_url}" id="settings-about-story-preview" style="height: 50px; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border);" alt="">
                  <input type="text" class="form-control" name="about_story_url" id="settings-about-story-url-input" value="${settings.about_story_url}">
                </div>
              </div>
            </div>

            <!-- CONTACT DETAILS -->
            <h3 class="serif text-gold" style="font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Contact Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="text" class="form-control" name="phone_number" value="${settings.phone_number}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-control" name="email_address" value="${settings.email_address}" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Physical Address</label>
              <input type="text" class="form-control" name="address" value="${settings.address}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Business Hours Summary</label>
              <input type="text" class="form-control" name="business_hours" value="${settings.business_hours}" required>
            </div>

            <!-- FLOATING WIDGETS -->
            <h3 class="serif text-gold" style="font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">WhatsApp & Actions Integration</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">WhatsApp Contact Number (digits only, e.g. 15557778888)</label>
                <input type="text" class="form-control" name="whatsapp_number" value="${settings.whatsapp_number}" required>
              </div>
              <div class="form-group">
                <label class="form-label">WhatsApp Default Message</label>
                <input type="text" class="form-control" name="whatsapp_default_message" value="${settings.whatsapp_default_message}" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Google Maps Embed URL (src attribute from iframe)</label>
              <input type="text" class="form-control" name="google_maps_embed" value="${settings.google_maps_embed}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Google Maps Directions URL</label>
              <input type="text" class="form-control" name="google_maps_directions" value="${settings.google_maps_directions}" required>
            </div>

            <!-- SOCIAL MEDIA LINKS -->
            <h3 class="serif text-gold" style="font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Social Media Links</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Instagram Link</label>
                <input type="url" class="form-control" name="instagram_link" value="${settings.instagram_link}">
              </div>
              <div class="form-group">
                <label class="form-label">Facebook Link</label>
                <input type="url" class="form-control" name="facebook_link" value="${settings.facebook_link}">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">YouTube Link</label>
                <input type="url" class="form-control" name="youtube_link" value="${settings.youtube_link}">
              </div>
              <div class="form-group">
                <label class="form-label">Twitter/X Link</label>
                <input type="url" class="form-control" name="twitter_link" value="${settings.twitter_link}">
              </div>
            </div>

            <!-- SEARCH ENGINE OPTIMIZATION -->
            <h3 class="serif text-gold" style="font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">SEO Configurations</h3>
            <div class="form-group">
              <label class="form-label">SEO Page Title</label>
              <input type="text" class="form-control" name="seo_title" value="${settings.seo_title}" required>
            </div>
            <div class="form-group">
              <label class="form-label">SEO Meta Description</label>
              <textarea class="form-control" name="seo_description" required>${settings.seo_description}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">SEO Keywords (comma separated)</label>
              <input type="text" class="form-control" name="seo_keywords" value="${settings.seo_keywords}" required>
            </div>

            <!-- SECURITY -->
            <h3 class="serif text-gold" style="font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Admin Panel Security</h3>
            <div class="form-group">
              <label class="form-label">Change Administrator Password</label>
              <input type="password" class="form-control" name="admin_password" placeholder="•••••••• (leave blank to keep current)">
            </div>
          </form>
        </div>

      </main>
    </div>

    <!-- MEDIA UPLOAD MODAL -->
    <div class="admin-modal" id="admin-media-modal">
      <div class="admin-modal-container">
        <h3 class="serif text-gold" style="font-size: 1.8rem; margin-bottom: 2rem;" id="media-modal-title">Upload Portfolio Item</h3>
        <form id="admin-media-form">
          <input type="hidden" name="media_id" id="form-media-id">
          
          <div class="form-group">
            <label class="form-label">Title / Caption</label>
            <input type="text" class="form-control" name="title" id="form-media-title" placeholder="e.g. Sunset Ceremony" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Media Type</label>
            <select class="form-control" name="media_type" id="form-media-type" required>
              <option value="image">Photograph (Image)</option>
              <option value="video">Cinematic Video</option>
            </select>
          </div>

          <div class="form-group" id="media-file-upload-section">
            <label class="form-label">Upload File</label>
            <div class="file-dropzone">
              <input type="file" id="portfolio-file-input">
              <div class="dropzone-text">Drag & drop or <span>browse</span> file</div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
              Supported formats: JPG, PNG, WEBP, MP4
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Or External URL (for fallback / hosted files)</label>
            <input type="text" class="form-control" name="url" id="form-media-url" placeholder="https://images.unsplash.com/photo...">
          </div>

          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-control" name="category" id="form-media-category" required>
              <option value="Wedding">Wedding</option>
              <option value="Pre-Wedding">Pre-Wedding</option>
              <option value="Engagement">Engagement</option>
              <option value="Reception">Reception</option>
              <option value="Birthday">Birthday</option>
              <option value="Baby Shoot">Baby Shoot</option>
              <option value="Maternity">Maternity</option>
              <option value="Fashion">Fashion</option>
              <option value="Product Photography">Product Photography</option>
              <option value="Food Photography">Food Photography</option>
              <option value="Corporate Events">Corporate Events</option>
              <option value="Commercial Photography">Commercial Photography</option>
              <option value="Travel">Travel</option>
              <option value="Nature">Nature</option>
              <option value="Cinematic Videography">Cinematic Videography</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" name="description" id="form-media-desc" placeholder="Describe the staging backdrop, couple or product details..."></textarea>
          </div>

          <div class="form-group" style="display: flex; align-items: center; gap: 0.8rem;">
            <input type="checkbox" name="is_featured" id="form-media-featured" style="width: 18px; height: 18px; cursor: pointer;">
            <label class="form-label" style="margin-bottom: 0; cursor: pointer;" for="form-media-featured">Mark as Featured on Homepage</label>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary" style="flex: 1;" id="btn-save-media-submit">Publish Media</button>
            <button type="button" class="btn btn-outline" style="flex: 1;" id="btn-cancel-media-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- TESTIMONIAL UPLOAD MODAL -->
    <div class="admin-modal" id="admin-testimonial-modal">
      <div class="admin-modal-container">
        <h3 class="serif text-gold" style="font-size: 1.8rem; margin-bottom: 2rem;">Add Client Review</h3>
        <form id="admin-testimonial-form">
          <div class="form-group">
            <label class="form-label">Client Name</label>
            <input type="text" class="form-control" name="name" id="form-testimonial-name" placeholder="e.g. Sarah & James" required>
          </div>
          <div class="form-group">
            <label class="form-label">Client Role</label>
            <input type="text" class="form-control" name="role" id="form-testimonial-role" placeholder="e.g. Bride & Groom" required>
          </div>
          <div class="form-group">
            <label class="form-label">Rating</label>
            <select class="form-control" name="rating" id="form-testimonial-rating" required>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Client Avatar / Photo</label>
            <div class="file-dropzone" id="testimonial-dropzone">
              <input type="file" id="testimonial-file-input" accept="image/*">
              <div class="dropzone-text">Drag & drop or <span>browse</span> client photo</div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
              <img src="assets/avatar_default.jpg" id="form-testimonial-preview" style="height: 50px; width: 50px; border-radius: 50%;" alt="">
              <input type="text" class="form-control" name="image_url" id="form-testimonial-image-url" placeholder="https://res.cloudinary.com/...">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Review Text</label>
            <textarea class="form-control" name="review" id="form-testimonial-review" placeholder="Write their review here..." style="min-height: 100px;" required></textarea>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary" style="flex: 1;">Save Review</button>
            <button type="button" class="btn btn-outline" style="flex: 1;" id="btn-cancel-testimonial-modal">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Pre-fill Supabase Connection credentials
  document.getElementById('settings-supabase-url').value = localStorage.getItem('gold_studio_supabase_url') || '';
  document.getElementById('settings-supabase-key').value = localStorage.getItem('gold_studio_supabase_anon_key') || '';

  // Setup Tab Navigation
  const sidebarItems = document.querySelectorAll('.admin-sidebar-item[data-tab]');
  const tabViews = document.querySelectorAll('.admin-tab-view');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const target = item.getAttribute('data-tab');
      tabViews.forEach(v => {
        if (v.id === target) v.classList.add('active');
        else v.classList.remove('active');
      });
    });
  });

  // Sign out click
  document.getElementById('btn-admin-logout').addEventListener('click', logoutAdmin);

  // Bind booking status actions (Approve / Decline / Delete)
  bindBookingActions(bookings);
  
  // Bind inquiry delete actions
  bindInquiryActions(enquiries);

  // Bind media actions (Edit / Delete / Modals)
  bindMediaActions(portfolio);

  // Bind settings saving and Supabase connection triggers
  bindSettingsActions(settings);

  // Bind custom modals cancellation
  document.getElementById('btn-cancel-media-modal').addEventListener('click', () => {
    document.getElementById('admin-media-modal').classList.remove('active');
  });

  document.getElementById('btn-cancel-testimonial-modal').addEventListener('click', () => {
    document.getElementById('admin-testimonial-modal').classList.remove('active');
  });

  // Bind testimonials actions (Add / Delete / Upload)
  bindTestimonialActions(testimonials);
}


// --- TAB SUB-ACTIONS & LOGIC BINDERS ---

function bindBookingActions(bookingsList) {
  const tbody = document.getElementById('admin-bookings-tbody');
  if (!tbody) return;

  tbody.addEventListener('click', async (e) => {
    const approveBtn = e.target.closest('.btn-approve-booking');
    const declineBtn = e.target.closest('.btn-decline-booking');
    const deleteBtn = e.target.closest('.btn-delete-booking');

    if (!approveBtn && !declineBtn && !deleteBtn) return;
    
    const row = e.target.closest('tr');
    const id = row.getAttribute('data-booking-id');

    if (approveBtn) {
      await db.update('bookings', id, { status: 'approved' });
      renderAdminDashboard(appInstance);
    } else if (declineBtn) {
      await db.update('bookings', id, { status: 'declined' });
      renderAdminDashboard(appInstance);
    } else if (deleteBtn) {
      if (confirm("Are you sure you want to delete this booking request?")) {
        await db.delete('bookings', id);
        renderAdminDashboard(appInstance);
      }
    }
  });
}

function bindInquiryActions(enquiriesList) {
  const tbody = document.getElementById('admin-enquiries-tbody');
  if (!tbody) return;

  tbody.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.btn-delete-enquiry');
    if (!deleteBtn) return;

    const row = e.target.closest('tr');
    const id = row.getAttribute('data-enquiry-id');

    if (confirm("Delete this inquiry from records?")) {
      await db.delete('enquiries', id);
      renderAdminDashboard(appInstance);
    }
  });
}

function bindMediaActions(portfolioList) {
  const addBtn = document.getElementById('btn-admin-add-media');
  const modal = document.getElementById('admin-media-modal');
  const form = document.getElementById('admin-media-form');
  const tbody = document.getElementById('admin-media-tbody');
  const uploadSection = document.getElementById('media-file-upload-section');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('form-media-id').value = '';
      document.getElementById('media-modal-title').innerText = "Upload Portfolio Item";
      document.getElementById('btn-save-media-submit').innerText = "Publish Media";
      uploadSection.style.display = 'block';
      modal.classList.add('active');
    });
  }

  // Row edit/delete clicks
  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.btn-edit-media');
      const deleteBtn = e.target.closest('.btn-delete-media');
      
      if (!editBtn && !deleteBtn) return;
      
      const row = e.target.closest('tr');
      const id = row.getAttribute('data-media-id');
      const item = portfolioList.find(p => p.id === id);

      if (editBtn && item) {
        document.getElementById('form-media-id').value = item.id;
        document.getElementById('form-media-title').value = item.title || '';
        document.getElementById('form-media-type').value = item.media_type;
        document.getElementById('form-media-url').value = item.url;
        document.getElementById('form-media-category').value = item.category;
        document.getElementById('form-media-desc').value = item.description || '';
        document.getElementById('form-media-featured').checked = !!item.is_featured;

        document.getElementById('media-modal-title').innerText = "Edit Media Details";
        document.getElementById('btn-save-media-submit').innerText = "Save Changes";
        uploadSection.style.display = 'none'; // hide file upload during edit, only url/metadata is editable
        
        modal.classList.add('active');
      } else if (deleteBtn) {
        if (confirm("Are you sure you want to permanently delete this portfolio item?")) {
          await db.delete('portfolio', id);
          renderAdminDashboard(appInstance);
        }
      }
    });
  }

  // Handle media file upload
  const fileInput = document.getElementById('portfolio-file-input');
  const urlInput = document.getElementById('form-media-url');

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const dropzone = fileInput.closest('.file-dropzone');
      const textNode = dropzone.querySelector('.dropzone-text');
      textNode.innerHTML = `Uploading <strong>${file.name}</strong>...`;

      try {
        const folder = file.type.startsWith('video/') ? 'videos' : 'portfolio';
        const publicUrl = await db.uploadMedia(file, folder);
        urlInput.value = publicUrl;
        textNode.innerHTML = `Uploaded <strong>${file.name}</strong> successfully!`;
      } catch (err) {
        console.error("Upload error details:", err);
        alert("Failed to upload media to storage bucket: " + (err.message || err.error_description || JSON.stringify(err)));
        textNode.innerHTML = `Upload failed: ${err.message || 'Error'}`;
      }
    });
  }

  // Form submission (Save / Insert)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const id = document.getElementById('form-media-id').value;

      const mediaItem = {
        title: formData.get('title'),
        media_type: formData.get('media_type'),
        url: formData.get('url'),
        category: formData.get('category'),
        description: formData.get('description'),
        is_featured: document.getElementById('form-media-featured').checked
      };

      if (!mediaItem.url) {
        alert("Please upload a file or enter an external URL.");
        return;
      }

      try {
        if (id) {
          // Edit existing
          const oldItem = portfolioList.find(p => p.id === id);
          if (oldItem && oldItem.url !== mediaItem.url && oldItem.url.includes('cloudinary.com')) {
            deleteOldCloudinaryAsset(oldItem.url);
          }
          await db.update('portfolio', id, mediaItem);
        } else {
          // Create new
          await db.insert('portfolio', mediaItem);
        }

        modal.classList.remove('active');
        renderAdminDashboard(appInstance);
      } catch (err) {
        console.error("Database save error:", err);
        alert("Failed to save media to database: " + err.message);
      }
    });
  }


  // Testimonial modal cancels handled in renderAdminDashboard init

}

function bindSettingsActions(currentSettings) {
  const form = document.getElementById('admin-settings-form');
  const saveBtn = document.getElementById('btn-admin-save-settings');
  const verifySupabaseBtn = document.getElementById('btn-admin-verify-supabase');
  const disconnectSupabaseBtn = document.getElementById('btn-admin-disconnect-supabase');

  if (saveBtn && form) {
    saveBtn.addEventListener('click', async () => {
      const formData = new FormData(form);
      const newSettings = { ...currentSettings };

      // Loop keys and apply
      for (let [key, val] of formData.entries()) {
        // Skip supabase configuration settings since they are saved independently
        if (key === 'supabase_url' || key === 'supabase_anon_key') continue;
        
        if (key === 'admin_password') {
          if (val.trim()) {
            newSettings.admin_password = val.trim();
          }
          continue;
        }
        newSettings[key] = val;
      }

      await db.saveSettings(newSettings);
      alert("Settings updated successfully!");
      // Live reload header assets etc.
      location.reload();
    });
  }

  // Logo file upload handler
  const logoInput = document.getElementById('logo-file-input');
  if (logoInput) {
    logoInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const dropzone = document.getElementById('logo-dropzone');
      const textNode = dropzone.querySelector('.dropzone-text');
      textNode.innerHTML = `Uploading <strong>${file.name}</strong>...`;

      try {
        const logoUrl = await db.uploadMedia(file, 'logo');
        document.getElementById('settings-logo-url-input').value = logoUrl;
        document.getElementById('settings-logo-preview').src = logoUrl;

        // Clean up previous logo asset
        const oldUrl = currentSettings.logo_url;
        if (oldUrl && oldUrl !== logoUrl && oldUrl.includes('cloudinary.com')) {
          deleteOldCloudinaryAsset(oldUrl);
        }

        textNode.innerHTML = `Updated logo! Save configuration.`;
      } catch (err) {
        console.error("Logo upload error:", err);
        alert("Failed to upload logo: " + (err.message || err.error_description || JSON.stringify(err)));
        textNode.innerHTML = `Upload failed: ${err.message || 'Error'}`;
      }
    });
  }

  // Favicon file upload handler
  const faviconInput = document.getElementById('favicon-file-input');
  if (faviconInput) {
    faviconInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const dropzone = document.getElementById('favicon-dropzone');
      const textNode = dropzone.querySelector('.dropzone-text');
      textNode.innerHTML = `Uploading <strong>${file.name}</strong>...`;

      try {
        const faviconUrl = await db.uploadMedia(file, 'logo');
        document.getElementById('settings-favicon-url-input').value = faviconUrl;
        document.getElementById('settings-favicon-preview').src = faviconUrl;

        // Clean up previous favicon asset
        const oldUrl = currentSettings.favicon_url;
        if (oldUrl && oldUrl !== faviconUrl && oldUrl.includes('cloudinary.com')) {
          deleteOldCloudinaryAsset(oldUrl);
        }

        textNode.innerHTML = `Updated favicon! Save configuration.`;
      } catch (err) {
        console.error("Favicon upload error:", err);
        alert("Failed to upload favicon: " + (err.message || err.error_description || JSON.stringify(err)));
        textNode.innerHTML = `Upload failed: ${err.message || 'Error'}`;
      }
    });
  }

  // Hero file upload handler
  const heroInput = document.getElementById('hero-file-input');
  if (heroInput) {
    heroInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const dropzone = document.getElementById('hero-dropzone');
      const textNode = dropzone.querySelector('.dropzone-text');
      textNode.innerHTML = `Uploading <strong>${file.name}</strong>...`;

      try {
        const folder = file.type.startsWith('video/') ? 'videos' : 'hero';
        const heroUrl = await db.uploadMedia(file, folder);
        document.getElementById('settings-hero-url-input').value = heroUrl;
        
        // Update preview element dynamically based on type
        const previewContainer = document.getElementById('settings-hero-preview').parentElement;
        if (file.type.startsWith('video/')) {
          previewContainer.innerHTML = `
            <video src="${heroUrl}" id="settings-hero-preview" style="height: 50px; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border);" muted autoplay loop></video>
            <input type="text" class="form-control" name="hero_url" id="settings-hero-url-input" value="${heroUrl}">
          `;
        } else {
          previewContainer.innerHTML = `
            <img src="${heroUrl}" id="settings-hero-preview" style="height: 50px; border-radius: var(--border-radius-sm); border: 1px solid var(--glass-border);" alt="">
            <input type="text" class="form-control" name="hero_url" id="settings-hero-url-input" value="${heroUrl}">
          `;
        }

        // Clean up previous hero asset
        const oldUrl = currentSettings.hero_url;
        if (oldUrl && oldUrl !== heroUrl && oldUrl.includes('cloudinary.com')) {
          deleteOldCloudinaryAsset(oldUrl);
        }

        textNode.innerHTML = `Updated hero cover! Save configuration.`;
      } catch (err) {
        console.error("Hero upload error:", err);
        alert("Failed to upload hero banner: " + (err.message || err.error_description || JSON.stringify(err)));
        textNode.innerHTML = `Upload failed: ${err.message || 'Error'}`;
      }
    });
  }

  // Home Intro image file upload handler
  const aboutIntroInput = document.getElementById('about-intro-file-input');
  if (aboutIntroInput) {
    aboutIntroInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const dropzone = document.getElementById('about-intro-dropzone');
      const textNode = dropzone.querySelector('.dropzone-text');
      textNode.innerHTML = `Uploading <strong>${file.name}</strong>...`;

      try {
        const introUrl = await db.uploadMedia(file, 'about');
        document.getElementById('settings-about-intro-url-input').value = introUrl;
        document.getElementById('settings-about-intro-preview').src = introUrl;

        // Clean up previous intro asset
        const oldUrl = currentSettings.about_intro_url;
        if (oldUrl && oldUrl !== introUrl && oldUrl.includes('cloudinary.com')) {
          deleteOldCloudinaryAsset(oldUrl);
        }

        textNode.innerHTML = `Updated intro image! Save configuration.`;
      } catch (err) {
        console.error("Home intro image upload error:", err);
        alert("Failed to upload intro image: " + (err.message || err.error_description || JSON.stringify(err)));
        textNode.innerHTML = `Upload failed: ${err.message || 'Error'}`;
      }
    });
  }

  // About Story image file upload handler
  const aboutStoryInput = document.getElementById('about-story-file-input');
  if (aboutStoryInput) {
    aboutStoryInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const dropzone = document.getElementById('about-story-dropzone');
      const textNode = dropzone.querySelector('.dropzone-text');
      textNode.innerHTML = `Uploading <strong>${file.name}</strong>...`;

      try {
        const storyUrl = await db.uploadMedia(file, 'about');
        document.getElementById('settings-about-story-url-input').value = storyUrl;
        document.getElementById('settings-about-story-preview').src = storyUrl;

        // Clean up previous story asset
        const oldUrl = currentSettings.about_story_url;
        if (oldUrl && oldUrl !== storyUrl && oldUrl.includes('cloudinary.com')) {
          deleteOldCloudinaryAsset(oldUrl);
        }

        textNode.innerHTML = `Updated story image! Save configuration.`;
      } catch (err) {
        console.error("About story image upload error:", err);
        alert("Failed to upload story image: " + (err.message || err.error_description || JSON.stringify(err)));
        textNode.innerHTML = `Upload failed: ${err.message || 'Error'}`;
      }
    });
  }

  // Verify and Save Supabase configuration live
  if (verifySupabaseBtn) {
    verifySupabaseBtn.addEventListener('click', async () => {
      const url = document.getElementById('settings-supabase-url').value.trim();
      const anonKey = document.getElementById('settings-supabase-key').value.trim();

      if (!url || !anonKey) {
        alert("Please fill in both Supabase URL and Anon Key.");
        return;
      }

      // Save to localStorage so configuration loads
      localStorage.setItem('gold_studio_supabase_url', url);
      localStorage.setItem('gold_studio_supabase_anon_key', anonKey);
      
      resetSupabaseClient(); // force recreation of client

      const supabase = getSupabaseClient();
      if (!supabase) {
        alert("Failed to initialize Supabase client. Make sure the CDN script is loaded.");
        return;
      }

      verifySupabaseBtn.innerText = "Testing Connection...";
      verifySupabaseBtn.disabled = true;

      try {
        // Test query on 'portfolio' table to verify credentials and tables existence
        const { data, error } = await supabase.from('portfolio').select('id').limit(1);

        if (error) {
          console.error("Test query error:", error);
          if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
            alert("Connection successful, but the 'portfolio' database table was not found!\n\nPlease make sure to execute the SQL Database Schema script inside your Supabase SQL Editor first.");
          } else if (error.status === 401 || error.message.includes('JWT') || error.message.includes('Invalid API key') || error.message.includes('Invalid key')) {
            alert("Connection failed: Invalid Supabase Anon API key or URL. Please verify your credentials.");
            localStorage.removeItem('gold_studio_supabase_url');
            localStorage.removeItem('gold_studio_supabase_anon_key');
            resetSupabaseClient();
          } else {
            alert(`Connected with warning: Query failed. Error: ${error.message}`);
          }
        } else {
          // Connection is fully working! Now run sync
          const synced = await db.syncToSupabase();
          if (synced) {
            alert("Successfully connected to Supabase and synchronized default mockup tables!");
          } else {
            alert("Successfully connected to Supabase! (Database tables already initialized).");
          }
        }
        renderAdminDashboard(appInstance);
      } catch (err) {
        console.error("Connection verification exception:", err);
        alert(`Failed to connect. Network error or invalid URL format. Error details: ${err.message || err}`);
        localStorage.removeItem('gold_studio_supabase_url');
        localStorage.removeItem('gold_studio_supabase_anon_key');
        resetSupabaseClient();
        renderAdminDashboard(appInstance);
      } finally {
        verifySupabaseBtn.innerText = "Connect & Sync Data";
        verifySupabaseBtn.disabled = false;
      }
    });
  }

  // Disconnect Supabase and return to local storage caching mode
  if (disconnectSupabaseBtn) {
    disconnectSupabaseBtn.addEventListener('click', () => {
      if (confirm("Disconnect live database? Website will fall back to local browser cache.")) {
        localStorage.removeItem('gold_studio_supabase_url');
        localStorage.removeItem('gold_studio_supabase_anon_key');
        resetSupabaseClient();
        alert("Supabase disconnected.");
        renderAdminDashboard(appInstance);
      }
    });
  }
}

function bindTestimonialActions(testimonialsList) {
  const addBtn = document.getElementById('btn-admin-add-testimonial');
  const modal = document.getElementById('admin-testimonial-modal');
  const form = document.getElementById('admin-testimonial-form');
  const tbody = document.getElementById('admin-testimonials-tbody');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('form-testimonial-preview').src = 'assets/avatar_default.jpg';
      modal.classList.add('active');
    });
  }

  // Handle client photo file upload to Cloudinary
  const fileInput = document.getElementById('testimonial-file-input');
  const urlInput = document.getElementById('form-testimonial-image-url');

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const dropzone = fileInput.closest('.file-dropzone');
      const textNode = dropzone.querySelector('.dropzone-text');
      textNode.innerHTML = `Uploading <strong>${file.name}</strong>...`;

      try {
        const publicUrl = await db.uploadMedia(file, 'testimonials');
        urlInput.value = publicUrl;
        document.getElementById('form-testimonial-preview').src = publicUrl;
        textNode.innerHTML = `Uploaded <strong>${file.name}</strong> successfully!`;
      } catch (err) {
        console.error("Testimonial image upload error:", err);
        alert("Failed to upload testimonial photo: " + err.message);
        textNode.innerHTML = `Upload failed: ${err.message || 'Error'}`;
      }
    });
  }

  // Submit new review
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      const ratingVal = parseInt(formData.get('rating')) || 5;
      const imageUrlVal = formData.get('image_url') || 'assets/avatar_default.jpg';

      const newTestimonial = {
        name: formData.get('name'),
        role: formData.get('role'),
        rating: ratingVal,
        review: formData.get('review'),
        image_url: imageUrlVal
      };

      try {
        await db.insert('testimonials', newTestimonial);
        modal.classList.remove('active');
        renderAdminDashboard(appInstance);
      } catch (err) {
        console.error("Testimonial save error:", err);
        alert("Failed to save testimonial: " + err.message);
      }
    });
  }

  // Bind table delete clicks
  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.btn-delete-testimonial');
      if (!deleteBtn) return;
      const row = e.target.closest('tr');
      const id = row.getAttribute('data-testimonial-id');
      if (confirm("Delete this review?")) {
        await db.delete('testimonials', id);
        renderAdminDashboard(appInstance);
      }
    });
  }
}
