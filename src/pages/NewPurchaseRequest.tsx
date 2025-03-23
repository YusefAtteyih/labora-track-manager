
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPurchaseRequest, PurchaseFormData } from '@/services/purchaseService';

const NewPurchaseRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData: PurchaseFormData = {
        title,
        department,
        priority,
        notes,
        items: items.map(item => ({
          name: item.name,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      };
      
      await createPurchaseRequest(formData, user);
      navigate('/purchases');
    } catch (error) {
      console.error('Error creating purchase request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Purchase Request</h2>
          <p className="text-muted-foreground">
            Create a new purchase request for lab supplies and equipment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Request Title</Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Lab equipment request"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)} 
                    placeholder="Chemistry"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Additional information about this request"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end border-b pb-4">
                  <div className="sm:col-span-6 space-y-2">
                    <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                    <Input 
                      id={`item-name-${index}`} 
                      value={item.name} 
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)} 
                      placeholder="Microscope slides"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                    <Input 
                      id={`item-quantity-${index}`} 
                      type="number" 
                      min="1"
                      value={item.quantity} 
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} 
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-3 space-y-2">
                    <Label htmlFor={`item-price-${index}`}>Unit Price ($)</Label>
                    <Input 
                      id={`item-price-${index}`} 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={item.price} 
                      onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} 
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-1">
                    {items.length > 1 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddItem}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              
              <div className="pt-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Items: {items.length}</p>
                  <p className="text-lg font-bold">Total: ${calculateTotal()}</p>
                </div>
                
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/purchases')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting || items.some(item => !item.name) || items.length === 0}
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};

export default NewPurchaseRequest;
