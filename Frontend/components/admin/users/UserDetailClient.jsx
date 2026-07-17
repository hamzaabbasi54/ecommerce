"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, ShieldCheck, Mail, Phone, Calendar, ShoppingBag, CreditCard, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserDetailClient({ initialUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'USER',
    isVerified: user.isVerified || false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (val) => setFormData(prev => ({ ...prev, role: val }));
  const handleVerifyChange = (val) => setFormData(prev => ({ ...prev, isVerified: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('User updated successfully');
        setUser({ ...user, ...data.user });
      } else {
        alert(data.message || 'Error updating user');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const defaultAddress = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/users')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit User</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Stats */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-xl border border-border p-6 shadow-sm flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 border-2 border-primary/20 mb-4">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl uppercase">
                {user.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-4 flex gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-muted-foreground'}`}>
                {user.role}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isVerified ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-600'}`}>
                {user.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-border p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg border-b border-border pb-2">User Stats</h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex-1">Total Orders</div>
              <div className="font-semibold">{user._count?.orders || 0}</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1">Total Spent</div>
              <div className="font-semibold">${(user.totalSpent || 0).toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex-1">Joined</div>
              <div className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          {defaultAddress && (
            <div className="bg-surface-container-lowest rounded-xl border border-border p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-lg border-b border-border pb-2">Primary Address</h3>
              <div className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">{defaultAddress.fullName}</div>
                  <div className="text-muted-foreground mt-1">
                    {defaultAddress.streetAddress}<br />
                    {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}<br />
                    {defaultAddress.country}
                  </div>
                  <div className="text-muted-foreground mt-1">{defaultAddress.phone}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl border border-border p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-lg border-b border-border pb-2">Edit Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-surface-container" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="bg-surface-container" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" className="bg-surface-container" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-surface-container">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-container/50 rounded-lg border border-border mt-6">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Verified Account</Label>
                <p className="text-sm text-muted-foreground">Is this user's email address verified?</p>
              </div>
              <Switch checked={formData.isVerified} onCheckedChange={handleVerifyChange} />
            </div>

            <div className="flex justify-end pt-6 border-t border-border mt-6">
              <Button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-5 rounded-full cursor-pointer">
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
