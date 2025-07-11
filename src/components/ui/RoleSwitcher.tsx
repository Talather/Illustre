
import { useState } from "react";
import { ChevronDown, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ROLE_OPTIONS } from "@/types/auth";

interface RoleSwitcherProps {
  currentRole: string;
  availableRoles: string[];
  onRoleChange: (role: string) => void;
}

export const RoleSwitcher = ({ currentRole, availableRoles, onRoleChange }: RoleSwitcherProps) => {
  if (availableRoles.length <= 1) return null;

  const currentRoleInfo = ROLE_OPTIONS[currentRole];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCheck className="w-4 h-4" />
          <span>{currentRoleInfo?.label || currentRole}</span>
          <Badge variant="secondary" className="text-xs">
            {availableRoles.length}
          </Badge>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableRoles.map((role) => {
          const roleInfo = ROLE_OPTIONS[role];
          if (!roleInfo) return null;
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => onRoleChange(role)}
              className={`cursor-pointer ${
                role === currentRole ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-lg">{roleInfo.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{roleInfo.label}</div>
                  <div className="text-xs text-gray-500">{roleInfo.description}</div>
                </div>
                {role === currentRole && (
                  <UserCheck className="w-4 h-4 text-blue-600" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
