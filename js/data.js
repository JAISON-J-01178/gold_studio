// js/data.js
import { getSupabaseClient, isSupabaseConnected } from './supabase-config.js';

// Default configuration & mock data
export const defaultData = {
  settings: {
    studio_name: "Gold Studio",
    tagline: "Capturing Golden Moments, Framing Eternal Stories",
    logo_url: "assets/gold_studio_logo.jpg",
    favicon_url: "assets/gold_studio_logo.jpg",
    phone_number: "+1 (555) 777-8888",
    email_address: "contact@goldstudio.com",
    business_hours: "Monday - Saturday: 9:00 AM - 7:00 PM, Sunday: Closed",
    whatsapp_number: "15557778888",
    whatsapp_default_message: "Hello Gold Studio, I would like to enquire about your photography services.",
    google_maps_embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.142293784029!2d-73.98731968459367!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1022!2i768!4f13.1!3m3!1m2!1s0x89c25855c1054fdb%3A0x8672f18413126ec5!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus",
    google_maps_directions: "https://maps.google.com/?q=Times+Square,+New+York,+NY",
    instagram_link: "https://instagram.com/goldstudio",
    facebook_link: "https://facebook.com/goldstudio",
    youtube_link: "https://youtube.com/goldstudio",
    twitter_link: "https://twitter.com/goldstudio",
    seo_title: "Gold Studio | Premium Luxury Photography & Cinematic Videography",
    seo_description: "Gold Studio delivers fine-art photography and cinematic videography for weddings, fashion, corporate events, and travel worldwide. Experience premium, luxury service.",
    seo_keywords: "luxury photography, wedding photography, fashion shoot, corporate videography, fine-art photographer, Gold Studio"
  },
  services: [
    {
      id: "srv-1",
      title: "Wedding & Pre-Wedding Photography",
      description: "Fine-art coverage of your special day. Capturing raw emotions, candid moments, and the grand aesthetics of love. Includes drone coverage and a premium handcrafted physical album.",
      duration: "Full Day (8-12 hours)",
      price: "$2,999",
      deliverables: "500+ Edited High-Res Photos, 2 Premium Albums, Online Gallery Access",
      image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "srv-2",
      title: "Cinematic Videography & Films",
      description: "High-definition filmmaking that tells your wedding or corporate event story like a movie. Multi-camera setup, direction, high-quality audio recording, and professional editing.",
      duration: "Full Day / Project Based",
      price: "$3,499",
      deliverables: "3-Minute Cinematic Trailer, 45-Minute Documentary Film, Raw Footage",
      image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "srv-3",
      title: "Fashion & Editorial Portraits",
      description: "Creative styling, studio lighting, and high-fashion editing for agencies, models, and personal branding. Ideal for magazines, lookbooks, and high-profile portfolios.",
      duration: "4 Hours",
      price: "$899",
      deliverables: "30 Fully Retouched Images, Outfit Changes, Professional Studio Hire",
      image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "srv-4",
      title: "Commercial & Product Photography",
      description: "Sleek, high-resolution product photography optimized for e-commerce, advertising campaigns, and social media branding. Elevate your brand identity.",
      duration: "Per Day / Project Based",
      price: "$1,200",
      deliverables: "50 Product Images, White Background & Lifestyle Layouts, Commercial License",
      image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
    }
  ],
  packages: [
    {
      id: "pkg-1",
      title: "Silver Package",
      badge: "Essential",
      price: "$1,499",
      features: [
        "1 Senior Photographer",
        "6 Hours Event Coverage",
        "200+ Edited High-Res Photos",
        "Private Digital Web Gallery",
        "Delivery within 4 Weeks",
        "Optional Hardcopy Album (+$150)"
      ]
    },
    {
      id: "pkg-2",
      title: "Gold Package",
      badge: "Most Popular",
      price: "$2,799",
      featured: true,
      features: [
        "2 Senior Photographers",
        "1 Cinematic Videographer",
        "10 Hours Event Coverage",
        "400+ Edited Photos & 3-Min Trailer",
        "1 Luxury Handcrafted Leather Album",
        "Drone/Aerial Coverage (1 Hour)",
        "Delivery within 3 Weeks"
      ]
    },
    {
      id: "pkg-3",
      title: "Premium Package",
      badge: "Luxury Cinematic",
      price: "$4,499",
      features: [
        "2 Lead Photographers + 2 Videographers",
        "Full Day Coverage (Unlimited Hours)",
        "600+ Retouched Photos & 30-Min Film",
        "2 Luxury Parent Albums + 1 Master Album",
        "Full Drone Coverage & Same-day Edit",
        "Complimentary Pre-Wedding Shoot",
        "Express Delivery (10 Days)"
      ]
    }
  ],
  portfolio: [
    {
      id: "pt-1",
      category: "Wedding",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      title: "Elegance in White",
      description: "A gorgeous luxury outdoor wedding shot capturing the bride and groom during sunset.",
      is_featured: true
    },
    {
      id: "pt-2",
      category: "Cinematic Videography",
      media_type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-outside-40019-large.mp4",
      title: "Golden Hour Stroll",
      description: "A cinematic slow-motion drone video tracking the couple in a majestic estate garden.",
      is_featured: true
    },
    {
      id: "pt-3",
      category: "Pre-Wedding",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      title: "Whispers of Love",
      description: "Scenic pre-wedding engagement session captured on a misty mountain overlook.",
      is_featured: false
    },
    {
      id: "pt-4",
      category: "Fashion",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      title: "High Contrast Vogue",
      description: "Studio editorial photography showcasing high-end fashion lines with sharp lighting.",
      is_featured: true
    },
    {
      id: "pt-5",
      category: "Product Photography",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      title: "Minimalist Craftsmanship",
      description: "Premium watch photography highlighting textures, metals, and fine dials.",
      is_featured: false
    },
    {
      id: "pt-6",
      category: "Food Photography",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      title: "Rustic Gastronomy",
      description: "Artistic food staging capturing delicious colors and culinary details.",
      is_featured: false
    },
    {
      id: "pt-7",
      category: "Maternity",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1551201602-3f9456f0fbd8?auto=format&fit=crop&w=800&q=80",
      title: "Waiting for Gold",
      description: "Maternity photoshoot celebrating the pure beauty and emotion of motherhood.",
      is_featured: false
    },
    {
      id: "pt-8",
      category: "Baby Shoot",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      title: "Dreamy Slumber",
      description: "Candid newborn baby shoot utilizing soft lighting and organic fabrics.",
      is_featured: false
    },
    {
      id: "pt-9",
      category: "Corporate Events",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
      title: "Global Summit Keynote",
      description: "Professional capture of high-profile corporate guest speakers and stage design.",
      is_featured: false
    },
    {
      id: "pt-10",
      category: "Travel",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
      title: "Canyon Reflections",
      description: "Adventure landscape photograph capturing the deep geological lines of canyons.",
      is_featured: false
    },
    {
      id: "pt-11",
      category: "Cinematic Videography",
      media_type: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-holding-hands-of-a-couple-under-the-sun-41804-large.mp4",
      title: "Eternal Promise",
      description: "Romantic video capturing detail shots of ring exchange and holding hands in golden sunlight.",
      is_featured: false
    },
    {
      id: "pt-12",
      category: "Nature",
      media_type: "image",
      url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80",
      title: "Mist in the Canopy",
      description: "Lush landscape photograph showcasing majestic old trees standing tall in the forest.",
      is_featured: false
    }
  ],
  testimonials: [
    {
      id: "tst-1",
      name: "Sophia & Daniel",
      role: "Bride & Groom",
      rating: 5,
      review: "Gold Studio captured our wedding with unmatched elegance. The final cinematic film felt like an absolute Hollywood movie! Highly recommend the Gold Package.",
      image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "tst-2",
      name: "Marcus Aurelius",
      role: "Creative Director, V-Line",
      rating: 5,
      review: "Stunning work on our commercial lookbook. Their command of shadows, studio lighting, and color grading is remarkable. Looking forward to our next collaboration.",
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "tst-3",
      name: "Isabella Cruz",
      role: "Maternity Client",
      rating: 5,
      review: "The baby and maternity shoot was handled with extreme care and patience. Every single frame looks natural, glowing, and incredibly premium.",
      image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
    }
  ],
  blogs: [
    {
      id: "blg-1",
      title: "Top 10 Tips for Planning Your Dream Wedding Photoshoot",
      excerpt: "Your wedding day goes by in a flash. Here is how to prepare so your photographer can capture the ultimate timeless shots.",
      content: "<p>Your wedding day is one of the most memorable milestones of your life. However, planning a successful shoot requires careful preparation and coordination.</p><h3>1. Define Your Aesthetic</h3><p>Work with your photographer to establish the overall look: do you prefer classic, documentary-style, moody, or bright and airy photography? Share a mood board ahead of time.</p><h3>2. Draft a Shot List</h3><p>Provide a detailed timeline and structural list of family dynamics to ensure no key portraits are missed during the reception rushes.</p><h3>3. The Golden Hour Advantage</h3><p>Make sure to reserve 30-45 minutes around sunset for creative couple portraits. The soft, warm, directional lighting during this hour is unmatched and yields spectacular cinematic portraits.</p>",
      cover_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      category: "Wedding Planning",
      author: "Gold Studio Team",
      created_at: "2026-06-25T10:00:00.000Z"
    },
    {
      id: "blg-2",
      title: "Behind the Lens: Elevating Fashion Staging and Lighting Tones",
      excerpt: "A deep dive into how our studio directs model positioning, high-fashion styling, and custom modifiers to capture premium portraits.",
      content: "<p>Capturing editorial fashion portraits requires a delicate balance of gear, styling, and model direction. Here is a brief look into our workflow at Gold Studio.</p><h3>1. Master the Key Light</h3><p>Using a large octabox softbox creates a soft falloff on the face while highlighting textures and design elements of the clothing. We combine this with negative fill to sculpt deep, rich shadows.</p><h3>2. Color Theory in Editing</h3><p>We approach grading with cinematic aesthetics. Deepening shadows with dark blues or teals, while keeping skin tones warm and golden, results in high-contrast editorial lookbooks that look extremely premium.</p>",
      cover_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      category: "Behind the Scenes",
      author: "Lead Photographer",
      created_at: "2026-07-01T15:30:00.000Z"
    }
  ],
  bookings: [
    {
      id: "bk-1",
      event_type: "Wedding",
      date: "2026-08-20",
      location: "Grand Palace Hotel, NY",
      package: "Gold Package",
      budget: "$2,800",
      guests: 150,
      name: "Emma Watson",
      email: "emma@example.com",
      phone: "+1 (555) 234-5678",
      requirements: "Would love additional drone coverage and sunset portraits on the rooftop terrace.",
      status: "pending",
      created_at: "2026-07-06T12:00:00.000Z"
    }
  ],
  enquiries: [
    {
      id: "enq-1",
      name: "Alexander Mercer",
      email: "alex@example.com",
      phone: "+1 (555) 987-6543",
      message: "Hi, do you offer customized packaging for multi-day corporate retreats? Looking forward to hearing from you.",
      created_at: "2026-07-05T09:00:00.000Z"
    }
  ]
};

// Database interface class
class Database {
  constructor() {
    this.init();
  }

  init() {
    // If not present in localStorage, initialize with default data
    if (!localStorage.getItem('gold_studio_initialized')) {
      localStorage.setItem('gold_studio_settings', JSON.stringify(defaultData.settings));
      localStorage.setItem('gold_studio_services', JSON.stringify(defaultData.services));
      localStorage.setItem('gold_studio_packages', JSON.stringify(defaultData.packages));
      localStorage.setItem('gold_studio_portfolio', JSON.stringify(defaultData.portfolio));
      localStorage.setItem('gold_studio_testimonials', JSON.stringify(defaultData.testimonials));
      localStorage.setItem('gold_studio_blogs', JSON.stringify(defaultData.blogs));
      localStorage.setItem('gold_studio_bookings', JSON.stringify(defaultData.bookings));
      localStorage.setItem('gold_studio_enquiries', JSON.stringify(defaultData.enquiries));
      localStorage.setItem('gold_studio_initialized', 'true');
      console.log("Local Database initialized with mock data.");
    }
  }

  // Unified READ operation
  async get(table) {
    if (isSupabaseConnected()) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) return data;
      console.error(`Supabase fetch error on [${table}]:`, error);
    }
    // LocalStorage Fallback
    const localData = localStorage.getItem(`gold_studio_${table}`);
    return localData ? JSON.parse(localData) : [];
  }

  // Unified INSERT operation
  async insert(table, record) {
    const newRecord = {
      id: record.id || `rec-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...record
    };

    if (isSupabaseConnected()) {
      const supabase = getSupabaseClient();
      // Remove local client-side temporary string IDs if inserting to Supabase (let DB handle UUID)
      const dbRecord = { ...newRecord };
      if (dbRecord.id.startsWith('rec-') || dbRecord.id.startsWith('bk-') || dbRecord.id.startsWith('pt-') || dbRecord.id.startsWith('srv-') || dbRecord.id.startsWith('blg-') || dbRecord.id.startsWith('tst-') || dbRecord.id.startsWith('enq-')) {
        delete dbRecord.id;
      }
      const { data, error } = await supabase
        .from(table)
        .insert([dbRecord])
        .select();

      if (error) {
        console.error(`Supabase insert error on [${table}]:`, error);
        throw new Error(error.message || `Insert failed on table ${table}`);
      }
      if (data && data.length > 0) return data[0];
    } else {
      // LocalStorage Fallback
      const list = await this.get(table);
      list.unshift(newRecord);
      localStorage.setItem(`gold_studio_${table}`, JSON.stringify(list));
      return newRecord;
    }
  }

  // Unified UPDATE operation
  async update(table, id, updates) {
    if (isSupabaseConnected()) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error(`Supabase update error on [${table}]:`, error);
        throw new Error(error.message || `Update failed on table ${table}`);
      }
      if (data && data.length > 0) return data[0];
    } else {
      // LocalStorage Fallback
      const list = await this.get(table);
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updates };
        localStorage.setItem(`gold_studio_${table}`, JSON.stringify(list));
        return list[index];
      }
    }
    return null;
  }

  // Unified DELETE operation
  async delete(table, id) {
    if (isSupabaseConnected()) {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Supabase delete error on [${table}]:`, error);
        throw new Error(error.message || `Delete failed on table ${table}`);
      }
      return true;
    } else {
      // LocalStorage Fallback
      const list = await this.get(table);
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(`gold_studio_${table}`, JSON.stringify(filtered));
      return true;
    }
  }

  // Settings specific helpers
  async getSettings() {
    if (isSupabaseConnected()) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('settings')
        .select('*');
      
      if (!error && data && data.length > 0) {
        // Map table array [{key: 'phone', value: '123'}] to config object
        const settingsObj = {};
        data.forEach(item => {
          settingsObj[item.key] = item.value;
        });
        // Check if all settings exist, fallback for newly added ones
        return { ...defaultData.settings, ...settingsObj };
      }
      console.warn("Supabase Settings fetch empty or errored, falling back to local/default.", error);
    }

    // LocalStorage Fallback
    const localSettings = localStorage.getItem('gold_studio_settings');
    return localSettings ? { ...defaultData.settings, ...JSON.parse(localSettings) } : defaultData.settings;
  }

  async saveSettings(settingsObj) {
    // Save to local storage cache immediately
    localStorage.setItem('gold_studio_settings', JSON.stringify(settingsObj));

    if (isSupabaseConnected()) {
      const supabase = getSupabaseClient();
      // Settings in Supabase are stored as key-value pairs to prevent single-row lockups
      const promises = Object.keys(settingsObj).map(key => {
        return supabase
          .from('settings')
          .upsert({ key: key, value: settingsObj[key] });
      });
      try {
        await Promise.all(promises);
        console.log("Settings synchronized to Supabase.");
      } catch (e) {
        console.error("Failed to sync settings to Supabase:", e);
      }
    }
    return settingsObj;
  }

  /**
   * Syncs local storage mockup data to Supabase database.
   * Creates tables and populates entries.
   */
  async syncToSupabase() {
    if (!isSupabaseConnected()) return false;
    try {
      console.log("Starting full database synchronization to Supabase...");
      
      // Sync settings
      const settings = await this.getSettings();
      await this.saveSettings(settings);

      // Helper function to sync table content
      const syncTable = async (table) => {
        const localList = JSON.parse(localStorage.getItem(`gold_studio_${table}`) || '[]');
        if (localList.length === 0) return;

        const supabase = getSupabaseClient();
        
        // Clean IDs for Supabase
        const cleanList = localList.map(item => {
          const cleanItem = { ...item };
          if (typeof cleanItem.id === 'string' && (cleanItem.id.startsWith('rec-') || cleanItem.id.startsWith('bk-') || cleanItem.id.startsWith('pt-') || cleanItem.id.startsWith('srv-') || cleanItem.id.startsWith('blg-') || cleanItem.id.startsWith('tst-') || cleanItem.id.startsWith('enq-'))) {
            delete cleanItem.id;
          }
          return cleanItem;
        });

        // Insert in batches
        const { error } = await supabase.from(table).insert(cleanList);
        if (error) console.error(`Error syncing table ${table}:`, error);
      };

      await syncTable('services');
      await syncTable('portfolio');
      await syncTable('testimonials');
      await syncTable('blogs');
      await syncTable('bookings');
      await syncTable('enquiries');

      console.log("Supabase database synchronization completed successfully!");
      return true;
    } catch (e) {
      console.error("Supabase sync failed:", e);
      return false;
    }
  }

  /**
   * Handles media file uploads to Supabase Storage.
   */
  async uploadMedia(file, bucket = 'gold-studio-media') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = fileName; // Upload directly to bucket root

    if (isSupabaseConnected()) {
      const supabase = getSupabaseClient();
      const { error } = await supabase.storage.from(bucket).upload(filePath, file);

      if (error) {
        console.error("Supabase Storage upload error:", error);
        throw error;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    }

    // Fallback: Read as base64 data URL for local storage mockup
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

export const db = new Database();
