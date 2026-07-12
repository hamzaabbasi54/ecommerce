import { useState, useEffect } from 'react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '@/services/userService';
import { Loader2 } from 'lucide-react';

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const initialForm = {
    label: '', street: '', city: '', province: '', postalCode: '', country: '', isDefault: false
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      if (res.success) setAddresses(res.data);
    } catch (err) {
      console.error("Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleEdit = (addr) => {
    setFormData({ ...addr });
    setEditId(addr.id);
    setIsEditing(true);
    setErrorMsg('');
  };

  const handleAddNew = () => {
    setFormData(initialForm);
    setEditId(null);
    setIsEditing(true);
    setErrorMsg('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(initialForm);
    setEditId(null);
    setErrorMsg('');
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      const res = await deleteAddress(id);
      if (res.success) {
        await fetchAddresses();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert('Failed to delete address');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');

    try {
      let res;
      if (editId) {
        res = await updateAddress(editId, formData);
      } else {
        res = await createAddress(formData);
      }

      if (res.success) {
        await fetchAddresses();
        setIsEditing(false);
        setEditId(null);
        setFormData(initialForm);
      } else {
        setErrorMsg(res.message || 'Failed to save address');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-border pb-4 gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Saved Addresses</h2>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Address
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-md flex items-center gap-2 text-error text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {errorMsg}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-surface-container border border-border p-6 rounded-xl space-y-4 max-w-[700px]">
          <h3 className="font-medium text-foreground mb-2">{editId ? 'Edit Address' : 'Add New Address'}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Label (e.g. Home, Office)</label>
              <input type="text" name="label" value={formData.label} onChange={handleChange} required
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Street Address</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} required
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">State / Province</label>
              <input type="text" name="province" value={formData.province} onChange={handleChange} required
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Postal Code</label>
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} required
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="isDefault" 
              name="isDefault" 
              checked={formData.isDefault} 
              onChange={handleChange} 
              className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-foreground">Set as default shipping address</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={handleCancel} disabled={actionLoading}
              className="px-4 py-2 bg-transparent border border-outline rounded-md text-foreground hover:bg-surface-variant transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Address'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <div className="col-span-full py-10 text-center bg-surface-container-lowest border border-dashed border-border rounded-xl">
              <span className="material-symbols-outlined text-[48px] text-muted-foreground mb-2">location_off</span>
              <p className="text-muted-foreground">You haven&apos;t saved any addresses yet.</p>
            </div>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className="bg-surface-container-lowest border border-border p-5 rounded-xl shadow-sm relative group">
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
                <h3 className="font-semibold text-lg text-foreground mb-2 pr-16">{addr.label}</h3>
                <div className="text-muted-foreground text-sm space-y-1 mb-4">
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.province} {addr.postalCode}</p>
                  <p>{addr.country}</p>
                </div>
                
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <button onClick={() => handleEdit(addr)} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)} disabled={actionLoading} className="text-sm font-medium text-error hover:underline flex items-center gap-1 disabled:opacity-50">
                    <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
