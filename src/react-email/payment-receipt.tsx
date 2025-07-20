import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Hr,
  Link,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import { SITE_DOMAIN, SITE_NAME } from "@/constants";

interface PaymentReceiptProps {
  // Customer information
  customerName?: string;
  customerEmail?: string;
  
  // Receipt details
  receiptNumber?: string;
  transactionDate?: string;
  
  // Payment information
  amount?: number;
  currency?: string;
  taxAmount?: number;
  taxRate?: string;
  
  // Payment method
  paymentMethod?: string;
  cardLast4?: string;
  cardBrand?: string;
  
  // Transaction details
  credits?: number;
  description?: string;
  paymentIntentId?: string;
  
  // Download link
  downloadUrl?: string;
}

export const PaymentReceipt = ({
  customerName = "John Doe",
  customerEmail = "john.doe@example.com",
  receiptNumber = "RCPT-2024-0001",
  transactionDate = "January 15, 2024",
  amount = 1000,
  currency = "USD",
  taxAmount = 0,
  taxRate = "",
  paymentMethod = "Credit Card",
  cardLast4 = "4242",
  cardBrand = "Visa",
  credits = 1200,
  description = "Credit Package Purchase",
  paymentIntentId = "pi_1234567890",
  downloadUrl = "https://example.com/download-receipt",
}: PaymentReceiptProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const subtotal = amount - taxAmount;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={companyName}>{SITE_NAME}</Heading>
            <Text style={receiptTitle}>Payment Receipt</Text>
          </Section>

          {/* Receipt Number and Date */}
          <Section style={receiptInfo}>
            <Row>
              <Column style={receiptInfoLeft}>
                <Text style={receiptLabel}>Receipt #:</Text>
                <Text style={receiptValue}>{receiptNumber}</Text>
              </Column>
              <Column style={receiptInfoRight}>
                <Text style={receiptLabel}>Date:</Text>
                <Text style={receiptValue}>{transactionDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Customer Information */}
          <Section style={customerSection}>
            <Text style={sectionTitle}>Bill To:</Text>
            <Text style={customerInfo}>{customerName}</Text>
            <Text style={customerInfo}>{customerEmail}</Text>
          </Section>

          <Hr style={divider} />

          {/* Transaction Details */}
          <Section style={transactionSection}>
            <Text style={sectionTitle}>Transaction Details</Text>
            <Row style={transactionRow}>
              <Column style={transactionLeft}>
                <Text style={transactionLabel}>Description:</Text>
              </Column>
              <Column style={transactionRight}>
                <Text style={transactionValue}>{description}</Text>
              </Column>
            </Row>
            <Row style={transactionRow}>
              <Column style={transactionLeft}>
                <Text style={transactionLabel}>Credits Purchased:</Text>
              </Column>
              <Column style={transactionRight}>
                <Text style={transactionValue}>{credits?.toLocaleString()} credits</Text>
              </Column>
            </Row>
            <Row style={transactionRow}>
              <Column style={transactionLeft}>
                <Text style={transactionLabel}>Payment Method:</Text>
              </Column>
              <Column style={transactionRight}>
                <Text style={transactionValue}>
                  {paymentMethod} {cardBrand && cardLast4 && `(${cardBrand} •••• ${cardLast4})`}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Payment Breakdown */}
          <Section style={breakdownSection}>
            <Text style={sectionTitle}>Payment Summary</Text>
            
            <Row style={summaryRow}>
              <Column style={summaryLeft}>
                <Text style={summaryLabel}>Subtotal:</Text>
              </Column>
              <Column style={summaryRight}>
                <Text style={summaryValue}>{formatCurrency(subtotal, currency)}</Text>
              </Column>
            </Row>

            {taxAmount > 0 && (
              <Row style={summaryRow}>
                <Column style={summaryLeft}>
                  <Text style={summaryLabel}>
                    Tax {taxRate && `(${taxRate})`}:
                  </Text>
                </Column>
                <Column style={summaryRight}>
                  <Text style={summaryValue}>{formatCurrency(taxAmount, currency)}</Text>
                </Column>
              </Row>
            )}

            <Hr style={subtotalDivider} />

            <Row style={totalRow}>
              <Column style={summaryLeft}>
                <Text style={totalLabel}>Total Paid:</Text>
              </Column>
              <Column style={summaryRight}>
                <Text style={totalValue}>{formatCurrency(amount, currency)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Download Section */}
          <Section style={downloadSection}>
            <Text style={downloadText}>
              You can download a PDF copy of this receipt for your records:
            </Text>
            <Section style={buttonContainer}>
              <Link style={downloadButton} href={downloadUrl}>
                Download Receipt PDF
              </Link>
            </Section>
          </Section>

          {/* Transaction ID for Reference */}
          <Section style={referenceSection}>
            <Text style={referenceText}>
              Transaction ID: {paymentIntentId}
            </Text>
            <Text style={referenceText}>
              For questions about this receipt, please contact us and reference the transaction ID above.
            </Text>
          </Section>

          {/* Legal/Compliance Text */}
          <Section style={legalSection}>
            <Text style={legalText}>
              This receipt is issued for the purchase of digital credits on {SITE_DOMAIN}. 
              Credits are non-refundable and expire 2 years from the purchase date.
            </Text>
            <Text style={legalText}>
              This is a valid receipt for expense claim purposes. Keep this for your records.
            </Text>
          </Section>

          {/* Footer */}
          <Text style={footer}>
            This is an automated receipt from {SITE_DOMAIN}. Please do not reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

PaymentReceipt.PreviewProps = {
  customerName: "John Doe",
  customerEmail: "john.doe@example.com",
  receiptNumber: "RCPT-2024-0001",
  transactionDate: "January 15, 2024",
  amount: 1000,
  currency: "USD",
  taxAmount: 80,
  taxRate: "8%",
  paymentMethod: "Credit Card",
  cardLast4: "4242",
  cardBrand: "Visa",
  credits: 1200,
  description: "Credit Package Purchase - 1200 Credits",
  paymentIntentId: "pi_1234567890abcdef",
  downloadUrl: "https://example.com/download-receipt?token=abc123",
} as PaymentReceiptProps;

export default PaymentReceipt;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  marginTop: "30px",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20,50,70,.2)",
  marginTop: "20px",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const companyName = {
  color: "#000",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const receiptTitle = {
  color: "#525f7f",
  fontSize: "18px",
  margin: "0",
};

const receiptInfo = {
  marginBottom: "20px",
};

const receiptInfoLeft = {
  textAlign: "left" as const,
  width: "50%",
};

const receiptInfoRight = {
  textAlign: "right" as const,
  width: "50%",
};

const receiptLabel = {
  color: "#8898aa",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 5px 0",
  textTransform: "uppercase" as const,
};

const receiptValue = {
  color: "#525f7f",
  fontSize: "16px",
  margin: "0",
  fontWeight: "600",
};

const divider = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const subtotalDivider = {
  borderColor: "#e6ebf1",
  margin: "10px 0",
};

const customerSection = {
  marginBottom: "20px",
};

const sectionTitle = {
  color: "#000",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 10px 0",
};

const customerInfo = {
  color: "#525f7f",
  fontSize: "14px",
  margin: "0 0 5px 0",
};

const transactionSection = {
  marginBottom: "20px",
};

const transactionRow = {
  marginBottom: "8px",
};

const transactionLeft = {
  width: "40%",
  textAlign: "left" as const,
};

const transactionRight = {
  width: "60%",
  textAlign: "right" as const,
};

const transactionLabel = {
  color: "#8898aa",
  fontSize: "14px",
  margin: "0",
};

const transactionValue = {
  color: "#525f7f",
  fontSize: "14px",
  margin: "0",
};

const breakdownSection = {
  marginBottom: "20px",
};

const summaryRow = {
  marginBottom: "8px",
};

const summaryLeft = {
  width: "70%",
  textAlign: "left" as const,
};

const summaryRight = {
  width: "30%",
  textAlign: "right" as const,
};

const summaryLabel = {
  color: "#525f7f",
  fontSize: "14px",
  margin: "0",
};

const summaryValue = {
  color: "#525f7f",
  fontSize: "14px",
  margin: "0",
};

const totalRow = {
  marginBottom: "0",
};

const totalLabel = {
  color: "#000",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const totalValue = {
  color: "#000",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const downloadSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const downloadText = {
  color: "#525f7f",
  fontSize: "14px",
  margin: "0 0 20px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const downloadButton = {
  backgroundColor: "#000",
  borderRadius: "5px",
  color: "#fff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
  margin: "0 auto",
};

const referenceSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const referenceText = {
  color: "#8898aa",
  fontSize: "12px",
  margin: "0 0 8px 0",
};

const legalSection = {
  marginBottom: "20px",
};

const legalText = {
  color: "#8898aa",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "0 0 8px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
  margin: "20px 0",
}; 