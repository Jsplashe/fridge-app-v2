"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Loader2 } from "lucide-react"
import { useState } from "react"

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  onUpgrade?: () => Promise<void> | void
}

export function PremiumModal({ isOpen, onClose, message, onUpgrade }: PremiumModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!onUpgrade) {
      onClose();
      return;
    }

    setIsUpgrading(true);
    try {
      await onUpgrade();
      onClose();
    } catch (error) {
      console.error("Failed to upgrade to premium:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            {message || "Unlock all premium features and take your kitchen management to the next level!"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-2">
            <Badge className="mt-0.5 bg-emerald-100 text-emerald-800">
              <Check className="h-3 w-3" />
            </Badge>
            <p className="text-sm">AI-powered inventory management with receipt scanning</p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge className="mt-0.5 bg-emerald-100 text-emerald-800">
              <Check className="h-3 w-3" />
            </Badge>
            <p className="text-sm">Unlimited recipe swipes and personalized recommendations</p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge className="mt-0.5 bg-emerald-100 text-emerald-800">
              <Check className="h-3 w-3" />
            </Badge>
            <p className="text-sm">Advanced waste tracking and smart shopping suggestions</p>
          </div>
          <div className="flex items-start space-x-2">
            <Badge className="mt-0.5 bg-emerald-100 text-emerald-800">
              <Check className="h-3 w-3" />
            </Badge>
            <p className="text-sm">Multi-user household management with shared lists</p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isUpgrading}>
            Maybe Later
          </Button>
          <Button 
            className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 sm:mt-0"
            onClick={handleUpgrade}
            disabled={isUpgrading}
          >
            {isUpgrading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Processing...
              </>
            ) : (
              "Upgrade Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

