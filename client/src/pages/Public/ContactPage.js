// client/src/pages/Public/ContactPage.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { sendContactFormApi } from '../../services/api';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await sendContactFormApi(formData);
            
            const phoneNumber = "+237674772569".replace(/\D/g, '');
            const whatsappMessage = `New Contact Form Message:\n\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');

            toast.success(t('public.contact.messages.success'));
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
            console.error("Contact form error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-apple-gray-50 dark:bg-apple-gray-950 py-16">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-apple-gray-900 dark:text-white">
                        {t('public.contact.title')}
                    </h1>
                    <p className="mt-4 text-lg text-apple-gray-600 dark:text-apple-gray-400 max-w-2xl mx-auto">
                        {t('public.contact.subtitle')}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 0.7 }}
                    >
                        <form onSubmit={handleFormSubmit} className="space-y-6 bg-white dark:bg-apple-gray-900 p-8 rounded-lg shadow-md">
                            <Input label={t('public.contact.form.name')} name="name" value={formData.name} onChange={handleChange} required />
                            <Input label={t('public.contact.form.email')} name="email" type="email" value={formData.email} onChange={handleChange} required />
                            <Input label={t('public.contact.form.message')} name="message" value={formData.message} onChange={handleChange} multiline rows={5} required />
                            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                                {t('public.contact.form.submit')}
                            </Button>
                        </form>
                    </motion.div>

                    <div className="space-y-8 mt-4">
                         <div className="flex items-start gap-4">
                            <Mail size={24} className="text-apple-blue mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-semibold">{t('public.contact.details.email')}</h3>
                                <a href="mailto:\ kanyuymarketing31@gmail.com" className="text-apple-gray-600 dark:text-apple-gray-400 hover:underline">
                                    kanyuymarketing31@gmail.com
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone size={24} className="text-apple-blue mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-semibold">{t('public.contact.details.whatsapp')}</h3>
                                <a href={`https://wa.me/237674772569`} target="_blank" rel="noopener noreferrer" className="text-apple-gray-600 dark:text-apple-gray-400 hover:underline">
                                    +237 674 772 569
                                </a>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <MapPin size={24} className="text-apple-blue mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-semibold">{t('public.contact.details.address')}</h3>
                                <p className="text-apple-gray-600 dark:text-apple-gray-400">Douala, Cameroon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;