import React, { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, Upload, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Organization } from '../types';
import { getOrganization, updateOrganization } from '../services/organizationService';

const OrganizationSetupPage: React.FC = () => {
  const [organization, setOrganization] = useState<Organization>({
    id: '',
    name: '',
    phones: [''],
    emails: [''],
    address: '',
    logo: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const data = await getOrganization();
      setOrganization(data);
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Organization, value: string) => {
    setOrganization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    setOrganization(prev => ({
      ...prev,
      phones: prev.phones.map((phone, i) => i === index ? value : phone)
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    setOrganization(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  const addPhone = () => {
    setOrganization(prev => ({
      ...prev,
      phones: [...prev.phones, '']
    }));
  };

  const removePhone = (index: number) => {
    if (organization.phones.length > 1) {
      setOrganization(prev => ({
        ...prev,
        phones: prev.phones.filter((_, i) => i !== index)
      }));
    }
  };

  const addEmail = () => {
    setOrganization(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmail = (index: number) => {
    if (organization.emails.length > 1) {
      setOrganization(prev => ({
        ...prev,
        emails: prev.emails.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // For now, we'll just create a URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setOrganization(prev => ({
          ...prev,
          logo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!organization.name.trim()) {
      toast.error('Organization name is required');
      return false;
    }

    if (!organization.address.trim()) {
      toast.error('Address is required');
      return false;
    }

    const validPhones = organization.phones.filter(phone => phone.trim());
    if (validPhones.length === 0) {
      toast.error('At least one phone number is required');
      return false;
    }

    const validEmails = organization.emails.filter(email => email.trim());
    if (validEmails.length === 0) {
      toast.error('At least one email address is required');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of validEmails) {
      if (!emailRegex.test(email)) {
        toast.error(`Invalid email format: ${email}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      // Filter out empty phones and emails
      const cleanedData = {
        ...organization,
        phones: organization.phones.filter(phone => phone.trim()),
        emails: organization.emails.filter(email => email.trim())
      };

      await updateOrganization(cleanedData);
      toast.success('Organization details updated successfully');
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-primary-100 rounded-xl mr-4">
            <Building2 className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Setup</h1>
            <p className="text-gray-600">Configure your organization details for bills and documents</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <Input
                label="Organization Name *"
                value={organization.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>

            {/* Logo Upload */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organization Logo
              </label>
              <div className="flex items-center space-x-4">
                {organization.logo && (
                  <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden">
                    <img
                      src={organization.logo}
                      alt="Organization Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-primary-400 transition-colors">
                      <div className="flex items-center justify-center space-x-2">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-gray-600">Click to upload logo</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phone Numbers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Numbers *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhone}
                  icon={<Plus size={16} />}
                >
                  Add Phone
                </Button>
              </div>
              <div className="space-y-3">
                {organization.phones.map((phone, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => handlePhoneChange(index, e.target.value)}
                          placeholder="Enter phone number"
                          className="pl-10 px-4 py-3 bg-white border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    {organization.phones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhone(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Email Addresses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Addresses *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmail}
                  icon={<Plus size={16} />}
                >
                  Add Email
                </Button>
              </div>
              <div className="space-y-3">
                {organization.emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleEmailChange(index, e.target.value)}
                          placeholder="Enter email address"
                          className="pl-10 px-4 py-3 bg-white border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                    {organization.emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmail(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <textarea
                value={organization.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                className="pl-10 px-4 py-3 bg-white border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={saving}
            >
              Save Organization Details
            </Button>
          </div>
        </form>
      </div>

      {/* Preview */}
      {organization.name && (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 p-6 rounded-xl border border-primary-100">
            <div className="flex items-start space-x-4">
              {organization.logo && (
                <img
                  src={organization.logo}
                  alt="Logo"
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{organization.name}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {organization.phones.filter(p => p.trim()).map((phone, index) => (
                    <p key={index}>📞 {phone}</p>
                  ))}
                  {organization.emails.filter(e => e.trim()).map((email, index) => (
                    <p key={index}>✉️ {email}</p>
                  ))}
                  <p>📍 {organization.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSetupPage;