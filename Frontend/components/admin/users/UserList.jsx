"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserList({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const router = useRouter();

  const handleRoleChange = async (userId, newRole) => {
    if (confirm(`Are you sure you want to change this user to ${newRole}?`)) {
      setLoadingId(userId);
      try {
        const response = await axios.put('/api/admin/users', { userId, role: newRole }, { withCredentials: true });
        if (response.data.success) {
          setUsers(users.map(u => u.id === userId ? response.data.data : u));
          router.refresh();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating user role');
      } finally {
        setLoadingId(null);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-9 w-full bg-surface-container"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-surface-container/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Stats</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary uppercase">{user.name.slice(0,2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.isVerified ? 'Verified' : 'Unverified'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{user.email}</div>
                    <div className="text-muted-foreground text-xs">{user.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      Orders: <span className="font-medium text-foreground">{user._count.orders}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reviews: <span className="font-medium text-foreground">{user._count.reviews}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={loadingId === user.id}
                      className={`text-sm rounded-md border px-2 py-1 ${
                        user.role === 'ADMIN' 
                        ? 'bg-primary/10 text-primary border-primary/20 font-semibold' 
                        : 'bg-surface-container border-border text-foreground'
                      }`}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
