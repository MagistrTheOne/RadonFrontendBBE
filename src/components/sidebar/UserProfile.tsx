"use client";

import { UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';

export default function UserProfile() {
  const { user } = useUser();

  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/10">
      <div className="flex items-center gap-3 flex-1">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
              userButtonPopoverCard: "bg-black/90 backdrop-blur-xl border border-white/10",
              userButtonPopoverActionButton: "text-white hover:bg-white/10",
              userButtonPopoverActionButtonText: "text-white",
              userButtonPopoverFooter: "hidden"
            }
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {user?.firstName || user?.username || 'Пользователь'}
          </div>
          <div className="text-xs text-white/60 truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
        </div>
      </div>
    </div>
  );
}
