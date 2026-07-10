import { useState, useEffect } from 'react';
import { updateProfile, getProfile } from '@/services/userService';
import { Loader2 } from 'lucide-react';
import useAuthStore from '@/context/useAuthStore';

export default function PersonalInfoForm({ user: initialUser }) {
  const { setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
    profileImage: initialUser?.profileImage || ''
  });
  
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialUser?.profileImage || '');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch latest profile data on mount to ensure we have phone and image
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await getProfile();
        if (res.success && res.data) {
          setFormData({
            name: res.data.name || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            profileImage: res.data.profileImage || ''
          });
          setImagePreview(res.data.profileImage || '');
          // Also update global auth store to keep avatar synced
          setUser(res.data);
        }
      } catch (err) {
        console.error("Failed to load full profile", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchLatest();
  }, [setUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setSuccessMsg('');
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let payload;
      if (profileImageFile) {
        payload = new FormData();
        payload.append('name', formData.name);
        payload.append('phone', formData.phone);
        payload.append('profileImage', profileImageFile);
      } else {
        payload = {
          name: formData.name,
          phone: formData.phone,
          profileImageString: formData.profileImage
        };
      }

      const res = await updateProfile(payload);

      if (res.success) {
        setSuccessMsg(res.message);
        // Update auth context so Navbar avatar updates
        setUser(res.data);
      } else {
        setErrorMsg(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-semibold mb-6 text-foreground border-b border-border pb-4">Personal Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-[600px]">
        {/* Avatar Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-surface-container p-6 rounded-xl border border-border">
          <div className="w-24 h-24 rounded-full bg-surface-variant overflow-hidden flex items-center justify-center shrink-0 border-2 border-primary">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[40px] text-muted-foreground">person</span>
            )}
          </div>
          <div className="flex-grow w-full">
            <label className="block text-sm font-medium text-foreground mb-1">Upload Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-2">Choose an image file to upload from your computer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 bg-surface-container border border-input rounded-md text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed directly.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary max-w-[50%]"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-md flex items-center gap-2 text-error text-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-2 text-green-600 text-sm">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {successMsg}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
