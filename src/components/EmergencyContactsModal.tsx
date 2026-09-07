import React, { useState } from 'react';
import { EmergencyContact } from '../types';
import { X, Plus, Trash2, Phone, ShieldAlert, Check } from 'lucide-react';

interface EmergencyContactsModalProps {
  contacts: EmergencyContact[];
  onSaveContacts: (contacts: EmergencyContact[]) => void;
  onClose: () => void;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  contacts,
  onSaveContacts,
  onClose,
}) => {
  const [list, setList] = useState<EmergencyContact[]>(contacts);
  const [name, setName] = useState<string>('');
  const [relation, setRelation] = useState<string>('Family');
  const [phone, setPhone] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newContact: EmergencyContact = {
      id: `ec_${Date.now()}`,
      name,
      relationship: relation,
      phone,
      notifyOnSos: true,
    };

    const updated = [...list, newContact];
    setList(updated);
    onSaveContacts(updated);
    setName('');
    setPhone('');
  };

  const handleRemove = (id: string) => {
    const updated = list.filter((c) => c.id !== id);
    setList(updated);
    onSaveContacts(updated);
  };

  const handleToggleNotify = (id: string) => {
    const updated = list.map((c) => (c.id === id ? { ...c, notifyOnSos: !c.notifyOnSos } : c));
    setList(updated);
    onSaveContacts(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scaleUp flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#b7131a]" />
            <h3 className="font-bold text-lg text-[#1a1c1c]">Emergency Contacts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#5b403d] hover:bg-[#eeeeee] rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#5b403d]">
          These contacts receive an automated SMS broadcast with your live GPS location during SOS dispatches.
        </p>

        {/* Contacts List */}
        <div className="flex flex-col gap-2.5">
          {list.map((contact) => (
            <div
              key={contact.id}
              className="bg-[#f3f3f3] border border-[#e2e2e2] rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#ffdad6] text-[#b7131a] flex items-center justify-center font-bold text-xs">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#1a1c1c]">{contact.name}</div>
                  <div className="text-[11px] text-[#5b403d]">
                    {contact.relationship} • {contact.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleNotify(contact.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                    contact.notifyOnSos
                      ? 'bg-[#dcfce7] text-[#15803d]'
                      : 'bg-[#e2e2e2] text-[#5b403d]'
                  }`}
                >
                  {contact.notifyOnSos ? 'SOS Alert On' : 'Muted'}
                </button>
                <button
                  onClick={() => handleRemove(contact.id)}
                  className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-md cursor-pointer"
                  title="Remove contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="border-t border-[#e2e2e2] pt-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-[#1a1c1c]">Add New Emergency Contact</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[#e2e2e2] text-xs bg-[#f9f9f9]"
            />
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="h-10 px-2 rounded-lg border border-[#e2e2e2] text-xs bg-[#f9f9f9]"
            >
              <option value="Spouse">Spouse / Partner</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Insurance">Insurance Agent</option>
            </select>
          </div>
          <input
            type="tel"
            placeholder="Phone Number e.g. (555) 123-4567"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-10 px-3 rounded-lg border border-[#e2e2e2] text-xs bg-[#f9f9f9]"
          />
          <button
            type="submit"
            className="mt-1 w-full py-2.5 bg-[#b7131a] hover:bg-[#db322f] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </form>
      </div>
    </div>
  );
};
