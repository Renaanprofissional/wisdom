"use client";

import { Button } from "@/components/ui/button";
import { FaApple } from "react-icons/fa";

interface AuthAppleButtonProps {
  loading: boolean;
  onClick: () => void;
}

export const AuthAppleButton: React.FC<AuthAppleButtonProps> = ({
  loading,
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="w-full h-10 rounded-lg mt-2 bg-card border border-border text-foreground cursor-pointer"
    >
      <FaApple className="text-lg" />
    </Button>
  );
};
