"use client";

import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface MessageAvatarProps {
  role: 'user' | 'assistant';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function MessageAvatar({ role, size = 'md', className = '' }: MessageAvatarProps) {
  const { user } = useUser();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  };

  if (role === 'assistant') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          bg-gradient-to-br from-cyan-400/20 to-blue-500/20
          border border-cyan-400/30 backdrop-blur-sm
          shadow-lg shadow-cyan-500/10
          ${className}
        `}
      >
        <Sparkles className={`${iconSizes[size]} text-cyan-300`} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center
        bg-gradient-to-br from-blue-500/20 to-purple-500/20
        border border-blue-400/30 backdrop-blur-sm
        shadow-lg shadow-blue-500/10
        ${className}
      `}
    >
      <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} font-semibold text-blue-200`}>
        {getInitials()}
      </span>
    </motion.div>
  );
}
