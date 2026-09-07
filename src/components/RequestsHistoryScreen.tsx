import React from 'react';
import { AssistanceRequest } from '../types';
import { Radio, CheckCircle2, Clock, AlertTriangle, ArrowRight, Truck, Phone, MessageSquare, ChevronRight } from 'lucide-react';

interface RequestsHistoryScreenProps {
  activeRequest?: AssistanceRequest | null;
  pastRequests: AssistanceRequest[];
  onSelectActiveRequest: () => void;
  onSelectPastRequest: (request: AssistanceRequest) => void;
}

export const RequestsHistoryScreen: React.FC<RequestsHistoryScreenProps> = ({
  activeRequest,
  pastRequests,
  onSelectActiveRequest,
  onSelectPastRequest,
}) => {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-[calc(100vh-56px)] mt-14 pb-28 md:pb-12 px-4 md:px-6 max-w-4xl mx-auto flex flex-col gap-6 pt-4 font-['Inter',sans-serif]">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1a1c1c]">Roadside Requests</h2>
        <p className="text-xs md:text-sm text-[#5b403d] mt-0.5">
          View active emergency dispatches and past roadside service logs.
        </p>
      </div>

      {/* Active Request Card (if any) */}
      {activeRequest && (
        <div className="bg-white border-2 border-[#b7131a] rounded-2xl p-4 md:p-5 shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#b7131a] rounded-full animate-ping"></span>
              <span className="text-xs font-bold text-[#b7131a] uppercase tracking-wider">
                Live Dispatch In Progress
              </span>
            </div>
            <span className="bg-[#ffdad6] text-[#93000d] text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              ETA: {activeRequest.helper?.currentEtaMinutes || 2} min
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1a1c1c]">{activeRequest.issueTitle}</h3>
              <p className="text-xs text-[#5b403d] mt-0.5">{activeRequest.locationAddress}</p>
              <div className="text-xs text-[#5b403d] mt-1 font-medium">
                Vehicle: {activeRequest.vehicle.make} {activeRequest.vehicle.model} ({activeRequest.vehicle.licensePlate})
              </div>
            </div>

            <button
              onClick={onSelectActiveRequest}
              className="px-4 py-2.5 bg-[#b7131a] hover:bg-[#db322f] text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Track Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Past Requests List */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-base md:text-lg text-[#1a1c1c]">Past Assistance History</h3>
        
        {pastRequests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#e2e2e2] text-[#5b403d] text-sm">
            No past roadside service records yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pastRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => onSelectPastRequest(req)}
                className="bg-white rounded-2xl p-4 border border-[#e2e2e2] hover:border-[#b7131a]/40 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#f3f3f3] text-[#005ea4] flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#1a1c1c] group-hover:text-[#b7131a] transition-colors">
                        {req.issueTitle}
                      </h4>
                      <span className="text-[10px] bg-[#dcfce7] text-[#15803d] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    </div>
                    <p className="text-xs text-[#5b403d] mt-0.5">{req.locationAddress}</p>
                    <div className="text-[11px] text-[#5b403d] mt-1">
                      {req.createdAt} • Driver: {req.helper?.name || 'Marcus T.'} • ${req.agreedPrice?.toFixed(2) || '50.00'}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[#5b403d] group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
