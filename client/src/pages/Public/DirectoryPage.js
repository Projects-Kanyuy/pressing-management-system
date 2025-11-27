import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPublicDirectoryApi } from '../../services/api';
import Spinner from '../../components/UI/Spinner';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { MapPin, Search, Aperture, Phone } from 'lucide-react';

// --- ✅ UPGRADED i18n BusinessCard Component ---
const BusinessCard = ({ business }) => {
  const { t } = useTranslation();

  const bannerUrl =
    business.bannerUrl ||
    'https://images.unsplash.com/photo-1582735689369-7fe275765448?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

  const logoUrl = business.logoUrl;

  const handleWhatsAppContact = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!business.publicPhone) return;

    const phoneNumber = business.publicPhone.replace(/\s/g, '').replace('+', '');
    const message = t('directoryPage.businessCard.whatsappMessage', {
      name: business.name,
    });

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white dark:bg-apple-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col">
      {/* Banner */}
      <div className="relative">
        <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${bannerUrl})` }} />

        {/* Logo */}
        <div className="absolute top-20 left-6 w-20 h-20 rounded-lg bg-white dark:bg-apple-gray-800 p-1 shadow-md flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={business.name} className="w-full h-full object-cover rounded-md" />
          ) : (
            <span className="text-3xl font-bold text-apple-blue">
              {business.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-12 flex-grow flex flex-col">
        <h3 className="font-bold text-lg truncate">{business.name}</h3>

        <div className="flex items-center mt-1 text-xs text-apple-gray-500">
          <MapPin size={12} className="mr-1.5" />
          <span className="truncate">
            {business.city || t('directoryPage.businessCard.noLocation')}
            {business.country && `, ${business.country}`}
          </span>
        </div>

        <p className="mt-4 text-sm h-10 line-clamp-2 flex-grow">
          {business.description || t('directoryPage.businessCard.defaultDescription')}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link to={`/directory/${business.slug}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              {t('directoryPage.businessCard.viewDetails')}
            </Button>
          </Link>

          <Button
            onClick={handleWhatsAppContact}
            className="flex-1"
            variant="primary"
            iconLeft={<Phone size={16} />}
            disabled={!business.publicPhone}
          >
            {t('directoryPage.businessCard.contact')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- ✅ FULL i18n MAIN DIRECTORY PAGE ---
const DirectoryPage = () => {
  const { t } = useTranslation();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    const loadBusinesses = async () => {
      setLoading(true);
      setError('');

      try {
        const filters = {};
        if (searchTerm) filters.search = searchTerm;
        if (cityFilter) filters.city = cityFilter;

        const { data } = await getPublicDirectoryApi(filters);
        setBusinesses(data || []);
      } catch (err) {
        setError(t('directoryPage.states.error'));
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(loadBusinesses, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, cityFilter, t]);

  return (
    <>
      {/* HERO SECTION */}
      <section className="py-16 md:py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            {t('directoryPage.hero.title')}
          </h1>

          <p className="mt-4 text-lg max-w-2xl mx-auto">
            {t('directoryPage.hero.subtitle')}
          </p>

          <div className="mt-8 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/10 p-4 rounded-xl">
            <Input
              id="search"
              placeholder={t('directoryPage.search.businessPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefixIcon={<Search size={18} />}
              inputClassName="bg-white/20 text-white"
            />

            <Input
              id="city"
              placeholder={t('directoryPage.search.cityPlaceholder')}
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              prefixIcon={<MapPin size={18} />}
              inputClassName="bg-white/20 text-white"
            />
          </div>
        </div>
      </section>

      {/* LISTING SECTION */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center h-40">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-12">{error}</p>
          ) : businesses.length === 0 ? (
            <div className="text-center py-12">
              <Aperture size={48} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold">
                {t('directoryPage.states.emptyTitle')}
              </h3>
              <p className="mt-2">
                {t('directoryPage.states.emptySubtitle')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businesses.map((business) => (
                <BusinessCard key={business._id || business.slug} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DirectoryPage;
