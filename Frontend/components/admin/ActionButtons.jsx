"use client";

import { Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ActionButtons({ onEdit, onDelete, onView, isDeleting }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {onView && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="cursor-pointer hover:bg-green-500/10 hover:text-green-600 text-muted-foreground transition-colors" 
              onClick={onView}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">View Details</TooltipContent>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="cursor-pointer hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground transition-colors" 
              onClick={onEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Edit</TooltipContent>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="cursor-pointer hover:bg-red-500/10 hover:text-red-600 text-muted-foreground transition-colors" 
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-red-600 text-white border-none">Delete</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
