import TabBar from '@/components/TabBar'
import ProfileClient from './ProfileClient'

export const metadata = { title: '個人資料設定 | 韓好物' }

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <ProfileClient />
      <div className="h-20 md:hidden" />
      <TabBar />
    </div>
  )
}
