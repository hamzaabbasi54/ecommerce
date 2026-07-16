import ProfileLayoutClient from '@/components/profile/ProfileLayoutClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Profile Settings | Electronica',
  description: 'Manage your profile, security, and addresses.',
};

export default function ProfilePage() {
  return <ProfileLayoutClient />;
}
