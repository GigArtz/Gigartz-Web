import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAUserProfile, saveCardDetails } from "../../store/profileSlice";
import { RootState, AppDispatch } from "store/store";

interface Card {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

const PaymentDetails: React.FC = () => {
  const { profile, userProfile } = useSelector(
    (state: RootState) => state.profile
  );
  const { uid } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [cards, setCards] = useState<Card[]>([]);
  const [form, setForm] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // clear error for this field while typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validateField(name, value);
    setErrors((prev) => ({ ...prev, ...fieldErrors }));
  };

  // Luhn algorithm for card number validation
  const luhnCheck = (num: string) => {
    const digits = num
      .replace(/\s+/g, "")
      .split("")
      .reverse()
      .map((d) => parseInt(d, 10));
    if (digits.some((d) => Number.isNaN(d))) return false;
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      let digit = digits[i];
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  type FormKey = keyof typeof form;
  const validateField = (name: FormKey | string, value: string) => {
    const out: Record<string, string> = {};
    if (name === "cardNumber") {
      const cleaned = value.replace(/\s+/g, "");
      if (!/^\d{13,19}$/.test(cleaned))
        out.cardNumber = "Card number must be 13-19 digits.";
      else if (!luhnCheck(cleaned)) out.cardNumber = "Invalid card number.";
    }
    if (name === "cardHolder") {
      if (!value.trim()) out.cardHolder = "Cardholder name is required.";
    }
    if (name === "expiry") {
      if (!/^\d{2}\/\d{2}$/.test(value))
        out.expiry = "Expiry must be in MM/YY format.";
      else {
        const [mm, yy] = value.split("/").map((s) => parseInt(s, 10));
        if (mm < 1 || mm > 12)
          out.expiry = "Expiry month must be between 01 and 12.";
        else {
          const now = new Date();
          const currentYear = now.getFullYear() % 100; // two digits
          const currentMonth = now.getMonth() + 1;
          if (yy < currentYear || (yy === currentYear && mm < currentMonth))
            out.expiry = "Card has expired.";
        }
      }
    }
    if (name === "cvv") {
      if (!/^\d{3,4}$/.test(value)) out.cvv = "CVV must be 3 or 4 digits.";
    }
    return out;
  };

  const validateAll = () => {
    const fields: Array<FormKey> = [
      "cardNumber",
      "cardHolder",
      "expiry",
      "cvv",
    ];
    const result: Record<string, string> = {};
    for (const f of fields) {
      Object.assign(result, validateField(f, form[f]));
    }
    setErrors(result);
    return Object.keys(result).length === 0;
  };

  // Synchronous validator that doesn't mutate state (useful for immediate checks)
  const getErrorsForForm = (sourceForm = form) => {
    const fields: Array<FormKey> = [
      "cardNumber",
      "cardHolder",
      "expiry",
      "cvv",
    ];
    const result: Record<string, string> = {};
    for (const f of fields) {
      Object.assign(result, validateField(f, sourceForm[f]));
    }
    return result;
  };

  const focusFirstInvalid = (errs: Record<string, string>) => {
    const order: Array<keyof typeof form> = [
      "cardNumber",
      "cardHolder",
      "expiry",
      "cvv",
    ];
    for (const key of order) {
      if (errs[key]) {
        const el = document.getElementById(key) as HTMLInputElement | null;
        if (el) {
          el.focus();
        }
        break;
      }
    }
  };

  const resetForm = () => {
    setForm({ cardNumber: "", cardHolder: "", expiry: "", cvv: "" });
    setEditingId(null);
  };

  // Type guard to detect Promise-like objects without using `any`
  const isThenable = (
    v: unknown
  ): v is { then: (...args: unknown[]) => unknown } => {
    if (!v || typeof v !== "object") return false;
    // check if a 'then' function exists
    const then = (v as { then?: unknown }).then;
    return typeof then === "function";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // validate before submit
    console.log("saving...");
    const isValid = validateAll();
    console.log(
      "[PaymentDetails] handleSubmit called. isValid=",
      isValid,
      "form=",
      form,
      "uid=",
      uid
    );
    if (!isValid) {
      // show errors for all fields when submit attempted
      setTouched({
        cardNumber: true,
        cardHolder: true,
        expiry: true,
        cvv: true,
      });
      // focus first invalid field for better UX
      const errs = getErrorsForForm();
      focusFirstInvalid(errs);
      return;
    }

    if (editingId) {
      // Edit existing card
      setCards((prev) =>
        prev.map((card) =>
          card.id === editingId ? { ...card, ...form } : card
        )
      );
      // also dispatch update/save to backend if uid available
      if (uid) {
        const cleaned = form.cardNumber.replace(/\s+/g, "");
        const [expMonth, expYear] = form.expiry.split("/");
        console.log("[PaymentDetails] dispatching saveCardDetails (update)", {
          uid,
          cleaned,
          expMonth,
          expYear,
          cardHolder: form.cardHolder,
        });
        const p = dispatch(
          saveCardDetails(
            uid,
            cleaned,
            expMonth,
            expYear,
            form.cardHolder,
            form.cvv
          )
        );
        // log promise resolution for thunk if it returns a thenable
        if (isThenable(p)) {
          p.then((res) =>
            console.log(
              "[PaymentDetails] saveCardDetails resolved (update):",
              res
            )
          ).catch((err) =>
            console.error(
              "[PaymentDetails] saveCardDetails error (update):",
              err
            )
          );
        }
      } else {
        console.warn("No uid available; skipping saveCardDetails dispatch");
      }
    } else {
      // Add new card
      const newCard = { id: crypto.randomUUID(), ...form };
      setCards((prev) => [...prev, newCard]);
      if (uid) {
        const cleaned = form.cardNumber.replace(/\s+/g, "");
        const [expMonth, expYear] = form.expiry.split("/");
        console.log("[PaymentDetails] dispatching saveCardDetails (add)", {
          uid,
          cleaned,
          expMonth,
          expYear,
          cardHolder: form.cardHolder,
        });
        const p = dispatch(
          saveCardDetails(
            uid,
            cleaned,
            expMonth,
            expYear,
            form.cardHolder,
            form.cvv
          )
        );
        if (isThenable(p)) {
          p.then((res) =>
            console.log("[PaymentDetails] saveCardDetails resolved (add):", res)
          ).catch((err) =>
            console.error("[PaymentDetails] saveCardDetails error (add):", err)
          );
        }
      } else {
        console.warn("No uid available; skipping saveCardDetails dispatch");
      }
    }
    resetForm();
  };

  const handleEdit = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (card) {
      setForm({
        cardNumber: card.cardNumber,
        cardHolder: card.cardHolder,
        expiry: card.expiry,
        cvv: card.cvv,
      });
      setEditingId(id);
    }
  };

  const handleRemove = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    if (editingId === id) resetForm();
  };

  useEffect(() => {
    if (profile) {
      void dispatch(fetchAUserProfile(uid));
    }
    console.log("profile:", userProfile);
  }, [profile, uid, dispatch, userProfile]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h3 className="text-xl font-semibold mb-4">Bank Details</h3>
      <p className="mb-6 text-gray-400">
        Add, edit, or remove bank card information.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mb-8 space-y-4 bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <div>
          <label className="block text-gray-300 mb-1" htmlFor="cardNumber">
            Card Number
          </label>
          <input
            id="cardNumber"
            name="cardNumber"
            value={form.cardNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            maxLength={19}
            placeholder="1234 5678 9012 3456"
            className="w-full rounded px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-teal-400"
            aria-invalid={Boolean(errors.cardNumber)}
          />
          {errors.cardNumber && touched.cardNumber && (
            <p className="text-sm text-red-400 mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-1" htmlFor="cardHolder">
            Cardholder Name
          </label>
          <input
            id="cardHolder"
            name="cardHolder"
            value={form.cardHolder}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="John Doe"
            className="w-full rounded px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-teal-400"
            aria-invalid={Boolean(errors.cardHolder)}
          />
          {errors.cardHolder && touched.cardHolder && (
            <p className="text-sm text-red-400 mt-1">{errors.cardHolder}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-300 mb-1" htmlFor="expiry">
              MM/YY
            </label>
            <input
              id="expiry"
              name="expiry"
              value={form.expiry}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="12/34"
              maxLength={5}
              className="w-full rounded px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-teal-400"
              aria-invalid={Boolean(errors.expiry)}
            />
            {errors.expiry && touched.expiry && (
              <p className="text-sm text-red-400 mt-1">{errors.expiry}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-gray-300 mb-1" htmlFor="cvv">
              CVV
            </label>
            <input
              id="cvv"
              name="cvv"
              value={form.cvv}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              maxLength={4}
              placeholder="123"
              className="w-full rounded px-3 py-2 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-teal-400"
              aria-invalid={Boolean(errors.cvv)}
            />
            {errors.cvv && touched.cvv && (
              <p className="text-sm text-red-400 mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-teal-500 hover:bg-teal-600 transition py-2 rounded text-white font-semibold disabled:opacity-60"
          disabled={Object.keys(getErrorsForForm()).length > 0}
        >
          {editingId ? "Update Card" : "Add Card"}
        </button>
      </form>

      {/* Cards List */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {cards.length === 0 && (
          <p className="text-gray-400">No cards added yet.</p>
        )}

        {cards.map(({ id, cardNumber, cardHolder, expiry }) => (
          <div
            key={id}
            className="bg-gray-800 rounded-lg p-4 shadow-md relative"
          >
            <div className="mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Card Number
              </p>
              <p className="text-white font-mono text-lg tracking-widest">
                {/* Mask all but last 4 digits */}
                {cardNumber
                  .replace(/\s+/g, "")
                  .replace(/.(?=.{4})/g, "*")
                  .replace(/(.{4})/g, "$1 ")
                  .trim()}
              </p>
            </div>

            <div className="mb-2">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Cardholder
              </p>
              <p className="text-white">{cardHolder}</p>
            </div>

            <div className="mb-2">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Expiry
              </p>
              <p className="text-white">{expiry}</p>
            </div>

            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={() => handleEdit(id)}
                className="px-2 py-1 bg-teal-500 hover:bg-teal-600 rounded text-xs text-white"
                aria-label="Edit card"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove(id)}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
                aria-label="Remove card"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Email Notifications */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-2">Email Notifications</h4>

        {/* Toggle switch */}
        <div className="flex flex-row items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md">
          <p>Email Notifications</p>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              // checked={emailNotifications}
              // onChange={() => setEmailNotifications(!emailNotifications)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
          </label>
        </div>
      </div>

      {/* Purchase History */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">Purchase History</h4>
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-gray-400">No purchases yet.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
