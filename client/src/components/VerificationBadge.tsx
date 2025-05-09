import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  isVerified: boolean;
  requiresVerification: boolean;
  method?: string | null;
  className?: string;
}

const VerificationBadge = ({ 
  isVerified, 
  requiresVerification,
  method,
  className
}: VerificationBadgeProps) => {
  if (!requiresVerification) {
    return null;
  }

  if (isVerified) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`bg-green-50 text-green-700 border-green-200 flex items-center gap-1 ${className}`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
              {method && <span className="ml-1">via {method}</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>This creator has verified their identity using {method || "decentralized verification"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 ${className}`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Unverified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This campaign creator has not verified their identity</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;