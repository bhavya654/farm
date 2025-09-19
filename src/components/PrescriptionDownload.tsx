import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileImage } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';

interface PrescriptionData {
  animalName: string;
  animalTagId: string;
  medicationName: string;
  diagnosis: string;
  dosage: string;
  notes?: string;
  vetName: string;
  vetLicense?: string;
  withdrawalMeat?: number;
  withdrawalMilk?: number;
  treatmentDate: string;
}

interface PrescriptionDownloadProps {
  prescription: PrescriptionData;
  className?: string;
}

const PrescriptionDownload: React.FC<PrescriptionDownloadProps> = ({ 
  prescription, 
  className 
}) => {
  const { toast } = useToast();
  const prescriptionRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async () => {
    if (!prescriptionRef.current) return;

    try {
      const canvas = await html2canvas(prescriptionRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `prescription_${prescription.animalTagId}_${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();

      toast({
        title: "Success",
        description: "Prescription downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download prescription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={className}>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={downloadAsImage}
          className="gradient-primary"
        >
          <Download className="h-4 w-4 mr-2" />
          Download as JPG
        </Button>
      </div>

      <div 
        ref={prescriptionRef}
        className="bg-white p-8 border-2 border-gray-300 rounded-lg shadow-lg"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            VETERINARY PRESCRIPTION
          </h1>
          <div className="text-lg text-gray-600">
            FarmSafe Sync Digital Health Record
          </div>
        </div>

        {/* Vet Information */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              VETERINARIAN
            </h3>
            <p className="text-gray-700 mb-1">
              <strong>Name:</strong> Dr. {prescription.vetName}
            </p>
            {prescription.vetLicense && (
              <p className="text-gray-700 mb-1">
                <strong>License:</strong> {prescription.vetLicense}
              </p>
            )}
            <p className="text-gray-700">
              <strong>Date:</strong> {new Date(prescription.treatmentDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              ANIMAL INFORMATION
            </h3>
            <p className="text-gray-700 mb-1">
              <strong>Name:</strong> {prescription.animalName || 'N/A'}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Tag ID:</strong> {prescription.animalTagId}
            </p>
          </div>
        </div>

        {/* Prescription Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
            PRESCRIPTION DETAILS
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <strong>Diagnosis:</strong> {prescription.diagnosis}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Medication:</strong> {prescription.medicationName}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Dosage & Instructions:</strong> {prescription.dosage}
            </p>
            {prescription.notes && (
              <p className="text-gray-700">
                <strong>Additional Notes:</strong> {prescription.notes}
              </p>
            )}
          </div>
        </div>

        {/* Withdrawal Periods */}
        {(prescription.withdrawalMeat || prescription.withdrawalMilk) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
              WITHDRAWAL PERIODS
            </h3>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              {prescription.withdrawalMeat && (
                <p className="text-red-700 mb-1">
                  <strong>Meat Withdrawal:</strong> {prescription.withdrawalMeat} days
                </p>
              )}
              {prescription.withdrawalMilk && (
                <p className="text-red-700">
                  <strong>Milk Withdrawal:</strong> {prescription.withdrawalMilk} hours
                </p>
              )}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>IMPORTANT:</strong> This prescription must be followed exactly as prescribed. 
            Do not use this animal or its products for human consumption during the withdrawal period. 
            Keep this record for compliance purposes.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
          <p>Generated by FarmSafe Sync Digital Veterinary System</p>
          <p>Document ID: {Date.now()}</p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDownload;