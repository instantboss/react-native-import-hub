import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import Layout from './components/Layout'

// Pages
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import DailyContentPage from './pages/DailyContentPage'
import DailyContentDetailPage from './pages/DailyContentDetailPage'
import TemplatesPage from './pages/TemplatesPage'
import PrintablesPage from './pages/PrintablesPage'
import BuyGuidesPage from './pages/BuyGuidesPage'
import PresetsPage from './pages/PresetsPage'
import LessonsPage from './pages/LessonsPage'
import LessonDetailPage from './pages/LessonDetailPage'
import MentorsPage from './pages/MentorsPage'
import MentorDetailPage from './pages/MentorDetailPage'
import MentorListPage from './pages/MentorListPage'
import MentorAskPage from './pages/MentorAskPage'
import MentorPodcastsPage from './pages/MentorPodcastsPage'
import MentorToolboxPage from './pages/MentorToolboxPage'
import MentorExtrasPage from './pages/MentorExtrasPage'
import MentorLiveQAPage from './pages/MentorLiveQAPage'
import NewsPage from './pages/NewsPage'
import ExtrasPage from './pages/ExtrasPage'
import ExtrasGraphicsPage from './pages/ExtrasGraphicsPage'
import ExtrasVideosPage from './pages/ExtrasVideosPage'
import ExtrasPdfsPage from './pages/ExtrasPdfsPage'
import ShoppingListPage from './pages/ShoppingListPage'
import GroupsPage from './pages/GroupsPage'
import ProductNamesPage from './pages/ProductNamesPage'
import VendorsPage from './pages/VendorsPage'
import FAQsPage from './pages/FAQsPage'
import SupportPage from './pages/SupportPage'
import OldDashPage from './pages/OldDashPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-[#F963C0] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/daily-content" element={<DailyContentPage />} />
                <Route path="/daily-content/:date" element={<DailyContentDetailPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/printables" element={<PrintablesPage />} />
                <Route path="/buy-guides" element={<BuyGuidesPage />} />
                <Route path="/presets" element={<PresetsPage />} />
                <Route path="/lessons" element={<LessonsPage />} />
                <Route path="/lessons/:id" element={<LessonDetailPage />} />
                <Route path="/mentors" element={<MentorsPage />} />
                <Route path="/mentors/list" element={<MentorListPage />} />
                <Route path="/mentors/ask" element={<MentorAskPage />} />
                <Route path="/mentors/podcasts" element={<MentorPodcastsPage />} />
                <Route path="/mentors/toolbox" element={<MentorToolboxPage />} />
                <Route path="/mentors/extras" element={<MentorExtrasPage />} />
                <Route path="/mentors/live-qa" element={<MentorLiveQAPage />} />
                <Route path="/mentors/:id" element={<MentorDetailPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/extras" element={<ExtrasPage />} />
                <Route path="/extras/graphics" element={<ExtrasGraphicsPage />} />
                <Route path="/extras/videos" element={<ExtrasVideosPage />} />
                <Route path="/extras/pdfs" element={<ExtrasPdfsPage />} />
                <Route path="/shopping-list" element={<ShoppingListPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/product-names" element={<ProductNamesPage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/faqs" element={<FAQsPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/old-dash" element={<OldDashPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
