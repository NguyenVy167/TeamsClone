import { Users, MessageCircle, Calendar, Phone, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Sidebar() {
  return (
    <div className="w-20 teams-purple flex flex-col items-center py-4 space-y-4">
      {/* Teams Logo */}
      <div className="w-10 h-10 bg-white rounded flex items-center justify-center mb-4">
        <Users className="h-5 w-5 text-[var(--teams-purple)]" />
      </div>
      
      {/* Navigation Icons */}
      <div className="space-y-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              className="w-12 h-12 teams-light-blue hover:bg-opacity-80 rounded"
            >
              <MessageCircle className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Chat</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-12 h-12 hover:bg-white hover:bg-opacity-20 rounded text-white hover:text-white"
            >
              <Users className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Teams</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-12 h-12 hover:bg-white hover:bg-opacity-20 rounded text-white hover:text-white"
            >
              <Calendar className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Calendar</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-12 h-12 hover:bg-white hover:bg-opacity-20 rounded text-white hover:text-white"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Calls</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-12 h-12 hover:bg-white hover:bg-opacity-20 rounded text-white hover:text-white"
            >
              <File className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Files</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      {/* User Profile */}
      <div className="mt-auto">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative">
          <span className="text-[var(--teams-purple)] font-semibold text-sm">JD</span>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </div>
    </div>
  );
}
