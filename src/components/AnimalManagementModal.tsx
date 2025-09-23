import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Upload, Scan, Plus } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface AnimalData {
  tag_id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  birth_date: string;
}

interface AnimalManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
  onAnimalAdded: () => void;
}

const AnimalManagementModal: React.FC<AnimalManagementModalProps> = ({
  open,
  onOpenChange,
  farmId,
  onAnimalAdded
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [animalData, setAnimalData] = useState<AnimalData>({
    tag_id: '',
    name: '',
    species: '',
    breed: '',
    gender: '',
    birth_date: ''
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setScannerActive(true);
      codeReader.current = new BrowserMultiFormatReader();
      
      const videoInputDevices = await codeReader.current.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      if (videoRef.current) {
        await codeReader.current.decodeFromVideoDevice(
          videoInputDevices[0].deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              setAnimalData(prev => ({ ...prev, tag_id: result.getText() }));
              stopScanner();
              toast({
                title: "Barcode Scanned",
                description: `Tag ID: ${result.getText()}`,
              });
            }
          }
        );
      }
    } catch (error) {
      console.error('Scanner error:', error);
      toast({
        title: "Scanner Error",
        description: "Could not start barcode scanner. Please check camera permissions.",
        variant: "destructive",
      });
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (codeReader.current) {
      codeReader.current.reset();
      codeReader.current = null;
    }
    setScannerActive(false);
  };

  const handleInputChange = (field: keyof AnimalData, value: string) => {
    setAnimalData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!animalData.tag_id.trim()) {
      toast({
        title: "Validation Error",
        description: "Tag ID is required",
        variant: "destructive",
      });
      return false;
    }
    if (!animalData.species.trim()) {
      toast({
        title: "Validation Error", 
        description: "Species is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (!farmId) {
      toast({
        title: "No Farm Found",
        description: "Please contact support to set up your farm first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('animals')
        .insert([{
          ...animalData,
          farm_id: farmId,
          birth_date: animalData.birth_date || null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Animal added successfully",
      });

      onAnimalAdded();
      onOpenChange(false);
      setAnimalData({
        tag_id: '',
        name: '',
        species: '',
        breed: '',
        gender: '',
        birth_date: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add animal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Animal
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              Barcode Scanner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tag_id">Tag ID *</Label>
                <Input
                  id="tag_id"
                  value={animalData.tag_id}
                  onChange={(e) => handleInputChange('tag_id', e.target.value)}
                  placeholder="Enter animal tag ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={animalData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter animal name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="species">Species *</Label>
                <Select value={animalData.species} onValueChange={(value) => handleInputChange('species', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="sheep">Sheep</SelectItem>
                    <SelectItem value="goat">Goat</SelectItem>
                    <SelectItem value="pig">Pig</SelectItem>
                    <SelectItem value="chicken">Chicken</SelectItem>
                    <SelectItem value="horse">Horse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={animalData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  placeholder="Enter breed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={animalData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Birth Date</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={animalData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scanner" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Barcode Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!scannerActive ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Click the button below to start scanning barcodes for animal tags
                    </p>
                    <Button onClick={startScanner} className="gradient-primary">
                      <Scan className="h-4 w-4 mr-2" />
                      Start Scanner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      className="w-full h-64 bg-black rounded-lg"
                      autoPlay
                      playsInline
                    />
                    <div className="flex justify-center">
                      <Button onClick={stopScanner} variant="outline">
                        Stop Scanner
                      </Button>
                    </div>
                  </div>
                )}

                {animalData.tag_id && (
                  <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-success font-medium">
                      Scanned Tag ID: {animalData.tag_id}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form fields for additional info after scanning */}
            {animalData.tag_id && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name_scanner">Name</Label>
                    <Input
                      id="name_scanner"
                      value={animalData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter animal name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="species_scanner">Species *</Label>
                    <Select value={animalData.species} onValueChange={(value) => handleInputChange('species', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cattle">Cattle</SelectItem>
                        <SelectItem value="sheep">Sheep</SelectItem>
                        <SelectItem value="goat">Goat</SelectItem>
                        <SelectItem value="pig">Pig</SelectItem>
                        <SelectItem value="chicken">Chicken</SelectItem>
                        <SelectItem value="horse">Horse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="breed_scanner">Breed</Label>
                    <Input
                      id="breed_scanner"
                      value={animalData.breed}
                      onChange={(e) => handleInputChange('breed', e.target.value)}
                      placeholder="Enter breed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender_scanner">Gender</Label>
                    <Select value={animalData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date_scanner">Birth Date</Label>
                  <Input
                    id="birth_date_scanner"
                    type="date"
                    value={animalData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="gradient-primary"
          >
            {loading ? "Adding..." : "Add Animal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimalManagementModal;