/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SupportMessage {
  id: string;
  conversationId: string; // User ID or Phone Number or Session ID
  sender: "user" | "admin";
  senderName: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  text: string;
  attachment?: string;
  time: string;
  timestamp: number;
  readByAdmin?: boolean;
  readByUser?: boolean;
  deletedForAdmin?: boolean;
  deletedForUser?: boolean;
}

export interface SupportConversation {
  id: string; // conversationId
  userName: string;
  userPhone: string;
  userId?: string;
  lastMessage: string;
  lastTime: string;
  lastTimestamp: number;
  unreadCountForAdmin: number;
  unreadCountForUser: number;
  messages: SupportMessage[];
}

const STORAGE_KEY = "nutrien_support_conversations_v2";
const EVENT_NAME = "nutrien_chat_updated_event";

function getCurrentUserInfo() {
  try {
    const userStr = localStorage.getItem("nutrien_user");
    if (userStr) {
      const u = JSON.parse(userStr);
      return {
        id: u.id || u.phone || "user_guest",
        name: u.name || "Client Nutrien",
        phone: u.phone || "Non renseigné"
      };
    }
  } catch (e) {
    console.error(e);
  }
  return {
    id: "user_guest",
    name: "Client Nutrien",
    phone: "Invite-Guest"
  };
}

export function getAllConversations(): SupportConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: SupportConversation[] = JSON.parse(raw);
      // Sort by lastTimestamp desc
      return parsed.sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));
    }
  } catch (e) {
    console.error("Error reading support conversations:", e);
  }

  // Seed with default welcome conversation if empty
  const currentUser = getCurrentUserInfo();
  const defaultConvId = currentUser.id;
  const initialMessages: SupportMessage[] = [
    {
      id: "init-1",
      conversationId: defaultConvId,
      sender: "admin",
      senderName: "Administrateur Nutrien",
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      text: "Bonjour ! Bienvenue au Service Client Nutrien. Je suis l'Administrateur de garde. Comment puis-je vous aider aujourd'hui ?",
      time: "09:30",
      timestamp: Date.now() - 3600000,
      readByAdmin: true,
      readByUser: true
    },
    {
      id: "init-2",
      conversationId: defaultConvId,
      sender: "admin",
      senderName: "Administrateur Nutrien",
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      text: "Nos agents traitent toutes les demandes de dépôt, retrait et assistance technique 24h/24. N'hésitez pas à nous envoyer votre référence de transaction ou votre question !",
      time: "09:30",
      timestamp: Date.now() - 3500000,
      readByAdmin: true,
      readByUser: true
    }
  ];

  const defaultConv: SupportConversation = {
    id: defaultConvId,
    userName: currentUser.name,
    userPhone: currentUser.phone,
    userId: currentUser.id,
    lastMessage: initialMessages[1].text,
    lastTime: initialMessages[1].time,
    lastTimestamp: initialMessages[1].timestamp,
    unreadCountForAdmin: 0,
    unreadCountForUser: 0,
    messages: initialMessages
  };

  saveConversations([defaultConv]);
  return [defaultConv];
}

export function saveConversations(conversations: SupportConversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (e) {
    console.error("Error saving support conversations:", e);
  }
}

export function getConversationForUser(userId?: string): SupportConversation {
  const conversations = getAllConversations();
  const currentUser = getCurrentUserInfo();
  const targetId = userId || currentUser.id;

  let conv = conversations.find((c) => c.id === targetId || c.userId === targetId);
  if (!conv) {
    const newConv: SupportConversation = {
      id: targetId,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      userId: currentUser.id,
      lastMessage: "Bienvenue sur le chat d'assistance",
      lastTime: "Maintenant",
      lastTimestamp: Date.now(),
      unreadCountForAdmin: 0,
      unreadCountForUser: 0,
      messages: [
        {
          id: `init-${Date.now()}`,
          conversationId: targetId,
          sender: "admin",
          senderName: "Administrateur Nutrien",
          userId: currentUser.id,
          userName: currentUser.name,
          userPhone: currentUser.phone,
          text: "Bonjour ! Bienvenue au Service Client Nutrien. Je suis l'Administrateur de garde. Comment puis-je vous aider ?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          readByAdmin: true,
          readByUser: true
        }
      ]
    };
    conversations.unshift(newConv);
    saveConversations(conversations);
    return newConv;
  }
  return conv;
}

export function addSupportMessage(msgData: {
  conversationId?: string;
  sender: "user" | "admin";
  text: string;
  attachment?: string;
  senderName?: string;
}): SupportMessage {
  const currentUser = getCurrentUserInfo();
  const convId = msgData.conversationId || currentUser.id;

  const conversations = getAllConversations();
  let convIndex = conversations.findIndex((c) => c.id === convId || c.userId === convId);

  let targetUserId = currentUser.id;
  let targetUserName = currentUser.name;
  let targetUserPhone = currentUser.phone;

  if (convIndex !== -1) {
    targetUserId = conversations[convIndex].userId || targetUserId;
    targetUserName = conversations[convIndex].userName || targetUserName;
    targetUserPhone = conversations[convIndex].userPhone || targetUserPhone;
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const newMsg: SupportMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    conversationId: convId,
    sender: msgData.sender,
    senderName: msgData.senderName || (msgData.sender === "admin" ? "Administrateur Nutrien" : targetUserName),
    userId: msgData.sender === "admin" ? targetUserId : currentUser.id,
    userName: msgData.sender === "admin" ? targetUserName : currentUser.name,
    userPhone: msgData.sender === "admin" ? targetUserPhone : currentUser.phone,
    text: msgData.text,
    attachment: msgData.attachment,
    time: timeStr,
    timestamp: Date.now(),
    readByAdmin: msgData.sender === "admin",
    readByUser: msgData.sender === "user"
  };

  if (convIndex === -1) {
    const newConv: SupportConversation = {
      id: convId,
      userName: msgData.sender === "admin" ? targetUserName : currentUser.name,
      userPhone: msgData.sender === "admin" ? targetUserPhone : currentUser.phone,
      userId: msgData.sender === "admin" ? targetUserId : currentUser.id,
      lastMessage: msgData.text || "Fichier joint",
      lastTime: timeStr,
      lastTimestamp: Date.now(),
      unreadCountForAdmin: msgData.sender === "user" ? 1 : 0,
      unreadCountForUser: msgData.sender === "admin" ? 1 : 0,
      messages: [newMsg]
    };
    conversations.unshift(newConv);
  } else {
    const conv = conversations[convIndex];
    conv.messages.push(newMsg);
    conv.lastMessage = msgData.text || "Fichier joint";
    conv.lastTime = timeStr;
    conv.lastTimestamp = Date.now();

    if (msgData.sender === "user") {
      conv.userName = currentUser.name || conv.userName;
      conv.userPhone = currentUser.phone || conv.userPhone;
      conv.unreadCountForAdmin = (conv.unreadCountForAdmin || 0) + 1;
    } else {
      conv.unreadCountForUser = (conv.unreadCountForUser || 0) + 1;
    }

    // Move updated conversation to top
    conversations.splice(convIndex, 1);
    conversations.unshift(conv);
  }

  saveConversations(conversations);
  return newMsg;
}

export function markAsRead(convId: string, role: "admin" | "user") {
  const conversations = getAllConversations();
  const conv = conversations.find((c) => c.id === convId || c.userId === convId);
  if (!conv) return;

  if (role === "admin") {
    conv.unreadCountForAdmin = 0;
    conv.messages.forEach((m) => { m.readByAdmin = true; });
  } else {
    conv.unreadCountForUser = 0;
    conv.messages.forEach((m) => { m.readByUser = true; });
  }

  saveConversations(conversations);
}

export function deleteConversation(convId: string) {
  let conversations = getAllConversations();
  conversations = conversations.filter((c) => c.id !== convId && c.userId !== convId);
  saveConversations(conversations);
}

export function clearConversationForAdmin(convId: string) {
  const conversations = getAllConversations();
  const conv = conversations.find((c) => c.id === convId || c.userId === convId);
  if (!conv) return;

  conv.messages.forEach((m) => {
    m.deletedForAdmin = true;
  });
  conv.unreadCountForAdmin = 0;

  const remainingAdminMsgs = conv.messages.filter((m) => !m.deletedForAdmin);
  if (remainingAdminMsgs.length > 0) {
    conv.lastMessage = remainingAdminMsgs[remainingAdminMsgs.length - 1].text || "Fichier joint";
  } else {
    conv.lastMessage = "Discussion effacée par l'administrateur";
  }

  saveConversations(conversations);
}

export function clearConversationForUser(convId: string) {
  const conversations = getAllConversations();
  const conv = conversations.find((c) => c.id === convId || c.userId === convId);
  if (!conv) return;

  conv.messages.forEach((m) => {
    m.deletedForUser = true;
  });
  conv.unreadCountForUser = 0;

  const remainingUserMsgs = conv.messages.filter((m) => !m.deletedForUser);
  if (remainingUserMsgs.length > 0) {
    conv.lastMessage = remainingUserMsgs[remainingUserMsgs.length - 1].text || "Fichier joint";
  } else {
    conv.lastMessage = "Discussion effacée";
  }

  saveConversations(conversations);
}

export function deleteMessageForAdmin(msgId: string, convId: string) {
  const conversations = getAllConversations();
  const conv = conversations.find((c) => c.id === convId || c.userId === convId);
  if (!conv) return;

  const msg = conv.messages.find((m) => m.id === msgId);
  if (msg) {
    msg.deletedForAdmin = true;
    const remainingAdminMsgs = conv.messages.filter((m) => !m.deletedForAdmin);
    if (remainingAdminMsgs.length > 0) {
      conv.lastMessage = remainingAdminMsgs[remainingAdminMsgs.length - 1].text || "Fichier joint";
    } else {
      conv.lastMessage = "Aucun message";
    }
    saveConversations(conversations);
  }
}

export function deleteMessageForUser(msgId: string, convId: string) {
  const conversations = getAllConversations();
  const conv = conversations.find((c) => c.id === convId || c.userId === convId);
  if (!conv) return;

  const msg = conv.messages.find((m) => m.id === msgId);
  if (msg) {
    msg.deletedForUser = true;
    const remainingUserMsgs = conv.messages.filter((m) => !m.deletedForUser);
    if (remainingUserMsgs.length > 0) {
      conv.lastMessage = remainingUserMsgs[remainingUserMsgs.length - 1].text || "Fichier joint";
    } else {
      conv.lastMessage = "Aucun message";
    }
    saveConversations(conversations);
  }
}

export function subscribeChatUpdates(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
