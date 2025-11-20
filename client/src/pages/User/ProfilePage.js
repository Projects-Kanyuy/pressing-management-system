// client/src/pages/User/ProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
    updateMyProfile,
    requestPasswordChangeOtpApi,
    confirmPasswordChangeApi,
    uploadMyProfilePicture
} from '../../services/api';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Spinner from '../../components/UI/Spinner';
import {
    UserCircle, ShieldCheck, Briefcase, Edit3, KeyRound, Save,
    AlertTriangle, CheckCircle2, Camera, UploadCloud, Eye, EyeOff
} from 'lucide-react'; // Removed Mail as it's not used directly here

// Reusable DetailItem component for displaying profile info
const DetailItem = ({ label, value, icon: IconComponent, children, t }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 px-4 sm:px-6">
        <dt className="text-sm font-medium text-apple-gray-500 dark:text-apple-gray-400 flex items-center">
            {IconComponent && <IconComponent size={16} className="mr-2 text-apple-gray-400 dark:text-apple-gray-500" />}
            {label}
        </dt>
        <dd className="mt-1 text-sm text-apple-gray-900 dark:text-apple-gray-100 sm:mt-0 sm:col-span-2">
            {children || value || <span className="italic text-apple-gray-400 dark:text-apple-gray-500">{t('profile.notSet')}</span>}
        </dd>
    </div>
);

// Reusable Password Toggle Icon
const PasswordToggleIcon = ({ show, toggle }) => (
    <span onClick={toggle} className="cursor-pointer text-apple-gray-400 hover:text-apple-gray-600 dark:hover:text-apple-gray-200">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </span>
);


const ProfilePage = () => {
    const { t } = useTranslation();
    // CORRECTED: `logout` is removed as it's handled by the Navbar
    const { user, updateUserInContext, loading: authLoading } = useAuth();

    // Profile Details State
    const [username, setUsername] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' }); // Combined error/success

    // Profile Picture State
    const [pictureFile, setPictureFile] = useState(null);
    const [picturePreview, setPicturePreview] = useState('');
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const [pictureMessage, setPictureMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    // Change Password State
    const [passwordStep, setPasswordStep] = useState(1);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [otp, setOtp] = useState('');
    const [passwordChanging, setPasswordChanging] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setPicturePreview(user.profilePictureUrl || '');
        }
    }, [user]);

    // Effect for clearing all action messages after a delay
    useEffect(() => {
        let timer;
        if (profileMessage.text || pictureMessage.text || passwordMessage.text) {
            timer = setTimeout(() => {
                setProfileMessage({ type: '', text: '' });
                setPictureMessage({ type: '', text: '' });
                setPasswordMessage({ type: '', text: '' });
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [profileMessage, pictureMessage, passwordMessage]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!username.trim() || username.trim() === user.username) {
            setIsEditingProfile(false); setProfileMessage({ type: '', text: '' }); return;
        }
        setProfileSaving(true); setProfileMessage({ type: '', text: '' });
        try {
            const { data: updatedUser } = await updateMyProfile({ username: username.trim() });
            updateUserInContext(updatedUser);
            setProfileMessage({ type: 'success', text: t('profile.profileUpdated') });
            setIsEditingProfile(false);
        } catch (err) {
            setProfileMessage({ type: 'error', text: err.response?.data?.message || t('profile.profileUpdateFailed') });
        } finally {
            setProfileSaving(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setPictureMessage({ type: 'error', text: t('profile.fileTooLarge') }); return; }
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) { setPictureMessage({ type: 'error', text: t('profile.invalidFileType') }); return; }
        setPictureMessage({ type: '', text: '' }); setPictureFile(file); setPicturePreview(URL.createObjectURL(file));
    };

    const handlePictureUpload = async () => {
        if (!pictureFile) { setPictureMessage({ type: 'error', text: t('profile.selectImageFile') }); return; }
        setUploadingPicture(true); setPictureMessage({ type: '', text: '' });
        const formData = new FormData();
        formData.append('profilePicture', pictureFile);
        try {
            const { data: responseData } = await uploadMyProfilePicture(formData);
            if (responseData && responseData.profilePictureUrl) {
                updateUserInContext({ profilePictureUrl: responseData.profilePictureUrl });
                setPicturePreview(responseData.profilePictureUrl);
                setPictureFile(null); if (fileInputRef.current) fileInputRef.current.value = "";
                setPictureMessage({ type: 'success', text: responseData.message || t('profile.pictureUpdated') });
            } else { setPictureMessage({ type: 'error', text: responseData?.message || t('profile.unexpectedResponse') }); }
        } catch (err) {
            setPictureMessage({ type: 'error', text: err.response?.data?.message || t('profile.pictureUploadFailed') });
        } finally {
            setUploadingPicture(false);
        }
    };

    // --- DEFINED THE MISSING HANDLER ---
    const handlePasswordInputChange = (e) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        if (passwordData.newPassword !== passwordData.confirmNewPassword) { setPasswordMessage({ type: 'error', text: t('profile.passwordsDoNotMatch') }); return; }
        if (passwordData.newPassword.length < 6) { setPasswordMessage({ type: 'error', text: t('profile.passwordTooShort') }); return; }
        setPasswordChanging(true);
        try {
            const { data } = await requestPasswordChangeOtpApi({ currentPassword: passwordData.currentPassword });
            setPasswordMessage({ type: 'success', text: data.message || t('profile.verificationCodeSent') });
            setPasswordStep(2);
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || t('profile.failedToRequestOtp') });
        } finally {
            setPasswordChanging(false);
        }
    };

    const handleConfirmPasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        if (!otp || otp.length !== 6) { setPasswordMessage({ type: 'error', text: t('profile.enterSixDigitCode') }); return; }
        setPasswordChanging(true);
        try {
            const { data } = await confirmPasswordChangeApi({ otp, newPassword: passwordData.newPassword });
            setPasswordMessage({ type: 'success', text: data.message || t('profile.passwordChangedSuccessfully') });
            setPasswordStep(1); setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); setOtp('');
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.response?.data?.message || t('profile.verificationFailed') });
        } finally {
            setPasswordChanging(false);
        }
    };


    if (authLoading && !user) { return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>; }
    if (!user) { return <div className="text-center p-6">{t('profile.userDataNotAvailable')}</div>; }

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            <div className="flex items-center space-x-4 pt-2">
                <div className="relative group">
                    {picturePreview ? (<img src={picturePreview} alt={user.username} className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-apple-gray-700 shadow-md" />) : (<UserCircle size={96} className="text-apple-gray-300 dark:text-apple-gray-600" />)}
                    <button type="button" className="absolute bottom-1 right-1 bg-apple-gray-600 hover:bg-apple-gray-700 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => fileInputRef.current?.click()} aria-label={t('profile.changeProfilePicture')}><Camera size={16} /></button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" className="hidden" />
                </div>
                <div><h1 className="text-3xl font-semibold text-apple-gray-800 dark:text-apple-gray-100">{user.username}</h1><p className="text-md text-apple-gray-500 dark:text-apple-gray-400 capitalize">{user.role}</p></div>
            </div>

            {pictureFile && !uploadingPicture && (<div className="flex items-center justify-start gap-x-3 -mt-4 ml-28"><Button onClick={handlePictureUpload} iconLeft={<UploadCloud size={16}/>} variant="primary" size="sm">{t('profile.upload')}</Button><Button onClick={() => { setPictureFile(null); setPicturePreview(user.profilePictureUrl || ''); if(fileInputRef.current) fileInputRef.current.value = ""; }} variant="secondary" size="sm">{t('profile.cancel')}</Button></div>)}
            {uploadingPicture && <div className="-mt-4 ml-28 text-sm text-apple-gray-500 flex items-center"><Spinner size="sm" className="inline mr-2"/>{t('profile.uploading')}</div>}
            {pictureMessage.text && <p className={`my-2 text-sm text-center flex items-center justify-center ${pictureMessage.type === 'success' ? 'text-apple-green' : 'text-apple-red'}`}><CheckCircle2 size={16} className="mr-1"/> {pictureMessage.text}</p>}

            <Card title={t('profile.accountInformation')} contentClassName="p-0 divide-y divide-apple-gray-100 dark:divide-apple-gray-800"
                actions={!isEditingProfile && (<Button variant="ghost" size="sm" onClick={() => {setIsEditingProfile(true); setProfileMessage({type: '', text: ''});}} iconLeft={<Edit3 size={16}/>}>{t('profile.edit')}</Button>)}>
                {profileMessage.text && !isEditingProfile && <div className={`p-3 text-sm ${profileMessage.type === 'success' ? 'bg-green-100 text-apple-green' : 'bg-red-100 text-apple-red'} rounded-apple flex items-center`}><CheckCircle2 size={18} className="mr-2"/>{profileMessage.text}</div>}
                {!isEditingProfile ? (
                    <dl><DetailItem label={t('profile.username')} value={user.username} icon={UserCircle} t={t} /><DetailItem label={t('profile.role')} value={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} icon={user.role === 'admin' ? ShieldCheck : Briefcase} t={t} /></dl>
                ) : (
                    <form onSubmit={handleProfileUpdate} className="space-y-4 p-4 sm:p-6">
                         {profileMessage.text && isEditingProfile && <div className={`p-3 mb-4 text-sm ${profileMessage.type === 'error' ? 'bg-red-100 text-apple-red' : ''} rounded-apple flex items-center`}><AlertTriangle size={18} className="mr-2"/>{profileMessage.text}</div>}
                        <Input label={t('profile.username')} id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <div className="flex justify-end space-x-3 pt-2"><Button type="button" variant="secondary" onClick={() => { setIsEditingProfile(false); setProfileMessage({type:'',text:''}); setUsername(user.username); }}>{t('profile.cancel')}</Button><Button type="submit" variant="primary" isLoading={profileSaving} iconLeft={<Save size={16}/>}>{t('profile.saveProfile')}</Button></div>
                    </form>
                )}
            </Card>

            <Card title={t('profile.changePassword')} contentClassName="p-4 sm:p-6">
                {passwordMessage.text && <div className={`p-3 mb-4 text-sm ${passwordMessage.type === 'success' ? 'bg-green-100 text-apple-green' : 'bg-red-100 text-apple-red'} rounded-apple flex items-center`}><CheckCircle2 size={18} className="mr-2"/>{passwordMessage.text}</div>}
                
                {passwordStep === 1 && (
                    <form onSubmit={handleRequestOtp} className="space-y-4 py-2">
                        <Input label={t('profile.currentPassword')} id="currentPassword" name="currentPassword" type={showCurrentPassword ? "text" : "password"} value={passwordData.currentPassword} onChange={handlePasswordInputChange} required autoComplete="current-password" suffixIcon={<PasswordToggleIcon show={showCurrentPassword} toggle={() => setShowCurrentPassword(!showCurrentPassword)} />} />
                        <Input label={t('profile.newPassword')} id="newPassword" name="newPassword" type={showNewPassword ? "text" : "password"} value={passwordData.newPassword} onChange={handlePasswordInputChange} required autoComplete="new-password" minLength={6} suffixIcon={<PasswordToggleIcon show={showNewPassword} toggle={() => setShowNewPassword(!showNewPassword)} />} />
                        <Input label={t('profile.confirmNewPassword')} id="confirmNewPassword" name="confirmNewPassword" type={showNewPassword ? "text" : "password"} value={passwordData.confirmNewPassword} onChange={handlePasswordInputChange} required autoComplete="new-password" minLength={6} />
                        <div className="flex justify-end pt-2"> <Button type="submit" variant="primary" isLoading={passwordChanging} iconLeft={<KeyRound size={16}/>}> {t('profile.sendVerificationCode')} </Button> </div>
                    </form>
                )}

                {passwordStep === 2 && (
                    <form onSubmit={handleConfirmPasswordChange} className="space-y-4 py-2">
                        <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">{t('profile.verificationCodeInstruction')}</p>
                        <Input label={t('profile.sixDigitVerificationCode')} id="otp" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
                        <div className="flex justify-between items-center pt-2">
                            <Button type="button" variant="secondary" onClick={() => setPasswordStep(1)} disabled={passwordChanging}>{t('profile.back')}</Button>
                            <Button type="submit" variant="primary" isLoading={passwordChanging} iconLeft={<CheckCircle2 size={16}/>}>{t('profile.confirmAndChangePassword')}</Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default ProfilePage;