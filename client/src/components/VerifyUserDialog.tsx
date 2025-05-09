import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';

interface VerifyUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userAddress: string;
  onVerificationComplete: () => void;
}

const VerifyUserDialog = ({ isOpen, onClose, userId, userAddress, onVerificationComplete }: VerifyUserDialogProps) => {
  const [activeTab, setActiveTab] = useState("brightid");
  const [brightIdProof, setBrightIdProof] = useState("");
  const [polygonIdProof, setPolygonIdProof] = useState("");
  const [polygonIdCredential, setPolygonIdCredential] = useState("KYC");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyWithBrightId = async () => {
    if (!brightIdProof) {
      toast({
        title: "Verification Failed",
        description: "Please enter a valid BrightID proof",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/users/${userId}/verify/brightid`, {
        method: "POST",
        body: JSON.stringify({ proof: brightIdProof }),
      });

      if (response.success) {
        toast({
          title: "Verification Successful",
          description: "Your identity has been verified with BrightID",
        });
        onVerificationComplete();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyWithPolygonId = async () => {
    if (!polygonIdProof) {
      toast({
        title: "Verification Failed",
        description: "Please enter a valid Polygon ID proof",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/users/${userId}/verify/polygonid`, {
        method: "POST",
        body: JSON.stringify({ 
          proof: polygonIdProof,
          credentialType: polygonIdCredential
        }),
      });

      if (response.success) {
        toast({
          title: "Verification Successful",
          description: "Your identity has been verified with Polygon ID",
        });
        onVerificationComplete();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verify Your Identity</DialogTitle>
          <DialogDescription>
            Verification helps build trust with your potential backers. 
            Choose a verification method below.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="brightid" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brightid">BrightID</TabsTrigger>
            <TabsTrigger value="polygonid">Polygon ID</TabsTrigger>
          </TabsList>
          
          <TabsContent value="brightid" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brightid-proof">BrightID Verification Proof</Label>
              <Input
                id="brightid-proof"
                placeholder="Enter your BrightID verification proof"
                value={brightIdProof}
                onChange={(e) => setBrightIdProof(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Connect with the BrightID app and paste your verification proof here.
                <a 
                  href="https://brightid.org/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="underline ml-1"
                >
                  Learn more
                </a>
              </p>
            </div>
            
            <DialogFooter>
              <Button onClick={handleVerifyWithBrightId} disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify with BrightID"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="polygonid" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="polygonid-credential">Credential Type</Label>
              <Input
                id="polygonid-credential"
                placeholder="e.g., KYC, Age Verification, etc."
                value={polygonIdCredential}
                onChange={(e) => setPolygonIdCredential(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="polygonid-proof">Polygon ID Proof</Label>
              <Input
                id="polygonid-proof"
                placeholder="Enter your Polygon ID zero-knowledge proof"
                value={polygonIdProof}
                onChange={(e) => setPolygonIdProof(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Generate a zero-knowledge proof using your Polygon ID wallet and paste it here.
                <a 
                  href="https://polygon.technology/polygon-id/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="underline ml-1"
                >
                  Learn more
                </a>
              </p>
            </div>
            
            <DialogFooter>
              <Button onClick={handleVerifyWithPolygonId} disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify with Polygon ID"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyUserDialog;