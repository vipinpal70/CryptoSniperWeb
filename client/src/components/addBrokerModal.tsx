import React, { useState } from 'react';
import { X, Info, Loader2, Copy } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

interface AddBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddBrokerModal: React.FC<AddBrokerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [brokerId, setBrokerId] = useState('');
  const [appName, setAppName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecretKey, setApiSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brokerId || !appName || !apiKey || !apiSecretKey) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Step 1: Add broker
      const brokerData = {
        broker_id: brokerId,
        app_name: appName,
        api_key: apiKey,
        secret_key: apiSecretKey,
        email: user?.email || '',
        broker_name: "BingX"
      };
      
      console.log("Sending broker data:", brokerData);
      // Construct URL with query parameters for email and broker_name
      const queryParams = new URLSearchParams({
        email: user?.email || '',
        broker_name: "BingX"
      }).toString();
      const addBrokerResponse = await apiRequest("POST", `/add-broker?${queryParams}`, {
        broker_id: brokerId,
        app_name: appName,
        api_key: apiKey,
        secret_key: apiSecretKey
      });
      
      if (addBrokerResponse?.success) {
        console.log("Broker added successfully");
        
        // Step 2: Verify broker
        const verifyResponse = await apiRequest("POST", "/verify-broker", {
          email: user?.email || '',
          broker_name: "BingX",
          broker_id: brokerId,
          app_name: appName,
          api_key: apiKey,
          secret_key: apiSecretKey
        
        });
        
        if (verifyResponse?.success) {
          toast({
            title: "Success",
            description: "Broker connected successfully",
          });
          onClose();
          if (onSuccess) onSuccess();
          window.location.reload(); // Reload the page to reflect changes
        } else {
          toast({
            title: "Warning",
            description: verifyResponse?.message || "Broker added but verification pending",
          });
        }
      } else {
        toast({
          title: "Error",
          description: addBrokerResponse?.message || "Failed to add broker",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding broker:", error);
      toast({
        title: "Error",
        description: "An error occurred while connecting the broker",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Broker</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Broker selection */}
        <div className="bg-blue-100 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">×</span>
            </div>
            <span className="font-semibold">BingX</span>
          </div>
          
          <div className="flex items-center text-blue-600 text-sm cursor-pointer">
            <span>How to add BingX broker?</span>
            <div className="ml-1 w-5 h-5 rounded-full border border-blue-600 flex items-center justify-center">
              <span className="text-blue-600 text-xs">?</span>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Broker Id</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-200 rounded-full"
                placeholder="bingX12345354#$%"
                value={brokerId}
                onChange={(e) => setBrokerId(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">App Name (any)</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-200 rounded-full"
                placeholder="Your app name"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">API Key</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-200 rounded-full"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">API Secret Key</label>
              <input 
                type="password" 
                className="w-full p-3 border border-gray-200 rounded-full"
                placeholder="Enter your API secret key"
                value={apiSecretKey}
                onChange={(e) => setApiSecretKey(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-6">
              <Info size={16} className="mr-2 text-blue-600" />
              <span>Whitelisting IP: </span>
              <strong className="ml-1 text-blue-600">13.234.123.123</strong>
              <button type="button" className="ml-2 text-gray-400">
                <Copy size={14} />
              </button>
            </div>
          </div>
          
          {/* Submit button */}
          <div className="px-6 pb-6">
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-medium py-3 rounded-full hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Connecting...
                </span>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBrokerModal;