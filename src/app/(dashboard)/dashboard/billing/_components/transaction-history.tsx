"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactions, getReceiptInfo } from "@/actions/credits.action";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Receipt, ExternalLink, CreditCard, Mail } from "lucide-react";
import { format, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useTransactionStore } from "@/state/transaction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

type TransactionData = Awaited<ReturnType<typeof getTransactions>>
type ReceiptData = Awaited<ReturnType<typeof getReceiptInfo>>

function isTransactionExpired(transaction: TransactionData["transactions"][number]): boolean {
  return transaction.expirationDate ? isPast(new Date(transaction.expirationDate)) : false;
}

// Receipt Modal Component
function ReceiptModal({ 
  paymentIntentId, 
  transactionDescription 
}: { 
  paymentIntentId: string;
  transactionDescription: string;
}) {
  const [receiptData, setReceiptData] = useState<ReceiptData["receiptInfo"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  const handleViewReceipt = async (isRetry = false) => {
    if (!isRetry) {
      setError(null);
      setRetryCount(0);
    }

    setIsLoading(true);
    try {
      const result = await getReceiptInfo(paymentIntentId);
      setReceiptData(result.receiptInfo);
      setIsOpen(true);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch receipt:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load receipt information";
      setError(errorMessage);
      
      // Show different toast messages based on retry state
      if (isRetry) {
        toast.error(`Retry ${retryCount + 1} failed: ${errorMessage}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      handleViewReceipt(true);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatCardBrand = (brand?: string) => {
    if (!brand) return 'Card';
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  // Determine if we should show retry button based on error message
  const shouldShowRetry = error && (
    error.includes('network') || 
    error.includes('connection') || 
    error.includes('busy') ||
    error.includes('try again')
  ) && retryCount < MAX_RETRIES;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewReceipt()}
          disabled={isLoading}
          className="h-8 px-2 text-xs"
        >
          <Receipt className="h-3 w-3 mr-1" />
          {isLoading ? "Loading..." : "Receipt"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Receipt
          </DialogTitle>
          <DialogDescription>
            Receipt details for your purchase
          </DialogDescription>
        </DialogHeader>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-sm text-muted-foreground">Loading receipt...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-destructive/15 p-3">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-destructive">
                    Unable to Load Receipt
                  </h3>
                  <div className="mt-2 text-sm text-destructive/80">
                    {error}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {shouldShowRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Retry ({MAX_RETRIES - retryCount} left)
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Success State - Receipt Data */}
        {receiptData && !isLoading && !error && (
          <div className="space-y-6">
            {/* Receipt Header */}
            <div className="text-center space-y-2 pb-4 border-b">
              <h3 className="text-lg font-semibold">
                {formatCurrency(receiptData.amount, receiptData.currency)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(receiptData.created * 1000), "MMMM d, yyyy 'at' h:mm a")}
              </p>
              {receiptData.receiptNumber && (
                <p className="text-xs text-muted-foreground font-mono">
                  Receipt #{receiptData.receiptNumber}
                </p>
              )}
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Transaction Details
              </h4>
              
              {receiptData.description && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="text-sm leading-relaxed">
                    {receiptData.description}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Amount</span>
                  <p className="font-medium">
                    {formatCurrency(receiptData.amount, receiptData.currency)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-muted-foreground">Date</span>
                  <p>
                    {format(new Date(receiptData.created * 1000), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </h4>
              
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Card</span>
                <p className="text-sm">
                  {receiptData.paymentMethodDetails.type === 'card' 
                    ? `${formatCardBrand(receiptData.paymentMethodDetails.brand)} •••• ${receiptData.paymentMethodDetails.last4}`
                    : receiptData.paymentMethodDetails.type
                  }
                </p>
              </div>
            </div>

            {/* Billing Details */}
            {receiptData.billingDetails && (receiptData.billingDetails.name || receiptData.billingDetails.email) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Billing Information
                  </h4>
                  
                  <div className="space-y-3">
                    {receiptData.billingDetails.name && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <p className="text-sm">{receiptData.billingDetails.name}</p>
                      </div>
                    )}
                    
                    {receiptData.billingDetails.email && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <p className="text-sm">{receiptData.billingDetails.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {receiptData.receiptUrl && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(receiptData.receiptUrl!, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Receipt
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function TransactionHistory() {
  const [data, setData] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const refreshTrigger = useTransactionStore((state) => state.refreshTrigger);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const result = await getTransactions({ page });
        setData(result);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [page, refreshTrigger]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Boolean(data?.transactions.length && data?.transactions.length > 0) ? data?.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="capitalize">
                      {transaction.type.toLowerCase().replace("_", " ")}
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "USAGE"
                          ? "text-red-500"
                          : isTransactionExpired(transaction)
                            ? "text-orange-500"
                            : "text-green-500"
                      }
                    >
                      {transaction.type === "USAGE" ? "-" : "+"}
                      {Math.abs(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {transaction.description || "No description"}
                    </TableCell>
                    <TableCell>
                      {transaction.paymentIntentId && transaction.type === "PURCHASE" ? (
                        transaction.paymentIntentId.startsWith('pi_test_') ? (
                          <div className="flex items-center gap-1">
                            <Receipt className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Test Mode</span>
                          </div>
                        ) : (
                          <ReceiptModal 
                            paymentIntentId={transaction.paymentIntentId}
                            transactionDescription={transaction.description}
                          />
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No transactions found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {Boolean(data?.transactions.length && data?.transactions.length > 0) ? data?.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col space-y-2 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                </span>
                <span className="capitalize text-sm">
                  {transaction.type.toLowerCase().replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {transaction.description}
                </span>
                <span
                  className={
                    transaction.type === "USAGE"
                      ? "text-red-500"
                      : isTransactionExpired(transaction)
                        ? "text-orange-500"
                        : "text-green-500"
                  }
                >
                  {transaction.type === "USAGE" ? "-" : "+"}
                  {Math.abs(transaction.amount)}
                </span>
              </div>
              
              {/* Receipt button for mobile */}
              {transaction.paymentIntentId && transaction.type === "PURCHASE" && (
                <div className="flex justify-end pt-2">
                  {transaction.paymentIntentId.startsWith('pi_test_') ? (
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Receipt className="h-3 w-3" />
                      Test Mode
                    </div>
                  ) : (
                    <ReceiptModal 
                      paymentIntentId={transaction.paymentIntentId}
                      transactionDescription={transaction.description}
                    />
                  )}
                </div>
              )}
              
              {transaction.type !== "USAGE" && transaction.expirationDate && (
                <Badge
                  variant="secondary"
                  className={`self-start font-normal text-[0.75rem] leading-[1rem] ${isTransactionExpired(transaction)
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-muted"
                    }`}
                >
                  {isTransactionExpired(transaction) ? "Expired: " : "Expires: "}
                  {format(new Date(transaction.expirationDate), "MMM d, yyyy")}
                </Badge>
              )}
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          )}
        </div>

        {Boolean(data?.pagination.pages && data.pagination.pages > 1) && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {data?.pagination.pages ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data?.pagination.pages ?? 1, p + 1))}
              disabled={page === (data?.pagination.pages ?? 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
