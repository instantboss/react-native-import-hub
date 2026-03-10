import axios from 'axios';
import { getAuthToken, removeAuthToken } from './auth';
import { cachedFetch, CACHE_DURATION, clearAllCache } from './cache';

// Xano API base URLs (Workspace 2 - Small Shop Social)
const API_BASE_URL = 'https://xh7e-whge-ciff.n7d.xano.io/api:F0OEMErP';
const MAGIC_LINK_API_URL = 'https://xh7e-whge-ciff.n7d.xano.io/api:x4ocgg3f';

const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
const magicLinkApi = axios.create({ baseURL: MAGIC_LINK_API_URL, headers: { 'Content-Type': 'application/json' } });

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      clearAllCache();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Image URL helper
// ==========================================
export function resolveImageUrl(img: { url?: string; path?: string } | null | undefined): string {
  if (!img) return '';
  if (img.path && img.path.startsWith('https://')) return img.path;
  if (img.url) {
    const doubleHttps = img.url.indexOf('https://', 8);
    if (doubleHttps > 0) return img.url.substring(doubleHttps);
  }
  return img.url || '';
}

// ==========================================
// Types
// ==========================================
export interface UserProfileImage { url?: string; path?: string; }

export interface UserProfile {
  id: number;
  created_at: number;
  first_name: string;
  last_name: string;
  email: string;
  active: boolean;
  profile_image?: UserProfileImage | null;
  logo?: UserProfileImage | null;
  background_image?: UserProfileImage | null;
  phone_number?: string;
  website?: string;
  hex_codes?: string;
  business_name?: string;
  products_sold?: string;
  target_customer?: string;
  bio?: string;
  base_member?: boolean;
  trial_member?: boolean;
  free_member?: boolean;
  admin?: boolean;
  super_admin?: boolean;
  ai_access_only?: boolean;
  subscription_expiration_date?: string;
  approved_wholesaler?: boolean;
}

export interface DailyContentImage { url?: string; path?: string; }

export interface DailyContent {
  id: number;
  date?: string;
  content_date?: string;
  created_at?: number;
  images?: DailyContentImage[];
  image_1?: { url: string; path?: string };
  image_2?: { url: string; path?: string };
  image_3?: { url: string; path?: string };
  engagement_images?: (string | { url?: string; path?: string })[];
  hashtags?: string;
  caption?: string;
  holiday?: string;
  morning_post?: string;
  afternoon_post?: string;
  evening_post?: string;
  extra_tasks?: string;
  posting_schedule?: string;
  business_tips?: string;
  morning_places_text?: string;
  afternoon_places_text?: string;
  evening_places_text?: string;
}

export interface NavItem {
  id: number;
  name: string;
  icon?: string | { url?: string } | null;
  image?: UserProfileImage | null;
  show_trial?: boolean;
  show_basic?: boolean;
  sort_order?: number;
  order?: number;
  link?: string;
}

export interface Notification {
  id: number;
  created_at: number;
  title: string;
  body: string;
  message?: string;
  type?: string;
  link?: string;
  is_read?: boolean;
  all_users: boolean;
  user_id_recipient: number;
  user_id_read: number[];
}

export interface NotificationsResponse {
  items: Notification[];
  curPage: number;
  nextPage: number | null;
  itemsTotal: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  curPage: number;
  nextPage: number | null;
  itemsTotal: number;
}

export interface ContentItem {
  id: number;
  created_at?: number;
  name?: string;
  title?: string;
  description?: string;
  image?: UserProfileImage | null;
  image_url?: string;
  thumbnail?: string;
  link?: string;
  file?: { url: string; size: number; name?: string; mime?: string };
  video?: { url: string; size?: number };
  sort_order?: number;
}

export interface Mentor {
  id: number;
  name: string;
  title?: string;
  bio?: string;
  image?: UserProfileImage | null;
  website?: string;
  instagram?: string;
  sort_order?: number;
}

export interface Lesson {
  id: number;
  name: string;
  title?: string;
  description?: string;
  image?: UserProfileImage | null;
  thumbnail?: UserProfileImage | null;
  youtube_url?: string;
  video_url?: string;
  video?: { url: string };
  duration?: string;
  sort_order?: number;
  mentor_id?: number;
  trial?: boolean;
  _mentor?: { id: number; name: string; image?: { url: string } };
}

export interface ShoppingListItem {
  id: number;
  name?: string;
  description?: string;
  sort_order?: number;
  image?: string | { url?: string };
  link?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  sort_order?: number;
}

export type ExtraPdf = ContentItem;
export type Template = ContentItem;
export type Printable = ContentItem;
export type BuyGuide = ContentItem;
export type Preset = ContentItem;
export type ExtraGraphic = ContentItem;
export type ExtraVideo = ContentItem;

// ==========================================
// Auth APIs
// ==========================================
export interface MagicLinkResponse { success: boolean; message: string; }
export interface MagicLoginResponse { authToken: string; user: { id: number; email: string; first_name: string; last_name: string; }; }

export async function requestMagicLink(email: string): Promise<MagicLinkResponse> {
  const response = await magicLinkApi.get('/auth/magic-link', { params: { email } });
  return response.data;
}

export async function verifyMagicLink(email: string, code: string): Promise<MagicLoginResponse> {
  const response = await magicLinkApi.post('/auth/magic-login', { email, code });
  return response.data;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await api.get('/auth/me');
  return response.data;
}

// ==========================================
// User Profile APIs
// ==========================================
export interface ProfileUpdateData {
  first_name?: string; last_name?: string; phone_number?: string;
  website?: string; hex_codes?: string; business_name?: string;
  products_sold?: string; target_customer?: string; bio?: string;
}

export async function updateProfile(data: ProfileUpdateData) {
  const response = await api.patch('/user/profile', data);
  return response.data;
}

export async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/user/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// ==========================================
// Notifications
// ==========================================
export async function getNotificationCount(): Promise<{ unread_count: number }> {
  const response = await api.get('/notifications/count');
  return response.data;
}

export async function fetchNotifications(perPage = 20, page = 1): Promise<NotificationsResponse> {
  return cachedFetch(`notifications_${perPage}_${page}`, async () => {
    const response = await api.get('/notifications', { params: { per_page: perPage, page } });
    return response.data;
  }, CACHE_DURATION.SHORT);
}

export async function markNotificationRead(id: number) {
  return api.post(`/user/notifications/mark-read`, { notification_id: id });
}

export async function markAllNotificationsRead() {
  return api.post('/user/notifications/mark-all-read');
}

// ==========================================
// Navigation
// ==========================================
export async function fetchNavContent(onUpdate?: (data: NavItem[]) => void): Promise<NavItem[]> {
  return cachedFetch('nav_content', async () => {
    const response = await api.get('/nav_content');
    return response.data;
  }, CACHE_DURATION.LONG, onUpdate);
}

// ==========================================
// Daily Content
// ==========================================
function normalizeDailyContent(data: any): DailyContent {
  const images: DailyContentImage[] = [];
  const imageFields = ['image_1', 'image_2', 'image_3'];
  for (const field of imageFields) {
    const img = data[field];
    if (img) {
      if (typeof img === 'string') images.push({ url: img });
      else if (img.url || img.path) images.push({ url: resolveImageUrl(img), path: img.path });
    }
  }

  return {
    ...data,
    ...(data.image_1?.url ? { image_1: { ...data.image_1, url: resolveImageUrl(data.image_1) } } : {}),
    ...(data.image_2?.url ? { image_2: { ...data.image_2, url: resolveImageUrl(data.image_2) } } : {}),
    ...(data.image_3?.url ? { image_3: { ...data.image_3, url: resolveImageUrl(data.image_3) } } : {}),
    date: data.date || data.Date || data.content_date || undefined,
    images: images.length > 0 ? images : undefined,
    hashtags: data.hashtags || data.Hashtags || '',
    caption: data.caption || data.Caption || '',
    holiday: data.holiday || data.Holiday || '',
    extra_tasks: data.business_tips || data.Business_Tips || data.extra_tasks || '',
  };
}

export async function fetchDailyContentToday(onUpdate?: (data: DailyContent) => void): Promise<DailyContent> {
  return cachedFetch('daily_content_today', async () => {
    const response = await api.get('/daily_content_today');
    let data = response.data;
    if (Array.isArray(data)) data = data[0] || {};
    return normalizeDailyContent(data);
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

export async function fetchDailyContent31(onUpdate?: (data: DailyContent[]) => void): Promise<DailyContent[]> {
  return cachedFetch('daily_content_31', async () => {
    const response = await api.get('/daily_content_31');
    let data = response.data;
    if (!Array.isArray(data)) data = data?.items || [];
    return data.map((item: any) => normalizeDailyContent(item));
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

export async function fetchAllDailyContent(onUpdate?: (data: DailyContent[]) => void): Promise<DailyContent[]> {
  return cachedFetch('daily_content_all', async () => {
    const response = await api.get('/daily_content_all');
    let data = response.data;
    if (!Array.isArray(data)) data = data?.items || [];
    return data.map((item: any) => normalizeDailyContent(item));
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

// ==========================================
// Content Libraries (all follow same pattern)
// ==========================================
async function fetchPaginatedContent<T>(
  endpoint: string, cacheKey: string, perPage: number, page: number,
  onUpdate?: (data: T[]) => void
): Promise<T[]> {
  return cachedFetch(`${cacheKey}_${perPage}_${page}`, async () => {
    const response = await api.get(endpoint, { params: { per_page: perPage, page } });
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

export const fetchTemplates = (limit = 50, page = 0, onUpdate?: (d: Template[]) => void) =>
  fetchPaginatedContent<Template>('/templates', 'templates', limit, page, onUpdate);

export const fetchPrintables = (perPage = 50, page = 0, onUpdate?: (d: Printable[]) => void) =>
  fetchPaginatedContent<Printable>('/printables', 'printables', perPage, page, onUpdate);

export const fetchBuyGuides = (perPage = 50, page = 0, onUpdate?: (d: BuyGuide[]) => void) =>
  fetchPaginatedContent<BuyGuide>('/buy_guides', 'buy_guides', perPage, page, onUpdate);

export const fetchPresets = (limit = 50, offset = 0, onUpdate?: (d: Preset[]) => void) =>
  fetchPaginatedContent<Preset>('/presets', 'presets', limit, offset, onUpdate);

export const fetchExtraPdfs = (perPage = 50, page = 0, onUpdate?: (d: ExtraPdf[]) => void) =>
  fetchPaginatedContent<ExtraPdf>('/pdfs', 'extra_pdfs', perPage, page, onUpdate);

export const fetchExtraGraphics = (onUpdate?: (d: ExtraGraphic[]) => void) =>
  fetchPaginatedContent<ExtraGraphic>('/extra_graphics', 'extra_graphics', 100, 0, onUpdate);

export const fetchExtraVideos = (onUpdate?: (d: ExtraVideo[]) => void) =>
  fetchPaginatedContent<ExtraVideo>('/extra_videos', 'extra_videos', 100, 0, onUpdate);

// ==========================================
// Mentors Nav (Mentors Lounge hub)
// ==========================================
export interface MentorNavItem {
  id: number;
  name: string;
  icon?: string | { url?: string } | null;
  sort_order: number;
}

export async function fetchMentorsNav(): Promise<MentorNavItem[]> {
  return cachedFetch('mentors_nav', async () => {
    const response = await api.get('/mentors_lounge_nav');
    const items = response.data || [];
    return items.sort((a: MentorNavItem, b: MentorNavItem) => a.sort_order - b.sort_order);
  }, CACHE_DURATION.LONG);
}

// ==========================================
// Mentors
// ==========================================
export async function fetchMentors(perPage = 50, page = 0, onUpdate?: (d: Mentor[]) => void): Promise<Mentor[]> {
  return cachedFetch(`mentors_${perPage}_${page}`, async () => {
    const response = await api.get('/mentor', { params: { per_page: perPage, page } });
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

export async function fetchMentorDetail(id: number): Promise<Mentor> {
  const response = await api.get(`/mentor/${id}`);
  return response.data;
}

export async function fetchPodcasts(onUpdate?: (d: ContentItem[]) => void): Promise<ContentItem[]> {
  return cachedFetch('podcasts', async () => {
    const response = await api.get('/mentors_podcast');
    const data = response.data;
    const items = Array.isArray(data) ? data : data?.items || [];
    return items.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

export async function fetchToolbox(onUpdate?: (d: ContentItem[]) => void): Promise<ContentItem[]> {
  return cachedFetch('toolbox', async () => {
    const response = await api.get('/mentors_toolbox');
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

export async function fetchMentorExtras(onUpdate?: (d: ContentItem[]) => void): Promise<ContentItem[]> {
  return cachedFetch('mentor_extras', async () => {
    const response = await api.get('/mentor_extra');
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

export async function fetchQAItems(onUpdate?: (d: ContentItem[]) => void): Promise<ContentItem[]> {
  return cachedFetch('qa_items', async () => {
    const response = await api.get('/qa_items');
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

// ==========================================
// Lessons
// ==========================================
export async function fetchLessons(limit = 50, page = 0, onUpdate?: (d: Lesson[]) => void): Promise<Lesson[]> {
  return cachedFetch(`lessons_${limit}_${page}`, async () => {
    const response = await api.get('/lesson', { params: { per_page: limit, page } });
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

export async function fetchLessonDetail(id: number): Promise<Lesson> {
  const response = await api.get(`/lesson/${id}`);
  return response.data;
}

// ==========================================
// News
// ==========================================
export async function fetchNews(perPage = 50, page = 0, onUpdate?: (d: ContentItem[]) => void): Promise<ContentItem[]> {
  return cachedFetch(`news_${perPage}_${page}`, async () => {
    const response = await api.get('/news', { params: { per_page: perPage, page } });
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

// ==========================================
// Shopping List
// ==========================================
export async function fetchShoppingList(search?: string, perPage = 100): Promise<ShoppingListItem[]> {
  return cachedFetch(`shopping_list_${search || 'all'}`, async () => {
    const response = await api.get('/shopping_list_items', {
      params: { per_page: perPage, ...(search ? { search } : {}) },
    });
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM);
}

// ==========================================
// FAQs
// ==========================================
export async function fetchFAQs(perPage = 50, page = 0): Promise<FAQ[]> {
  return cachedFetch('faqs', async () => {
    const response = await api.get('/faqs', { params: { per_page: perPage, page } });
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.LONG);
}

// ==========================================
// Support
// ==========================================
export async function submitSupportRequest(data: { subject: string; message: string; category?: string }) {
  const response = await api.post('/support_request', data);
  return response.data;
}

// ==========================================
// User Images
// ==========================================
export async function fetchUserImages(perPage = 50, page = 0): Promise<ContentItem[]> {
  return cachedFetch(`images_user_${perPage}_${page}`, async () => {
    const response = await api.get('/images_user', { params: { per_page: perPage, page } });
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM);
}

// ==========================================
// Groups
// ==========================================
export async function fetchGroups(onUpdate?: (d: ContentItem[]) => void): Promise<ContentItem[]> {
  return cachedFetch('groups', async () => {
    const response = await api.get('/groups');
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

// ==========================================
// Product Names
// ==========================================
export async function fetchProductNames(onUpdate?: (d: ContentItem[]) => void): Promise<ContentItem[]> {
  return cachedFetch('product_names', async () => {
    const response = await api.get('/product_name');
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

// ==========================================
// Vendors
// ==========================================
export async function fetchVendors(onUpdate?: (d: ContentItem[]) => void): Promise<ContentItem[]> {
  return cachedFetch('vendors', async () => {
    const response = await api.get('/vendors');
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM, onUpdate);
}

// ==========================================
// Announcements
// ==========================================
export interface Announcement {
  id?: number;
  heading?: string;
  description?: string;
  label?: string;
  button_text?: string;
  button_link?: string;
  message?: string;
  active?: boolean;
  image?: UserProfileImage | null;
}

export async function fetchCurrentAnnouncement(): Promise<Announcement | null> {
  try {
    const response = await api.get('/announcements/current');
    return response.data;
  } catch {
    return null;
  }
}

// ==========================================
// Ask Mentor
// ==========================================
export async function fetchAskMentorItems(): Promise<ContentItem[]> {
  return cachedFetch('ask_mentor', async () => {
    const response = await api.get('/ask_mentor');
    const data = response.data;
    return Array.isArray(data) ? data : data?.items || [];
  }, CACHE_DURATION.MEDIUM);
}

export async function submitMentorQuestion(data: { question: string }) {
  const response = await api.post('/ask_mentor', data);
  return response.data;
}

// ==========================================
// User Generated Images (composited images)
// ==========================================
export interface UserGeneratedImage {
  id: number;
  user_id: number;
  date: string;
  name?: string;
  image: string; // Cloudflare R2 URL
  daily_content_id?: number;
  content_image_number?: number;
}

const PLACEHOLDER_USER_ID = 29;

export async function fetchUserGeneratedImages(
  userId: number,
  startDate?: string,
  endDate?: string,
  limit = 50,
  offset = 0,
): Promise<{ items: UserGeneratedImage[]; nextPage: number | null }> {
  const cacheKey = `user_gen_images_${userId}_${startDate}_${endDate}_${limit}_${offset}`;
  return cachedFetch(cacheKey, async () => {
    const params: Record<string, unknown> = { user_id: userId, limit, offset };
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;

    const response = await api.get('/dynamic_social_graphics', { params });
    const data = response.data;

    // Fallback to placeholder user if no images
    if ((!data.items || data.items.length === 0) && userId !== PLACEHOLDER_USER_ID) {
      params.user_id = PLACEHOLDER_USER_ID;
      const fallback = await api.get('/dynamic_social_graphics', { params });
      return fallback.data;
    }
    return data;
  }, CACHE_DURATION.MEDIUM);
}

export async function fetchUserImagesForDate(
  userId: number,
  date: string,
): Promise<UserGeneratedImage[]> {
  const cacheKey = `user_images_date_${userId}_${date}`;
  return cachedFetch(cacheKey, async () => {
    const params: Record<string, unknown> = {
      user_id: userId, start: date, end: date, limit: 10, offset: 0,
    };
    const response = await api.get('/dynamic_social_graphics', { params });
    const data = response.data;

    if ((!data.items || data.items.length === 0) && userId !== PLACEHOLDER_USER_ID) {
      params.user_id = PLACEHOLDER_USER_ID;
      const fallback = await api.get('/dynamic_social_graphics', { params });
      return fallback.data.items || [];
    }
    return data.items || [];
  }, CACHE_DURATION.MEDIUM);
}

// ==========================================
// AI Products
// ==========================================
export interface AIProduct {
  id: number;
  created_at: number;
  image?: { url?: string };
  image_url?: string;
  name?: string;
  title?: string;
  description?: string;
  social_post?: string;
  hashtags?: string;
  notes?: string;
  response?: string;
}

export async function fetchAIProducts(): Promise<AIProduct[]> {
  const response = await api.get('/ai_product_details');
  return Array.isArray(response.data) ? response.data : response.data?.items || [];
}

export async function fetchAIProduct(id: number): Promise<AIProduct> {
  const response = await api.get(`/ai_product_details/${id}`);
  return response.data;
}
