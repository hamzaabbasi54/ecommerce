"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ActionButtons from '@/components/admin/ActionButtons';
import Pagination from '@/components/ui/Pagination';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserList({ initialUsers, currentPage, totalPages, initialQuery = '' }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const initialRender = useRef(true);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  // Sync state if props change
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    router.push(`/admin/users?page=1&q=${encodeURIComponent(debouncedSearchTerm)}`);
  }, [debouncedSearchTerm, router]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    router.push(`/admin/users?page=${page}&q=${encodeURIComponent(searchTerm)}`);
  };

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

  // Filter logic moved to server
  const displayUsers = users;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-border shadow-sm overflow-hidden relative">
      <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-9 w-full bg-surface-container"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="min-h-[300px]">
        <Table>
          <TableHeader className="bg-surface-container/50">
            <TableRow>
              <TableHead className="font-medium">User</TableHead>
              <TableHead className="font-medium">Contact</TableHead>
              <TableHead className="font-medium">Role</TableHead>
              <TableHead className="font-medium">Stats</TableHead>
              <TableHead className="font-medium">Joined</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              displayUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-surface-container-low transition-colors">
                  <TableCell className="font-medium text-foreground">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary uppercase">{user.name.slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        {user.isVerified && <div className="text-xs text-muted-foreground">Verified</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{user.email}</div>
                    <div className="text-muted-foreground text-xs">{user.phone || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className={
                      user.role === 'ADMIN' 
                        ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/10' 
                        : ''
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      Orders: <span className="font-medium text-foreground">{user._count.orders}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reviews: <span className="font-medium text-foreground">{user._count.reviews}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionButtons 
                      onEdit={() => router.push(`/admin/users/${user.id}`)}
                      onDelete={() => handleDelete(user.id)}
                      isDeleting={deletingId === user.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
}
