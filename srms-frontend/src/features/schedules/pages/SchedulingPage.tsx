import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomerScheduling } from '../components/CustomerScheduling';
import toast from 'react-hot-toast';

export const SchedulingPage: React.FC = () => {
  const { serviceRequestId } = useParams<{ serviceRequestId: string }>();
  const navigate = useNavigate();

  if (!serviceRequestId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Service Request</h1>
          <p className="text-gray-600">No service request ID provided</p>
          <button
            onClick={() => navigate('/service-requests')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Service Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <CustomerScheduling
      serviceRequestId={serviceRequestId}
      onScheduleCreated={(schedule) => {
        toast.success(`Schedule created for ${schedule.scheduled_at_formatted}`);
      }}
    />
  );
};
