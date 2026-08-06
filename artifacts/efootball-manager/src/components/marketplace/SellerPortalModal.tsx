import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AccountListing, SellerAccount, SellerReview } from '@/types/marketplace';
import { 
  X, 
  Inbox, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Star, 
  Plus, 
  Lock, 
  Sparkles, 
  Mail, 
  ShieldCheck, 
  Tag, 
  User, 
  RefreshCw, 
  Check, 
  Zap, 
  DollarSign
} from 'lucide-react';

interface SellerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerAccount: SellerAccount | null;
  listings?: AccountListing[];
  sellerListings?: AccountListing[];
  reviews?: SellerReview[];
  onOpenNewListingModal?: () => void;
  onOpenNewListing?: () => void;
  onStartEscrowWithAgreedPrice?: (listing: AccountListing, agreedPrice: number) => void;
  onLogoutSeller?: () => void;
}

interface SellerChatThread {
  buyerName: string;
  listingTitle: string;
  listingPrice: number;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  conversationId: string;
  messages: {
    id: string;
    sender: 'buyer' | 'seller';
    senderName: string;
    text: string;
    timestamp: string;
    offerAmount?: number;
    offerStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
    encrypted?: boolean;
    ciphertext?: string;
    iv?: string;
  }[];
}

export const SellerPortalModal: React.FC<SellerPortalModalProps> = ({
  isOpen,
  onClose,
  sellerAccount,
  listings = [],
  sellerListings: explicitSellerListings,
  reviews = [],
  onOpenNewListingModal,
  onOpenNewListing,
  onStartEscrowWithAgreedPrice,
  onLogoutSeller,
}) => {
  if (!isOpen || !sellerAccount) return null;

  const handleOpenNewListing = () => {
    if (onOpenNewListingModal) onOpenNewListingModal();
    else if (onOpenNewListing) onOpenNewListing();
    onClose();
  };

  // Filter listings belonging to this seller
  const displayListings = explicitSellerListings || listings.filter(
    l => l?.sellerUserId === sellerAccount.id
      || (!l?.sellerUserId && l?.sellerName?.toLowerCase() === sellerAccount.username?.toLowerCase())
  );

  const [threads, setThreads] = useState<SellerChatThread[]>([]);
  const [activeThreadIndex, setActiveThreadIndex] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);
  const privateKeyRef = useRef<CryptoKey | null>(null);
  const publicKeyRef = useRef<CryptoKey | null>(null);
  const sharedSecretRef = useRef<CryptoKey | null>(null);
  const [replyInput, setReplyInput] = useState<string>('');
  const [counterPriceInput, setCounterPriceInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chats' | 'my_listings' | 'reviews'>('chats');

  const activeThread = threads[activeThreadIndex];

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  };

  const base64ToArrayBuffer = (value: string) => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  useEffect(() => {
    if (!isOpen || !sellerAccount) return;

    const socket = io((globalThis as typeof globalThis & { __APP_SOCKET_URL__?: string }).__APP_SOCKET_URL__ || 'http://localhost:3000', { transports: ['websocket'] });
    socketRef.current = socket;

    const initializeEncryption = async () => {
      const keyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
      privateKeyRef.current = keyPair.privateKey;
      publicKeyRef.current = keyPair.publicKey;
      const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
      socket.emit('chat-key-exchange', {
        conversationId: 'seller-portal',
        publicKey: JSON.stringify(publicKeyJwk),
        senderId: 'seller',
        senderName: sellerAccount.username,
        senderRole: 'seller',
      });
    };

    socket.on('connect', () => {
      initializeEncryption();
    });

    socket.on('chat-key-exchange', async (data: { publicKey: string; senderName: string }) => {
      if (!privateKeyRef.current) return;
      try {
        const remotePublicKey = await crypto.subtle.importKey('jwk', JSON.parse(data.publicKey), { name: 'ECDH', namedCurve: 'P-256' }, true, []);
        sharedSecretRef.current = await crypto.subtle.deriveKey(
          { name: 'ECDH', public: remotePublicKey },
          privateKeyRef.current,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt'],
        );
      } catch (error) {
        console.error('Seller portal key exchange failed', error);
      }
    });

    socket.on('chat-message', async (message: SellerChatThread['messages'][number]) => {
      setThreads(prev => {
        const exists = prev.find(t => t.conversationId === 'seller-portal');
        if (exists) {
          return prev.map(t => t.conversationId === 'seller-portal' ? {
            ...t,
            lastMessage: message.text,
            messages: [...t.messages, message],
          } : t);
        }
        return [...prev, {
          buyerName: 'Buyer',
          listingTitle: 'Encrypted Negotiation',
          listingPrice: 0,
          lastMessage: message.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          conversationId: 'seller-portal',
          messages: [message],
        }];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, sellerAccount]);

  const encryptReply = async (text: string) => {
    if (!sharedSecretRef.current) return null;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sharedSecretRef.current, encoded);
    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)),
    };
  };

  const handleSendSellerReply = async (textToSend?: string) => {
    const text = textToSend || replyInput;
    if (!text.trim() || !activeThread) return;

    const payload = await encryptReply(text.trim());
    const newMsg = {
      id: `smsg-${Date.now()}`,
      sender: 'seller' as const,
      senderName: sellerAccount.username,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encrypted: Boolean(payload),
      ciphertext: payload?.ciphertext,
      iv: payload?.iv,
    };

    setThreads(prev =>
      prev.map((t, idx) =>
        idx === activeThreadIndex
          ? {
              ...t,
              lastMessage: text.trim(),
              messages: [...t.messages, newMsg],
            }
          : t
      )
    );

    if (socketRef.current && payload) {
      socketRef.current.emit('chat-message', {
        conversationId: 'seller-portal',
        message: newMsg,
      });
    }

    if (!textToSend) setReplyInput('');
  };

  const handleAcceptBuyerOffer = (msgId: string, amount: number) => {
    setThreads(prev =>
      prev.map((t, idx) => {
        if (idx !== activeThreadIndex) return t;
        return {
          ...t,
          messages: t.messages.map(m =>
            m.id === msgId ? { ...m, offerStatus: 'accepted' as const } : m
          ),
        };
      })
    );

    handleSendSellerReply(`🎉 I have accepted your offer of $${amount} USD! You can now proceed to deposit Escrow.`);
  };

  const handleCounterBuyerOffer = (msgId: string) => {
    const counterAmount = parseFloat(counterPriceInput);
    if (isNaN(counterAmount) || counterAmount <= 0) return;

    setThreads(prev =>
      prev.map((t, idx) => {
        if (idx !== activeThreadIndex) return t;
        return {
          ...t,
          messages: t.messages.map(m =>
            m.id === msgId ? { ...m, offerStatus: 'countered' as const } : m
          ),
        };
      })
    );

    handleSendSellerReply(`I countered your offer with $${counterAmount} USD (€${Math.round(counterAmount * 0.92)} EUR). Let me know if that works!`);
    setCounterPriceInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header Bar */}
        <div className="bg-indigo-950 p-4 border-b border-indigo-900/80 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-md border border-orange-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Seller Portal &amp; Buyer Inbox
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Seller
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Authenticated Email: <strong className="text-orange-400">{sellerAccount.email}</strong> • Seller: <strong className="text-amber-300">{sellerAccount.username}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewListing}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer border-b-2 border-orange-800"
            >
              <Plus className="w-4 h-4" /> Add Listing
            </button>
            {onLogoutSeller && (
              <button
                onClick={() => {
                  onLogoutSeller();
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-extrabold text-xs transition-colors border border-rose-800 cursor-pointer"
                title="Log Out & Switch Seller Account"
              >
                Log Out
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-4 border-b border-slate-800 flex items-center gap-2 text-xs font-bold shrink-0 pt-2">
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'chats'
                ? 'bg-slate-900 text-orange-400 border-t-2 border-orange-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Buyer Inquiry Chats ({threads.length})
          </button>
          <button
            onClick={() => setActiveTab('my_listings')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'my_listings'
                ? 'bg-slate-900 text-orange-400 border-t-2 border-orange-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" /> My Active Listings ({displayListings.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-slate-900 text-orange-400 border-t-2 border-orange-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Buyer Ratings &amp; Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Content: Chats */}
        {activeTab === 'chats' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Threads List */}
            <div className="w-full sm:w-72 bg-slate-950 border-r border-slate-800 overflow-y-auto shrink-0 divide-y divide-slate-800/60">
              <div className="p-3 bg-slate-900 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Buyer Threads
              </div>
              {threads.map((t, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveThreadIndex(idx)}
                  className={`p-3 cursor-pointer transition-colors ${
                    activeThreadIndex === idx
                      ? 'bg-indigo-950/80 border-l-4 border-orange-500 text-white'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-orange-400" /> {t.buyerName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.timestamp}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-300 truncate">
                    {t.listingTitle}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-1 italic">
                    "{t.lastMessage}"
                  </p>
                </div>
              ))}
            </div>

            {/* Active Thread Panel */}
            <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
              {activeThread ? (
                <>
                  {/* Thread Header */}
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
                    <div>
                      <span className="font-extrabold text-white text-sm block">
                        Chat with {activeThread.buyerName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Item: {activeThread.listingTitle} (${activeThread.listingPrice})
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/40">
                      Buyer Verified
                    </span>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs bg-slate-950/40">
                    {activeThread.messages.map((m) => {
                      const isSeller = m.sender === 'seller';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] text-slate-400 font-mono mb-1">
                            {m.senderName} • {m.timestamp}
                          </div>
                          <div
                            className={`max-w-md p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isSeller
                                ? 'bg-orange-600 text-white rounded-tr-xs'
                                : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700'
                            }`}
                          >
                            <p>{m.text}</p>

                            {/* Offer status box */}
                            {m.offerAmount && (
                              <div className="mt-2 pt-2 border-t border-white/20 space-y-2 font-mono">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span>Buyer Proposed Offer:</span>
                                  <span className="text-amber-300 font-black text-sm">${m.offerAmount} USD</span>
                                </div>

                                {m.offerStatus === 'pending' && !isSeller && (
                                  <div className="pt-2 flex flex-wrap gap-2">
                                    <button
                                      onClick={() => handleAcceptBuyerOffer(m.id, m.offerAmount!)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-4 h-4" /> Accept Offer (${m.offerAmount})
                                    </button>

                                    <div className="flex items-center gap-1.5 flex-1">
                                      <input
                                        type="number"
                                        placeholder="Counter $..."
                                        value={counterPriceInput}
                                        onChange={(e) => setCounterPriceInput(e.target.value)}
                                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white outline-none font-bold"
                                      />
                                      <button
                                        onClick={() => handleCounterBuyerOffer(m.id)}
                                        className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                                      >
                                        Counter
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {m.offerStatus === 'accepted' && (
                                  <span className="text-emerald-300 font-bold flex items-center gap-1 text-xs">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Offer Accepted by You
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendSellerReply();
                    }}
                    className="p-3 bg-indigo-950 border-t border-indigo-900/80 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      placeholder={`Reply to ${activeThread.buyerName}...`}
                      className="flex-1 bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!replyInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" /> Reply
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  Select a buyer thread on the left to view negotiation messages.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: My Active Listings */}
        {activeTab === 'my_listings' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950">
            {displayListings.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      {item.platform}
                    </span>
                    <span className="text-emerald-400 font-bold">⭐ {item.epicCount} Epics</span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm">{item.title}</h4>
                  <p className="text-slate-400 text-[11px] font-mono">
                    Owner IGN: {item.ownerUsername} • Squad Rating: {item.squadRating}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-mono">Asking Price</span>
                    <span className="text-base font-black text-amber-300 font-mono">${item.price} USD</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === 'reviews' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs">{rev.buyerName}</span>
                    <span className="text-amber-400 font-bold text-xs flex items-center gap-0.5">
                      {'⭐'.repeat(rev.rating)} ({rev.rating}.0)
                    </span>
                    {rev.verifiedPurchase && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Verified Escrow Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed italic">"{rev.comment}"</p>

                {rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rev.tags.map((tg, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-orange-300 border border-slate-700">
                        ✓ {tg}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
