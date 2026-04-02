"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface AuthGoogleButtonProps {
  loading: boolean;
  onClick: () => void;
}

export const AuthGoogleButton: React.FC<AuthGoogleButtonProps> = ({
  loading,
  onClick,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="w-20 h-10 rounded-lg mt-2 bg-mauve-950 text-white cursor-pointer"
    >
      <FcGoogle />
    </Button>
  );
};
