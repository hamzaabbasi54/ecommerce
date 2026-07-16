"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function UserList({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user? This will also delete all their orders, reviews, and other data.')) {
      return;
    }

    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert(data.message || 'Error deleting user');
      }
    } catch (err) {
      alert('Network error while deleting user');
    } finally {
      setDeletingId(null);
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
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Stats</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
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
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className={
                      user.role === 'ADMIN' 
                        ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10' 
                        : ''
                    }>
                      {user.role}
                    </Badge>
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(user.id)} 
                      disabled={deletingId === user.id}
                      title="Delete user"
                      className="cursor-pointer"
                    >
                      {deletingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                      )}
                    </Button>
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
