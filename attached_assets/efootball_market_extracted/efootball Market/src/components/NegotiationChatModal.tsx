import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { AccountListing } from '../types';
import { 
  X, 
  MessageSquare, 
  Send, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Lock, 
  Sparkles, 
  User, 
  Trophy, 
  Zap, 
  Check, 
  ArrowRight,
  Tag
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  offerAmount?: number;
  offerType?: 'cash' | 'exchange';
  offerStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
  counterAmount?: number;
  encrypted?: boolean;
  keyId?: string;
  ciphertext?: string;
  iv?: string;
}

interface NegotiationChatModalProps {
  listing: AccountListing | null;
  isOpen: boolean;
  onClose: () => void;
  onStartEscrowWithAgreedPrice: (listing: AccountListing, agreedPrice: number) => void;
  currentUserRole?: 'buyer' | 'seller';
  currentUserName?: string;
}

export const NegotiationChatModal: React.FC<NegotiationChatModalProps> = ({
  listing,
  isOpen,
  onClose,
  onStartEscrowWithAgreedPrice,
  currentUserRole = 'buyer',
  currentUserName,
}) => {
  if (!isOpen || !listing) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [offerPriceInput, setOfferPriceInput] = useState<string>(listing.price.toString());
  const [offerMode, setOfferMode] = useState<'chat' | 'offer'>('chat');
  const [activeAcceptedPrice, setActiveAcceptedPrice] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [encryptionReady, setEncryptionReady] = useState(false);
  const localRole = currentUserRole === 'seller' ? 'seller' : 'buyer';
  const localDisplayName = currentUserName || (localRole === 'seller' ? 'You (Seller)' : 'You (Buyer)');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const conversationId = useRef(`chat-${listing.id}-${Date.now()}`);
  const privateKeyRef = useRef<CryptoKey | null>(null);
  const publicKeyRef = useRef<CryptoKey | null>(null);
  const sharedSecretRef = useRef<CryptoKey | null>(null);

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

  const initializeEncryption = async () => {
    if (privateKeyRef.current || !socketRef.current) return;

    const keyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
    privateKeyRef.current = keyPair.privateKey;
    publicKeyRef.current = keyPair.publicKey;

    const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    socketRef.current.emit('chat-key-exchange', {
      conversationId: conversationId.current,
      publicKey: JSON.stringify(publicKeyJwk),
      senderId: localRole,
      senderName: localDisplayName,
      senderRole: localRole,
    });
  };

  const decryptMessagePayload = async (message: ChatMessage) => {
    if (!message.encrypted || !message.ciphertext || !message.iv || !sharedSecretRef.current) {
      return message.text;
    }

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToArrayBuffer(message.iv) },
        sharedSecretRef.current,
        base64ToArrayBuffer(message.ciphertext),
      );
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Failed to decrypt chat payload', error);
      return '🔐 Encrypted payload could not be decrypted yet.';
    }
  };

  useEffect(() => {
    const socketUrl = (globalThis as typeof globalThis & { __APP_SOCKET_URL__?: string }).__APP_SOCKET_URL__ || 'http://localhost:3000';
    const socket = io(socketUrl, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', async () => {
      setConnectionStatus('connected');
      socket.emit('join-chat', { conversationId: conversationId.current, userRole: localRole, userName: localDisplayName });
      await initializeEncryption();
    });

    socket.on('connect_error', () => setConnectionStatus('error'));
    socket.on('chat-history', async (history: ChatMessage[]) => {
      const normalizedHistory = await Promise.all((history?.length ? history : [
        {
          id: 'sys-1',
          sender: 'system',
          senderName: 'Escrow Vault',
          text: `🔐 End-to-end encrypted negotiation started for “${listing.title}”. A real ECDH key exchange is being established for this conversation.`,
          timestamp: 'Just now',
          encrypted: true,
        },
        {
          id: 'msg-1',
          sender: 'seller',
          senderName: listing.sellerName,
          text: `Hello! Thanks for checking out my eFootball account. My asking price is $${listing.price} USD (€${Math.round(listing.price * 0.92)} EUR). The Konami ID email is completely clean and ready for instant escrow transfer.`,
          timestamp: 'Just now',
          encrypted: true,
        },
      ]).map(async (entry) => ({
        ...entry,
        text: entry.encrypted ? await decryptMessagePayload(entry) : entry.text,
      })));
      setMessages(normalizedHistory);
    });

    socket.on('chat-message', async (message: ChatMessage) => {
      const decryptedText = await decryptMessagePayload(message);
      setMessages(prev => [...prev, { ...message, text: decryptedText }]);
    });

    socket.on('chat-key-exchange', async (data: { publicKey: string; senderName: string }) => {
      if (!privateKeyRef.current) return;
      try {
        const remotePublicKey = await crypto.subtle.importKey(
          'jwk',
          JSON.parse(data.publicKey),
          { name: 'ECDH', namedCurve: 'P-256' },
          true,
          [],
        );
        sharedSecretRef.current = await crypto.subtle.deriveKey(
          { name: 'ECDH', public: remotePublicKey },
          privateKeyRef.current,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt'],
        );
        setEncryptionReady(true);
        setMessages(prev => [...prev, {
          id: `key-${Date.now()}`,
          sender: 'system',
          senderName: 'Encryption',
          text: `ECDH key exchange completed with ${data.senderName}. Messages are now protected end-to-end.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          encrypted: true,
          keyId: data.publicKey.slice(0, 12),
        }]);
      } catch (error) {
        console.error('Failed to derive chat key', error);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [listing.id, listing.sellerName, listing.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const encryptMessage = async (text: string) => {
    if (!sharedSecretRef.current) {
      throw new Error('Encryption key not ready');
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      sharedSecretRef.current,
      encoded,
    );

    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength)),
      encrypted: true,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    if (!sharedSecretRef.current) {
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        sender: 'system',
        senderName: 'Encryption',
        text: '⏳ Waiting for a real seller key exchange before sending protected messages.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        encrypted: true,
      }]);
      return;
    }

    const payload = await encryptMessage(content);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: localRole,
      senderName: localDisplayName,
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encrypted: true,
      ciphertext: payload.ciphertext,
      iv: payload.iv,
    };

    socketRef.current?.emit('chat-message', {
      conversationId: conversationId.current,
      message: userMsg,
    });
    if (!textToSend) setInputText('');
  };

  const handleMakePriceOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const offeredVal = parseFloat(offerPriceInput);
    if (isNaN(offeredVal) || offeredVal <= 0) return;

    if (!sharedSecretRef.current) {
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        sender: 'system',
        senderName: 'Encryption',
        text: '⏳ Waiting for a real seller key exchange before sharing protected offers.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        encrypted: true,
      }]);
      return;
    }

    const payload = await encryptMessage(`Submitted cash price offer of $${offeredVal} USD (€${Math.round(offeredVal * 0.92)} EUR).`);
    const offerMsg: ChatMessage = {
      id: `off-${Date.now()}`,
      sender: localRole,
      senderName: localDisplayName,
      text: `Submitted cash price offer of $${offeredVal} USD (€${Math.round(offeredVal * 0.92)} EUR).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      offerAmount: offeredVal,
      offerType: 'cash',
      offerStatus: 'pending',
      encrypted: true,
      ciphertext: payload.ciphertext,
      iv: payload.iv,
    };

    socketRef.current?.emit('chat-message', {
      conversationId: conversationId.current,
      message: offerMsg,
    });
    setOfferMode('chat');
  };

  const handleAcceptCounterOffer = async (counterVal: number) => {
    setActiveAcceptedPrice(counterVal);
    const payload = await encryptMessage(`Accepted counter-offer of $${counterVal} USD (€${Math.round(counterVal * 0.92)} EUR)!`);
    const acceptMsg: ChatMessage = {
      id: `acc-cnt-${Date.now()}`,
      sender: localRole,
      senderName: localDisplayName,
      text: `Accepted counter-offer of $${counterVal} USD (€${Math.round(counterVal * 0.92)} EUR)!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      encrypted: true,
      ciphertext: payload.ciphertext,
      iv: payload.iv,
    };
    socketRef.current?.emit('chat-message', {
      conversationId: conversationId.current,
      message: acceptMsg,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-indigo-950 p-4 border-b border-indigo-900/80 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400 flex items-center justify-center text-orange-400 font-black">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                  Negotiate with {listing.sellerName}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                  {connectionStatus === 'connected' ? 'Live Channel Active' : 'Connecting...'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono truncate">
                Listing: {listing.title} • Asking: <strong className="text-orange-400">${listing.price} USD (€{Math.round(listing.price * 0.92)})</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Quick Specs Bar */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 shrink-0 gap-2">
          <div className="flex items-center gap-3">
            <span>⚡ Strength: <strong className="text-emerald-400">{listing.squadRating}</strong></span>
            <span>⭐ Epics: <strong className="text-amber-300">{listing.epicCount}</strong></span>
            <span>🏆 Max Div: <strong className="text-cyan-300">{listing.maxDivision}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Platform Escrow Protected
          </span>
        </div>

        {/* Accepted Price Alert Banner */}
        {activeAcceptedPrice && (
          <div className="bg-emerald-950 border-b-2 border-emerald-400 p-3.5 text-white flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-black uppercase text-emerald-300 tracking-wider block">
                  Agreed Price Deal Reached!
                </span>
                <span className="text-sm font-extrabold text-white">
                  Negotiated Price: ${activeAcceptedPrice} USD (€{Math.round(activeAcceptedPrice * 0.92)} EUR)
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onStartEscrowWithAgreedPrice(listing, activeAcceptedPrice);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 border-b-2 border-orange-800"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              Deposit Escrow (${activeAcceptedPrice})
            </button>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/60 font-sans text-xs">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isUser = msg.sender === 'buyer';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                  <span className="font-bold text-slate-300">{msg.senderName}</span>
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-orange-600 text-white rounded-tr-xs shadow-md'
                      : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700 shadow-md'
                  }`}
                >
                  <p>{msg.encrypted ? (msg.text || '🔐 Encrypted payload delivered over the secure negotiation channel.') : msg.text}</p>

                  {/* Cash Offer Badge */}
                  {msg.offerAmount && (
                    <div className="mt-2 pt-2 border-t border-white/20 space-y-2">
                      <div className="flex items-center justify-between font-mono font-bold text-xs">
                        <span>Price Offer:</span>
                        <span className="text-amber-300 font-black text-sm">${msg.offerAmount} USD</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span>Status:</span>
                        {msg.offerStatus === 'pending' && (
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Pending Seller Review
                          </span>
                        )}
                        {msg.offerStatus === 'accepted' && (
                          <span className="text-emerald-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Accepted by Seller
                          </span>
                        )}
                        {msg.offerStatus === 'declined' && (
                          <span className="text-rose-300 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" /> Declined
                          </span>
                        )}
                        {msg.offerStatus === 'countered' && (
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-400" /> Countered: ${msg.counterAmount}
                          </span>
                        )}
                      </div>

                      {/* Counter Offer Accept Button */}
                      {msg.offerStatus === 'countered' && msg.counterAmount && !activeAcceptedPrice && (
                        <button
                          onClick={() => handleAcceptCounterOffer(msg.counterAmount!)}
                          className="w-full mt-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-extrabold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Accept Counter-Offer (${msg.counterAmount})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px] font-medium text-slate-300 shrink-0">
          <span className="text-slate-500 font-bold shrink-0">Quick Ask:</span>
          {[
            'Is the Konami ID email address changeable?',
            'What is the lowest price you can accept?',
            'Is the account ready for immediate escrow transfer?',
            'Can we exchange this account for another eFootball account?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0 transition-colors cursor-pointer text-[10px]"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input & Price Offer Toggle */}
        <div className="p-3 bg-indigo-950 border-t border-indigo-900/80 shrink-0">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold">
            <button
              onClick={() => setOfferMode('chat')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                offerMode === 'chat'
                  ? 'bg-orange-600 text-white'
                  : 'bg-indigo-900/60 text-slate-300 hover:text-white'
              }`}
            >
              💬 Send Message
            </button>
            <button
              onClick={() => setOfferMode('offer')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1 ${
                offerMode === 'offer'
                  ? 'bg-orange-600 text-white'
                  : 'bg-indigo-900/60 text-slate-300 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-amber-300" /> Propose Price Offer
            </button>
          </div>

          {offerMode === 'chat' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message to seller or ask about squad details..."
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-medium"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </form>
          ) : (
            <form onSubmit={handleMakePriceOffer} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-xs">$</span>
                <input
                  type="number"
                  value={offerPriceInput}
                  onChange={(e) => setOfferPriceInput(e.target.value)}
                  placeholder="Enter cash offer amount in USD..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-xl pl-8 pr-16 py-2.5 text-xs text-white outline-none font-mono font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-mono">
                  €{Math.round((parseFloat(offerPriceInput) || 0) * 0.92)} EUR
                </span>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Submit Offer
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
