// PaymentModal.tsx — used by TravelPlan.tsx (5-step wizard)
// R3: Added Google Pay and PhonePe options with QR / Bank Transfer sub-flows.
// R4: Enhanced validate() — specific per-field errors, red borders, Pay button disabled while errors exist.
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  destination: string;
  travelers: number;
  days: number;
  onSuccess: (ref: string) => void;
}

type PayStep = "form" | "processing" | "done";
type ModalPayMethod = "card" | "upi" | "netbanking" | "googlepay" | "phonepe";
type UpiSubMode = "qr" | "transfer" | null;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

function DummyQR({
  provider,
  amount,
}: { provider: "Google Pay" | "PhonePe"; amount: number }) {
  const dots: { x: number; y: number }[] = [];
  for (let r = 0; r < 21; r++) {
    for (let c = 0; c < 21; c++) {
      const hash = (r * 31 + c * 17 + r * c) % 7;
      const isFinder =
        (r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8);
      if (isFinder || hash < 4) dots.push({ x: c, y: r });
    }
  }
  const color = provider === "PhonePe" ? "#5f259f" : "#1a73e8";
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div
        className="rounded-xl border-4 p-2 bg-white shadow"
        style={{ borderColor: color }}
      >
        <svg
          width={120}
          height={120}
          viewBox="0 0 21 21"
          role="img"
          aria-label={`${provider} payment QR code`}
        >
          <title>{provider} payment QR code</title>
          <rect width={21} height={21} fill="white" />
          {dots.map((d) => (
            <rect
              key={`${d.x}-${d.y}`}
              x={d.x}
              y={d.y}
              width={0.9}
              height={0.9}
              fill={color}
            />
          ))}
        </svg>
      </div>
      <p className="text-xs font-semibold text-foreground">
        Scan with <span style={{ color }}>{provider}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Amount:{" "}
        <strong className="text-foreground">{formatCurrency(amount)}</strong>
      </p>
      <p className="text-xs text-muted-foreground italic">
        Demo QR — no real payment.
      </p>
    </div>
  );
}

function BankTransferDetails({ amount }: { amount: number }) {
  const details = [
    { label: "Account Name", value: "WanderAssist Travel Pvt Ltd" },
    { label: "Account No.", value: "9876543210123456" },
    { label: "IFSC", value: "WAND0001234" },
    { label: "Bank", value: "WanderAssist Bank" },
    { label: "Amount", value: formatCurrency(amount) },
  ];
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2 mt-2">
      {details.map(({ label, value }) => (
        <div key={label} className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-mono font-semibold text-foreground">
            {value}
          </span>
        </div>
      ))}
      <p className="text-xs text-amber-600 dark:text-amber-400 pt-1">
        ⚠️ Simulated — no real transfer required.
      </p>
    </div>
  );
}

export function PaymentModal({
  open,
  onClose,
  amount,
  destination,
  travelers,
  days,
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<PayStep>("form");
  const [payRef, setPayRef] = useState("");
  const [payMethod, setPayMethod] = useState<ModalPayMethod>("card");
  const [upiSubMode, setUpiSubMode] = useState<UpiSubMode>(null);
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("SBI");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [errors, setErrors] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    upiId: "",
    upiSubMode: "",
  });

  function validate() {
    const errs = {
      number: "",
      expiry: "",
      cvv: "",
      name: "",
      upiId: "",
      upiSubMode: "",
    };
    if (payMethod === "card") {
      // Card name: at least 2 characters
      if (!card.name.trim() || card.name.trim().length < 2)
        errs.name = "Cardholder name must be at least 2 characters";
      // Card number: exactly 16 digits (spaces stripped)
      if (card.number.replace(/\s/g, "").length !== 16)
        errs.number = "Card number must be exactly 16 digits";
      // Expiry: MM/YY format and not expired
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
        errs.expiry = "Enter expiry in MM/YY format";
      } else {
        const [mm, yy] = card.expiry.split("/");
        const month = Number(mm);
        const year = 2000 + Number(yy);
        if (month < 1 || month > 12) {
          errs.expiry = "Enter a valid month (01–12)";
        } else {
          const expDate = new Date(year, month, 1); // first day of NEXT month
          if (expDate <= new Date()) errs.expiry = "Card has expired";
        }
      }
      // CVV: 3–4 digits
      if (!/^\d{3,4}$/.test(card.cvv)) errs.cvv = "CVV must be 3–4 digits";
    } else if (payMethod === "upi") {
      // UPI ID format: name@provider
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId.trim()))
        errs.upiId = "Invalid UPI ID format (e.g. name@upi)";
    } else if (payMethod === "googlepay" || payMethod === "phonepe") {
      if (!upiSubMode) errs.upiSubMode = "Choose QR Code or Bank Transfer";
    }
    setErrors(errs);
    return Object.values(errs).every((e) => e === "");
  }

  function handlePay() {
    setSubmitAttempted(true);
    if (!validate()) return;
    setStep("processing");
    const ref = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    setPayRef(ref);
    setTimeout(() => {
      setStep("done");
      setTimeout(() => {
        onSuccess(ref);
        // reset
        setStep("form");
        setPayRef("");
        setPayMethod("card");
        setUpiSubMode(null);
        setUpiId("");
        setSubmitAttempted(false);
        setCard({ number: "", expiry: "", cvv: "", name: "" });
        setErrors({
          number: "",
          expiry: "",
          cvv: "",
          name: "",
          upiId: "",
          upiSubMode: "",
        });
      }, 800);
    }, 2000);
  }

  function formatCard(val: string) {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  const gpayActive = payMethod === "googlepay";
  const phonepeActive = payMethod === "phonepe";
  const upiProvider: "Google Pay" | "PhonePe" = gpayActive
    ? "Google Pay"
    : "PhonePe";

  const payButtonLabel = (() => {
    if ((gpayActive || phonepeActive) && upiSubMode === "qr")
      return "Payment Done";
    if ((gpayActive || phonepeActive) && upiSubMode === "transfer")
      return "I've Transferred";
    return `Pay ${formatCurrency(amount)}`;
  })();

  const hasErrors =
    submitAttempted && Object.values(errors).some((e) => e !== "");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-slide-up">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <CreditCard className="w-5 h-5 text-accent" />
            Secure Payment
            <Badge variant="secondary" className="ml-auto text-xs">
              <Lock className="w-3 h-3 mr-1" />
              256-bit SSL
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Order summary */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Destination</span>
            <span className="font-semibold">{destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Travelers × Days</span>
            <span>
              {travelers} × {days}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total Amount</span>
            <span className="text-accent">{formatCurrency(amount)}</span>
          </div>
        </div>

        {step === "form" && (
          <div className="space-y-4 animate-fade-in">
            {/* Payment method selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  key: "card" as ModalPayMethod,
                  label: "Card",
                  icon: <CreditCard className="w-4 h-4" />,
                },
                {
                  key: "upi" as ModalPayMethod,
                  label: "UPI",
                  icon: <Smartphone className="w-4 h-4" />,
                },
                {
                  key: "netbanking" as ModalPayMethod,
                  label: "Net Banking",
                  icon: <Building2 className="w-4 h-4" />,
                },
                {
                  key: "googlepay" as ModalPayMethod,
                  label: "G Pay",
                  icon: (
                    <span className="text-xs font-black text-green-600 dark:text-green-400">
                      G Pay
                    </span>
                  ),
                },
                {
                  key: "phonepe" as ModalPayMethod,
                  label: "PhonePe",
                  icon: (
                    <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                      Ph Pe
                    </span>
                  ),
                },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setPayMethod(m.key);
                    setUpiSubMode(null);
                    setErrors({
                      number: "",
                      expiry: "",
                      cvv: "",
                      name: "",
                      upiId: "",
                      upiSubMode: "",
                    });
                  }}
                  className={`rounded-lg border-2 p-2 text-center text-xs font-semibold transition-smooth ${payMethod === m.key ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}
                  data-ocid={`modal-pay-${m.key}`}
                >
                  <div
                    className={`flex justify-center mb-0.5 ${payMethod === m.key ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {m.icon}
                  </div>
                  <span className="leading-tight">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Card form */}
            {payMethod === "card" && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground border border-border rounded-md py-2">
                  <span className="font-semibold text-blue-600">Razorpay</span>
                  <span>— Trusted Payments Gateway</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="card-name">Name on Card *</Label>
                  <Input
                    id="card-name"
                    placeholder="John Doe"
                    value={card.name}
                    onChange={(e) => {
                      setCard({ ...card, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    className={errors.name ? "border-red-500" : ""}
                    data-ocid="payment-name"
                  />
                  <FieldError msg={errors.name} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="card-number">Card Number *</Label>
                  <div className="relative">
                    <Input
                      id="card-number"
                      placeholder="4111 1111 1111 1111"
                      value={card.number}
                      onChange={(e) => {
                        setCard({
                          ...card,
                          number: formatCard(e.target.value),
                        });
                        if (errors.number) setErrors({ ...errors, number: "" });
                      }}
                      className={`pr-10 font-mono${errors.number ? " border-red-500" : ""}`}
                      data-ocid="payment-card-number"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <FieldError msg={errors.number} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="card-expiry">Expiry (MM/YY) *</Label>
                    <Input
                      id="card-expiry"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => {
                        setCard({
                          ...card,
                          expiry: formatExpiry(e.target.value),
                        });
                        if (errors.expiry) setErrors({ ...errors, expiry: "" });
                      }}
                      className={`font-mono${errors.expiry ? " border-red-500" : ""}`}
                      data-ocid="payment-expiry"
                    />
                    <FieldError msg={errors.expiry} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="card-cvv">CVV *</Label>
                    <Input
                      id="card-cvv"
                      placeholder="123"
                      type="password"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(e) => {
                        setCard({
                          ...card,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        });
                        if (errors.cvv) setErrors({ ...errors, cvv: "" });
                      }}
                      className={`font-mono${errors.cvv ? " border-red-500" : ""}`}
                      data-ocid="payment-cvv"
                    />
                    <FieldError msg={errors.cvv} />
                  </div>
                </div>
              </div>
            )}

            {/* UPI form */}
            {payMethod === "upi" && (
              <div className="space-y-1">
                <Label htmlFor="upi-id">UPI ID *</Label>
                <Input
                  id="upi-id"
                  placeholder="9999999999@upi"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    if (errors.upiId) setErrors({ ...errors, upiId: "" });
                  }}
                  className={errors.upiId ? "border-red-500" : ""}
                  data-ocid="modal-upi-id"
                />
                <FieldError msg={errors.upiId} />
              </div>
            )}

            {/* Net Banking */}
            {payMethod === "netbanking" && (
              <div className="space-y-1">
                <Label>Select Bank</Label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {[
                    "SBI",
                    "HDFC",
                    "ICICI",
                    "Axis",
                    "Kotak",
                    "PNB",
                    "Yes Bank",
                    "Canara",
                    "Union Bank",
                  ].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Google Pay / PhonePe sub-mode */}
            {(gpayActive || phonepeActive) && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Choose for {upiProvider}:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setUpiSubMode("qr");
                      if (errors.upiSubMode)
                        setErrors({ ...errors, upiSubMode: "" });
                    }}
                    className={`rounded-xl border-2 p-3 text-center transition-smooth ${upiSubMode === "qr" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    data-ocid="modal-upi-qr-btn"
                  >
                    <div className="text-xl mb-1">📷</div>
                    <p className="text-xs font-semibold text-foreground">
                      QR Code
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUpiSubMode("transfer");
                      if (errors.upiSubMode)
                        setErrors({ ...errors, upiSubMode: "" });
                    }}
                    className={`rounded-xl border-2 p-3 text-center transition-smooth ${upiSubMode === "transfer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    data-ocid="modal-upi-transfer-btn"
                  >
                    <div className="text-xl mb-1">🏦</div>
                    <p className="text-xs font-semibold text-foreground">
                      Bank Transfer
                    </p>
                  </button>
                </div>
                <FieldError msg={errors.upiSubMode} />
                {upiSubMode === "qr" && (
                  <DummyQR provider={upiProvider} amount={amount} />
                )}
                {upiSubMode === "transfer" && (
                  <BankTransferDetails amount={amount} />
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              This is a simulated payment. No real charges will be made.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePay}
                className={`flex-1 bg-accent text-accent-foreground hover:bg-accent/90 ${hasErrors ? "opacity-50 cursor-not-allowed" : ""}`}
                data-ocid="pay-now-btn"
              >
                {payButtonLabel}
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-10 flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-accent animate-spin" />
            </div>
            <p className="font-semibold">Processing Payment...</p>
            <p className="text-sm text-muted-foreground">
              Please wait, do not close this window
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="py-10 flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-bold text-lg text-green-600">
              Payment Successful!
            </p>
            {payRef && (
              <p className="font-mono text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">
                Ref: {payRef}
              </p>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Generating your booking confirmation...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
