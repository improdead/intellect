"use client";

import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: {
    picture?: string | null;
    name?: string | null;
  } | null;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ user, className = "", fallbackClassName = "" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state when user changes
    setImageError(false);
    
    // Set image source
    if (user?.picture) {
      setImageSrc(user.picture);
    } else {
      setImageSrc(null);
    }
  }, [user]);

  const handleImageError = () => {
    console.log("Profile image failed to load");
    setImageError(true);
  };

  // Get initials for fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Avatar className={className}>
      {!imageError && imageSrc ? (
        <AvatarImage 
          src={imageSrc} 
          alt={user?.name || "User"} 
          onError={handleImageError}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
