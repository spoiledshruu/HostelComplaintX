import { Button } from "@/components/ui/button";
import { FileText, Users, Shield } from "lucide-react";

interface AdminNavProps {
  activeTab: "complaints" | "students" | "admins";
  onTabChange: (tab: "complaints" | "students" | "admins") => void;
}

export function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  return (
    <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1 mb-6">
      <Button
        data-testid="nav-complaints"
        variant={activeTab === "complaints" ? "default" : "ghost"}
        onClick={() => onTabChange("complaints")}
        className={`flex items-center space-x-2 ${
          activeTab === "complaints" 
            ? "bg-white shadow-sm text-neutral-800" 
            : "text-neutral-600 hover:text-neutral-800"
        }`}
      >
        <FileText size={16} />
        <span>Complaints</span>
      </Button>
      
      <Button
        data-testid="nav-students"
        variant={activeTab === "students" ? "default" : "ghost"}
        onClick={() => onTabChange("students")}
        className={`flex items-center space-x-2 ${
          activeTab === "students" 
            ? "bg-white shadow-sm text-neutral-800" 
            : "text-neutral-600 hover:text-neutral-800"
        }`}
      >
        <Users size={16} />
        <span>Students</span>
      </Button>
      
      <Button
        data-testid="nav-admins"
        variant={activeTab === "admins" ? "default" : "ghost"}
        onClick={() => onTabChange("admins")}
        className={`flex items-center space-x-2 ${
          activeTab === "admins" 
            ? "bg-white shadow-sm text-neutral-800" 
            : "text-neutral-600 hover:text-neutral-800"
        }`}
      >
        <Shield size={16} />
        <span>Admins</span>
      </Button>
    </div>
  );
}