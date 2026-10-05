import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../../components/homeNavbar";
import Coin from "../../assets/coin.png";
import CoinHeader from "../../assets/coin-header.png";
import { apiRequest, assetUrl, getCachedUser, isSignedIn } from "../../services/api";
import { AirtimePanel } from "./airtime";

const money = (minor, currency) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 2,
  }).format(Number(minor || 0) / 100);
const dateTime = (value) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
const transactionDetail = (item) =>
  item.reference?.startsWith("game-action:")
    ? item.action_name?.replaceAll("_", " ")
    : item.reference?.startsWith("household-transfer:")
      ? "Household transfer"
    : item.reference;

export default function CoinShop() {
  const cachedPlayer = getCachedUser();
  const canPurchaseCoins = !cachedPlayer?.parent_user_id && cachedPlayer?.isPrimary !== false;
  const [activeTab, setActiveTab] = useState(() => ["airtime", "transfer"].includes(new URLSearchParams(window.location.search).get("tab")) ? new URLSearchParams(window.location.search).get("tab") : "packages");
  const [packages, setPackages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState("");
  const [notice, setNotice] = useState("");
  const [children, setChildren] = useState([]);
  const [transfer, setTransfer] = useState({ recipientId: "", amount: "" });
  const [transferring, setTransferring] = useState(false);
  const pendingTransfer = useRef(null);
  const signedIn = isSignedIn();

  useEffect(() => { if (!canPurchaseCoins && activeTab === "transfer") setActiveTab("packages"); }, [activeTab, canPurchaseCoins]);

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const packageData = await apiRequest("/coins/packages");
        if (!live) return;
        setPackages(packageData.packages || []);
        if (signedIn) {
          const [wallet, history, recipients] = await Promise.all([
            apiRequest("/coins/me"),
            apiRequest("/coins/me/transactions?limit=50"),
            canPurchaseCoins ? apiRequest("/coins/transfer-recipients").catch(() => ({ recipients: [] })) : Promise.resolve({ recipients: [] }),
          ]);
          if (!live) return;
          setBalance(wallet.balance);
          setTransactions(history.transactions || []);
          setChildren(recipients.recipients || []);
          setTransfer((current) => ({ ...current, recipientId: current.recipientId || recipients.recipients?.[0]?.id || "" }));
        }
      } catch (e) {
        if (live) setError(e.message);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [signedIn, canPurchaseCoins]);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const transactionId = query.get("transaction_id");
    const txRef = query.get("tx_ref");
    const status = query.get("status");
    if (!transactionId || !txRef) return;
    window.history.replaceState({}, "", window.location.pathname);
    if (status !== "successful" && status !== "completed") {
      setError("Payment was not completed. No coins were added.");
      return;
    }
    setLoading(true);
    apiRequest("/coins/purchases/verify", {
      method: "POST",
      body: JSON.stringify({ transactionId, txRef }),
    }).then(async (result) => {
      setNotice(result.credited ? "Payment verified. Your coins have been added." : "This payment was already credited.");
      const [wallet, history] = await Promise.all([
        apiRequest("/coins/me"),
        apiRequest("/coins/me/transactions?limit=50"),
      ]);
      setBalance(wallet.balance);
      setTransactions(history.transactions || []);
      setActiveTab("history");
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  const purchase = async (packageId) => {
    setBuying(packageId);
    setError("");
    setNotice("");
    try {
      const result = await apiRequest("/coins/purchases", {
        method: "POST",
        body: JSON.stringify({ packageId }),
      });
      window.location.assign(result.checkoutUrl);
    } catch (e) {
      setError(e.message);
      setBuying("");
    }
  };
  const submitTransfer = async (event) => {
    event.preventDefault();
    const amount = Number(transfer.amount);
    if (!transfer.recipientId || !Number.isInteger(amount) || amount < 1) { setError("Choose a child and enter a whole number of coins."); return; }
    setTransferring(true); setError(""); setNotice("");
    try {
      const signature = `${transfer.recipientId}:${amount}`;
      if (pendingTransfer.current?.signature !== signature) pendingTransfer.current = { signature, id: crypto.randomUUID() };
      const result = await apiRequest("/coins/transfers", { method: "POST", body: JSON.stringify({ recipientId: transfer.recipientId, amount, clientTransferId: pendingTransfer.current.id }) });
      setBalance(result.senderBalance);
      setChildren((current) => current.map((child) => child.id === transfer.recipientId ? { ...child, balance: result.recipientBalance } : child));
      setTransfer((current) => ({ ...current, amount: "" }));
      const history = await apiRequest("/coins/me/transactions?limit=50");
      setTransactions(history.transactions || []);
      setNotice(`${amount.toLocaleString()} coins sent to ${result.recipient?.name || "the selected child"}.`);
      pendingTransfer.current = null;
    } catch (e) { setError(e.message); }
    finally { setTransferring(false); }
  };
  const groups = useMemo(
    () =>
      transactions.reduce((all, item) => {
        const key = new Intl.DateTimeFormat("en-NG", {
          month: "long",
          year: "numeric",
        }).format(new Date(item.created_at));
        (all[key] ||= []).push(item);
        return all;
      }, {}),
    [transactions],
  );

  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-slate-100 p-3 sm:p-6">
        <section className="mx-auto w-full max-w-7xl rounded-3xl bg-white p-4 shadow-sm sm:p-8">
          <div className="mb-7 flex flex-col items-center">
            <img src={CoinHeader} alt="Coin shop" className="w-full max-w-xl" />
            {balance !== null && (
              <div className="mt-3 rounded-full bg-amber-50 px-5 py-2 font-bold text-amber-700">
                Balance: {Number(balance).toLocaleString()} coins
              </div>
            )}
          </div>
          <div className="mb-6 flex w-full gap-2 overflow-x-auto border-b border-slate-100 px-1 font-bold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-8 sm:justify-center sm:gap-8">
            {[
              ["packages", "Coin packages"],
              ...(canPurchaseCoins ? [["transfer", "Transfer to child"]] : []),
              ["history", "Transaction history"],
              ["airtime", "Buy airtime"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => {setActiveTab(id);window.history.replaceState({},"",["airtime","transfer"].includes(id)?`/shop?tab=${id}`:"/shop")}}
                className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 pb-3 text-sm sm:text-base ${activeTab === id ? "border-[#9B5DE5] text-[#9B5DE5]" : "border-transparent text-gray-400"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {activeTab !== "airtime" && error && (
            <div
              role="alert"
              className="mb-6 rounded-xl bg-red-50 p-4 text-red-700"
            >
              {error}
            </div>
          )}
          {activeTab !== "airtime" && notice && <div role="status" className="mb-6 rounded-xl bg-emerald-50 p-4 text-emerald-700">{notice}</div>}
          {activeTab === "packages" && !canPurchaseCoins && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">For parental safety, real-money coin purchases are available only from the main household profile. Return Home and choose the main profile to purchase.</div>}
          {activeTab === "airtime" ? <AirtimePanel/> : loading ? (
            <div className="py-20 text-center text-gray-500">
              Loading your coin shop…
            </div>
          ) : activeTab === "packages" ? (
            <>
              {packages.length ? (
                <div className="grid grid-cols-1 gap-5 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {packages.map((pkg) => (
                    <article
                      key={pkg.id}
                      className="flex flex-col items-center rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50 to-white p-5 text-center shadow-sm"
                    >
                      <span className="mb-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-600">
                        {pkg.name}
                      </span>
                      <img
                        src={Coin}
                        alt=""
                        className="my-2 h-24 w-24 object-contain"
                      />
                      <h2 className="text-xl font-black text-slate-900">
                        {Number(pkg.coins).toLocaleString()} coins
                      </h2>
                      {pkg.description && (
                        <p className="mt-2 min-h-10 text-sm text-slate-500">
                          {pkg.description}
                        </p>
                      )}
                      <button
                        type="button"
                        disabled={Boolean(buying) || !canPurchaseCoins}
                        onClick={() => purchase(pkg.id)}
                        className="mt-5 w-full cursor-pointer rounded-full bg-[#9B5DE5] px-4 py-2 font-bold text-white disabled:cursor-wait disabled:opacity-60"
                      >
                        {buying === pkg.id ? "Opening secure checkout…" : canPurchaseCoins ? `Buy for ${money(pkg.price_minor, pkg.currency)}` : "Main profile required"}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-gray-500">
                  No coin packages are available right now.
                </div>
              )}
              <p className="mt-7 text-center text-xs text-slate-400">Payments are securely processed by Flutterwave. Coins are added only after server verification.</p>
            </>
          ) : activeTab === "transfer" ? (
            <div className="mx-auto max-w-2xl">
              <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 sm:p-8">
                <h2 className="text-2xl font-black text-slate-900">Send coins to a child</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Move coins from the main profile balance to any child linked to this household. Transfers cannot exceed your available balance.</p>
                {children.length ? <form onSubmit={submitTransfer} className="mt-7 space-y-5">
                  <fieldset><legend className="mb-3 text-sm font-black text-slate-700">Choose a child</legend><div className="grid gap-3 sm:grid-cols-2">{children.map((child) => <label key={child.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-4 transition ${transfer.recipientId === child.id ? "border-purple-500 ring-4 ring-purple-100" : "border-slate-100 hover:border-purple-200"}`}><input type="radio" name="recipient" value={child.id} checked={transfer.recipientId === child.id} onChange={(event) => setTransfer((current) => ({ ...current, recipientId: event.target.value }))} className="sr-only"/><span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-purple-100 text-lg font-black text-purple-700">{child.profileImageUrl ? <img src={assetUrl(child.profileImageUrl)} alt="" className="h-full w-full object-cover"/> : child.name?.slice(0,1)?.toUpperCase()}</span><span className="min-w-0"><strong className="block truncate text-slate-900">{child.name}</strong><span className="text-xs font-semibold text-slate-400">{Number(child.balance).toLocaleString()} coins</span></span></label>)}</div></fieldset>
                  <label className="block text-sm font-black text-slate-700">Amount<input type="number" inputMode="numeric" required min="1" max={Math.max(1, Number(balance || 0))} step="1" value={transfer.amount} onChange={(event) => setTransfer((current) => ({ ...current, amount: event.target.value }))} placeholder="Enter number of coins" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"/></label>
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm"><span className="font-semibold text-amber-800">Available to transfer</span><strong className="text-amber-900">{Number(balance || 0).toLocaleString()} coins</strong></div>
                  <button type="submit" disabled={transferring || Number(balance || 0) < 1} className="w-full rounded-xl bg-purple-600 px-5 py-3 font-black text-white shadow-lg transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50">{transferring ? "Sending coins…" : "Transfer coins"}</button>
                </form> : <div className="mt-7 rounded-2xl border-2 border-dashed border-purple-200 bg-white p-8 text-center"><p className="font-black text-slate-800">No linked child profiles yet</p><p className="mt-1 text-sm text-slate-500">Add a child from the family player-selection page before transferring coins.</p></div>}
              </div>
            </div>
          ) : !signedIn ? (
            <div className="py-20 text-center text-gray-500">
              Sign in to view your coin history.
            </div>
          ) : transactions.length ? (
            <div className="space-y-7">
              {Object.entries(groups).map(([month, items]) => (
                <section key={month}>
                  <h2 className="mb-3 font-bold text-slate-700">{month}</h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 sm:p-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={Coin}
                            alt=""
                            className="h-12 w-12 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {item.description}
                            </p>
                            <p className="text-xs text-slate-400">
                              {dateTime(item.created_at)}
                              {transactionDetail(item)
                                ? ` · ${transactionDetail(item)}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-black ${Number(item.amount) >= 0 ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {Number(item.amount) > 0 ? "+" : ""}
                            {Number(item.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-400">
                            Balance{" "}
                            {Number(item.balance_after).toLocaleString()}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500">
              No coin transactions yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
