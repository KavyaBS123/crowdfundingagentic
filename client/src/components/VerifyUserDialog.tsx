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
      const response = await apiRequest(`/api/users/${userId}/verify/brightid`, "POST", { 
        proof: brightIdProof 
      });

      if (response && response.success) {
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
      const response = await apiRequest(`/api/users/${userId}/verify/polygonid`, "POST", { 
        proof: polygonIdProof,
        credentialType: polygonIdCredential
      });

      if (response && response.success) {
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
            Verified campaigns receive 30% more funding on average.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-amber-800 dark:text-amber-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Why verify?
          </h4>
          <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 space-y-1 ml-6 list-disc">
            <li>Builds trust with potential backers</li>
            <li>Increases visibility for your campaign</li>
            <li>Required to create campaigns on our platform</li>
            <li>Protects the community from scams</li>
          </ul>
        </div>

        <Tabs defaultValue="brightid" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="brightid">BrightID</TabsTrigger>
            <TabsTrigger value="polygonid">Polygon ID</TabsTrigger>
          </TabsList>
          
          <TabsContent value="brightid" className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Get verified with BrightID in 3 easy steps:</h3>
              <ol className="space-y-2 text-sm pl-5 list-decimal">
                <li>
                  <strong>Install the BrightID app</strong> on your 
                  <a href="https://play.google.com/store/apps/details?id=org.brightid" target="_blank" rel="noreferrer" className="text-primary mx-1 underline">
                    Android
                  </a> 
                  or 
                  <a href="https://apps.apple.com/us/app/brightid/id1428946820" target="_blank" rel="noreferrer" className="text-primary mx-1 underline">
                    iOS
                  </a> 
                  device
                </li>
                <li>
                  <strong>Get verified on BrightID</strong> by connecting with others at a 
                  <a href="https://meetup.brightid.org/" target="_blank" rel="noreferrer" className="text-primary mx-1 underline">
                    verification meetup
                  </a>
                </li>
                <li>
                  <strong>Link your BrightID</strong> to our platform using the button below
                </li>
              </ol>
              
              <div className="mt-4 border-t pt-4">
                <p className="text-sm mb-3">After installing the BrightID app, scan this QR code with the app:</p>
                
                {/* Placeholder for QR code - in a real implementation, this would be generated dynamically */}
                <div className="flex justify-center mb-3">
                  <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 rounded-lg">
                    <div className="w-40 h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 p-2">
                        QR code would be displayed here for BrightID app to scan
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <a 
                    href="https://app.brightid.org/link-verification/CrowdFund3r" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-primary text-white rounded-full text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Open BrightID Verification
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brightid-proof">BrightID Verification Proof</Label>
              <Input
                id="brightid-proof"
                placeholder="Enter your BrightID verification proof"
                value={brightIdProof}
                onChange={(e) => setBrightIdProof(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                After completing the verification process, paste the proof string here.
                <a 
                  href="https://brightid.gitbook.io/brightid/getting-verified" 
                  target="_blank" 
                  rel="noreferrer"
                  className="underline ml-1"
                >
                  Need help?
                </a>
              </p>
            </div>
            
            <DialogFooter>
              <Button onClick={handleVerifyWithBrightId} disabled={isLoading} className="w-full bg-gradient-primary">
                {isLoading ? "Verifying..." : "Submit Verification"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="polygonid" className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Get verified with Polygon ID in 3 easy steps:</h3>
              <ol className="space-y-2 text-sm pl-5 list-decimal">
                <li>
                  <strong>Install the Polygon ID Wallet</strong> on your 
                  <a href="https://play.google.com/store/apps/details?id=com.polygonid.wallet" target="_blank" rel="noreferrer" className="text-primary mx-1 underline">
                    Android
                  </a> 
                  or 
                  <a href="https://apps.apple.com/us/app/polygon-id/id1629870183" target="_blank" rel="noreferrer" className="text-primary mx-1 underline">
                    iOS
                  </a> 
                  device
                </li>
                <li>
                  <strong>Create a digital identity</strong> in the Polygon ID app
                </li>
                <li>
                  <strong>Scan our verification QR code</strong> with the app to verify your identity
                </li>
              </ol>
              
              <div className="mt-4 border-t pt-4">
                <p className="text-sm mb-3">After installing the Polygon ID app, scan this QR code:</p>
                
                {/* Placeholder for QR code - in a real implementation, this would be generated dynamically */}
                <div className="flex justify-center mb-3">
                  <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 rounded-lg">
                    <div className="w-40 h-40 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 p-2">
                        QR code would be displayed here for Polygon ID app to scan
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <a 
                    href="https://platform-test.polygonid.com/claiming-app/claim-link/CrowdFund3r" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-primary text-white rounded-full text-sm font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Open Polygon ID Verification
                  </a>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="polygonid-credential">Credential Type</Label>
              <Input
                id="polygonid-credential"
                placeholder="e.g., KYC, Age Verification, etc."
                value={polygonIdCredential}
                onChange={(e) => setPolygonIdCredential(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Specify the type of credential you received
              </p>
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
                After completing verification, paste the proof string generated by the Polygon ID app.
                <a 
                  href="https://0xpolygonid.github.io/tutorials/verifier/verification-library/direct-integration/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="underline ml-1"
                >
                  Need help?
                </a>
              </p>
            </div>
            
            <DialogFooter>
              <Button onClick={handleVerifyWithPolygonId} disabled={isLoading} className="w-full bg-gradient-primary">
                {isLoading ? "Verifying..." : "Submit Verification"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyUserDialog;