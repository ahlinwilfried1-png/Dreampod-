/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Headphones, ArrowLeft, Clock, Phone, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

interface SupportViewProps {
  onBack: () => void;
}

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Qu'est-ce que Dreampod ?",
    a: "Dreampod est une plateforme d'investissement de premier plan, fonctionnant en partenariat stratégique avec des entités de courtage de réputation mondiale comme Charles Schwab. Nous facilitons l'accès aux placements à revenus passifs quotidiens stables en devises locales via Mobile Money.",
  },
  {
    q: "Comment effectuer un dépôt ?",
    a: "Rendez-vous dans la rubrique 'Dépôt', saisissez le montant de votre choix (minimum 1 000 FCFA), sélectionnez votre opérateur mobile (MTN, Orange, Moov ou Wave), puis effectuez le transfert. Enfin, collez la référence de transaction SMS reçue et soumettez la demande.",
  },
  {
    q: "Quel est le délai de traitement des retraits ?",
    a: "Pour garantir une sécurité maximale et des audits précis, l'ensemble des retraits de fonds est traité par nos agents financiers agréés dans un délai moyen garanti d'une à deux heures d'horloge à compter de la demande.",
  },
  {
    q: "Comment fonctionne le programme de parrainage ?",
    a: "Vous bénéficiez d'une commission directe de 10% sur tous les dépôts directs effectués par vos filleuls directs (Niveau 1) lorsqu'ils investissent dans un plan VIP.",
  },
  {
    q: "Qu'est-ce que les gains passifs journaliers ?",
    a: "Chaque plan VIP activé vous rapporte un montant fixe quotidien. Les revenus se cumulent automatiquement de manière continue. Vous pouvez les récolter quotidiennement et faire une demande de retrait immédiatement.",
  },
];

export default function SupportView({ onBack }: SupportViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div id="support-view-container" className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3.5">
        <button
          id="support-back-btn"
          onClick={onBack}
          className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Centre d'Aide</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assistance technique et financière 24h/7</p>
        </div>
      </div>

      {/* WhatsApp Support Hero Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-6">
        <div className="p-6 bg-blue-50/40 border border-blue-100 rounded-2xl flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center p-4 bg-blue-500 rounded-full text-white mb-3">
            <Headphones className="h-8 w-8 animate-pulse" />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Support WhatsApp Officiel</h3>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-bold">
            Notre équipe d'assistance financière d'Afrique francophone est disponible en continu pour répondre à vos préoccupations, guider vos dépôts, ou accélérer vos retraits.
          </p>
        </div>

        <div className="text-xs text-slate-700 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-bold">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4.5 w-4.5 text-[#00a3e0]" />
            <span>Temps de réponse moyen : moins de 5 minutes</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="h-4.5 w-4.5 text-[#00a3e0]" />
            <span>Support personnalisé gratuit et sécurisé</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4.5 w-4.5 text-[#00a3e0]" />
            <span>Serveur crypté de bout en bout</span>
          </div>
        </div>

        <a
          id="whatsapp-direct-link"
          href="https://wa.me/22890000000?text=Bonjour%20Dreampod%20Charles%20Schwab!"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-xs py-4 rounded-2xl transition-all block text-center cursor-pointer shadow-md shadow-green-500/10 active:scale-98"
        >
          Discuter en direct sur WhatsApp 💬
        </a>
      </div>

      {/* Interactive FAQs Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs space-y-4">
        <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-2.5">
          Foire Aux Questions (FAQ)
        </h3>

        <div className="space-y-3.5 divide-y divide-slate-100">
          {FAQS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div id={`faq-item-${index}`} key={index} className={`${index > 0 ? "pt-3.5" : ""}`}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center text-left text-xs font-extrabold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span className="pr-4">{item.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-[11px] text-slate-500 font-bold leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
