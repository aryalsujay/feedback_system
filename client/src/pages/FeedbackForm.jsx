import React, { useState, useMemo, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import useQuestions from '../hooks/useQuestions';
import { translations } from '../translations';
import GlassCard from '../components/GlassCard';
import RatingSmiley from '../components/RatingSmiley';
import StarRating from '../components/StarRating';
import NumberRating from '../components/NumberRating';
import OptionSelect from '../components/OptionSelect';
import ProgressIndicator from '../components/ProgressIndicator';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2, AlertCircle, LogOut, Languages } from 'lucide-react';

const FeedbackForm = () => {
    const { departmentId } = useParams();
    const navigate = useNavigate();
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('feedbackLanguage') || 'en';
    });
    const { questions, loading, error } = useQuestions(language);

    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [departmentSession, setDepartmentSession] = useState(null);

    const department = questions?.[departmentId];
    const t = translations[language];

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        localStorage.setItem('feedbackLanguage', newLang);
    };

    // Check for department session on mount
    useEffect(() => {
        const session = localStorage.getItem('departmentSession');
        if (session) {
            const parsedSession = JSON.parse(session);
            setDepartmentSession(parsedSession);

            // Verify department user is accessing their own department
            // Admin can access any department
            if (parsedSession.type === 'department' && parsedSession.departmentId !== departmentId) {
                // Redirect department user to their own department
                navigate(`/feedback/${parsedSession.departmentId}`);
            }
        }
    }, [departmentId, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('departmentSession');
        navigate('/');
    };

    const handleAnswer = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    // Calculate progress - count answered non-text questions
    const progress = useMemo(() => {
        if (!department) return { current: 0, total: 0 };

        const nonTextQuestions = department.questions.filter(q => q.type !== 'text');
        const answeredCount = nonTextQuestions.filter(q =>
            answers[q.id] !== undefined && answers[q.id] !== null
        ).length;

        return {
            current: answeredCount,
            total: nonTextQuestions.length
        };
    }, [answers, department]);

    // Validation: Check if all non-text questions have an answer
    const isFormValid = department && department.questions.every(q => {
        // "text" type questions are optional (suggestion/comments)
        if (q.type === 'text') return true;
        // Other types (smiley, rating_5, number_rating, option_select) must have a value
        return answers[q.id] !== undefined && answers[q.id] !== null;
    });

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-pagoda-gold" size={48} /></div>;
    if (error || !questions) return <div className="min-h-screen flex items-center justify-center text-pagoda-error">Failed to load configuration.</div>;

    if (!department) {
        return <div className="p-10 text-center text-pagoda-stone-500">Department not found</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);

        const { name, email, contact, location, ...questionAnswers } = answers;

        try {
            const response = await fetch(`${API_BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    departmentId,
                    answers: questionAnswers,
                    name: name, // If empty/undefined, backend handles it as anonymous
                    email: email,
                    contact: contact,
                    location: location
                }),
            });

            if (!response.ok) throw new Error('Failed to submit feedback');
            navigate('/success');
        } catch (err) {
            console.error(err);
            setSubmitError('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Progress Indicator - Sticky at top */}
            {progress.total > 0 && (
                <ProgressIndicator current={progress.current} total={progress.total} />
            )}

            <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-pagoda-stone-50 via-pagoda-sand/30 to-pagoda-goldLight/10 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-20 right-0 w-72 h-72 bg-pagoda-lotus/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-0 w-72 h-72 bg-pagoda-peace/10 rounded-full blur-3xl"></div>

                <div className="w-full max-w-3xl z-10 mx-auto py-10 px-4 md:px-8">
                <div className="mb-8 flex justify-between items-center">
                    {departmentSession ? (
                        departmentSession.type === 'admin' ? (
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/admin/home')}
                                className="pl-0 gap-2 text-pagoda-stone-500 hover:text-pagoda-gold hover:bg-transparent"
                            >
                                <ArrowLeft size={18} /> {t.backToDepartments}
                            </Button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-pagoda-stone-600">
                                    {t.welcome}, <span className="font-semibold text-pagoda-maroon">{departmentSession.departmentName}</span>
                                </span>
                            </div>
                        )
                    ) : (
                        <div></div>
                    )}

                    {departmentSession && (
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="gap-2 text-pagoda-stone-500 hover:text-red-600 hover:bg-transparent"
                        >
                            <LogOut size={18} /> {t.logout}
                        </Button>
                    )}
                </div>

                {/* Language Selector */}
                <div className="mb-6 flex justify-end">
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-pagoda-gold/30 rounded-lg px-4 py-2 shadow-md">
                        <Languages className="text-pagoda-gold" size={20} />
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-transparent border-none outline-none text-pagoda-maroon font-medium cursor-pointer"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिन्दी (Hindi)</option>
                        </select>
                    </div>
                </div>


                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl md:text-4xl font-serif bg-gradient-to-r from-pagoda-maroon via-pagoda-gold to-pagoda-saffron bg-clip-text text-transparent mb-3">
                        {department.name}
                    </h1>
                    <motion.div
                        className="h-1 w-16 bg-gradient-to-r from-pagoda-saffron via-pagoda-gold to-pagoda-maroon mx-auto mb-4 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: 64 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    ></motion.div>
                    <p className="text-pagoda-stone-600 font-light">{t.valueFeedback}</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Details Section - Updated */}
                    <GlassCard className="bg-gradient-to-br from-white via-pagoda-goldLight/10 to-white backdrop-blur-sm border-3 border-pagoda-gold/40 p-10 shadow-xl hover:shadow-2xl hover:border-pagoda-saffron/50 transition-all duration-300">
                        <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-pagoda-maroon via-pagoda-brown to-pagoda-gold bg-clip-text mb-8 pb-4 flex items-center gap-3 border-b-3 border-gradient-to-r from-pagoda-saffron via-pagoda-gold to-pagoda-brown">
                            <span className="w-2 h-8 bg-gradient-to-b from-pagoda-saffron via-pagoda-gold to-pagoda-maroon rounded-full shadow-lg"></span>
                            {t.yourDetails}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-pagoda-stone-700 mb-2">{t.name}</label>
                                <input
                                    type="text"
                                    className="input-field w-full bg-pagoda-stone-50/50 p-3 rounded-lg border-2 border-pagoda-stone-200 focus:outline-none focus:border-pagoda-saffron focus:ring-2 focus:ring-pagoda-saffron/20 transition-all duration-300"
                                    placeholder={t.namePlaceholder}
                                    value={answers.name || ''}
                                    onChange={(e) => handleAnswer('name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-pagoda-stone-700 mb-2">{t.email}</label>
                                <input
                                    type="email"
                                    className="input-field w-full bg-pagoda-stone-50/50 p-3 rounded-lg border-2 border-pagoda-stone-200 focus:outline-none focus:border-pagoda-saffron focus:ring-2 focus:ring-pagoda-saffron/20 transition-all duration-300"
                                    placeholder={t.emailPlaceholder}
                                    value={answers.email || ''}
                                    onChange={(e) => handleAnswer('email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-pagoda-stone-700 mb-2">{t.contact}</label>
                                <input
                                    type="tel"
                                    className="input-field w-full bg-pagoda-stone-50/50 p-3 rounded-lg border-2 border-pagoda-stone-200 focus:outline-none focus:border-pagoda-saffron focus:ring-2 focus:ring-pagoda-saffron/20 transition-all duration-300"
                                    placeholder={t.contactPlaceholder}
                                    value={answers.contact || ''}
                                    onChange={(e) => handleAnswer('contact', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-pagoda-stone-700 mb-2">{t.location}</label>
                                <input
                                    type="text"
                                    className="input-field w-full bg-pagoda-stone-50/50 p-3 rounded-lg border-2 border-pagoda-stone-200 focus:outline-none focus:border-pagoda-saffron focus:ring-2 focus:ring-pagoda-saffron/20 transition-all duration-300"
                                    placeholder={t.locationPlaceholder}
                                    value={answers.location || ''}
                                    onChange={(e) => handleAnswer('location', e.target.value)}
                                />
                            </div>
                        </div>
                    </GlassCard>

                    {department.questions.map((q, idx) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08, duration: 0.5 }}
                        >
                            <GlassCard
                                className="bg-white/90 backdrop-blur-sm border-2 border-pagoda-stone-200 p-8 shadow-md hover:shadow-xl hover:border-pagoda-lotus/40 transition-all duration-300"
                                delay={0}
                            >
                                <label className="block text-xl font-bold text-transparent bg-gradient-to-r from-pagoda-maroon via-pagoda-brown to-pagoda-gold bg-clip-text mb-8 text-center leading-relaxed">
                                    {q.text} {q.type !== 'text' && <span className="text-pagoda-saffron text-2xl">*</span>}
                                </label>

                            {q.type === 'smiley' && (
                                <RatingSmiley
                                    value={answers[q.id]}
                                    onChange={(val) => handleAnswer(q.id, val)}
                                    labels={q.labels}
                                />
                            )}

                            {q.type === 'rating_5' && (
                                <StarRating
                                    value={answers[q.id]}
                                    onChange={(val) => handleAnswer(q.id, val)}
                                // StarRating handles internal labels usually, but if needed we can upgrade it too. 
                                // For now sticking to standard Stars.
                                />
                            )}

                            {q.type === 'number_rating' && (
                                <NumberRating
                                    value={answers[q.id]}
                                    onChange={(val) => handleAnswer(q.id, val)}
                                    labels={q.labels}
                                />
                            )}

                            {q.type === 'option_select' && (
                                <OptionSelect
                                    value={answers[q.id]}
                                    onChange={(val) => handleAnswer(q.id, val)}
                                    options={q.options}
                                />
                            )}

                            {q.type === 'text' && (
                                <textarea
                                    rows={4}
                                    className="input-field resize-none bg-pagoda-stone-50/50 border-2 border-pagoda-stone-200 rounded-lg focus:border-pagoda-saffron focus:ring-2 focus:ring-pagoda-saffron/20 transition-all duration-300"
                                    placeholder="Kindly share your thoughts..."
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                                />
                            )}
                        </GlassCard>
                        </motion.div>
                    ))}

                    {submitError && (
                        <div className="flex items-center gap-2 text-pagoda-error bg-red-50 p-4 rounded-md justify-center font-medium border border-red-100">
                            <AlertCircle size={20} /> {submitError}
                        </div>
                    )}

                    <motion.div
                        className="pt-8 pb-12 flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.div whileHover={{ scale: isFormValid ? 1.05 : 1 }} whileTap={{ scale: isFormValid ? 0.95 : 1 }}>
                            <Button
                                type="submit"
                                disabled={submitting || !isFormValid}
                                className={`px-14 py-4 text-lg shadow-xl shadow-pagoda-saffron/30 bg-gradient-to-r from-pagoda-saffron to-pagoda-gold hover:from-pagoda-gold hover:to-pagoda-saffron transition-all duration-300 ${!isFormValid ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-2xl hover:shadow-pagoda-gold/40'}`}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        {t.submitting}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {t.submit} <Send size={18} />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>
                </form>
                </div>
            </div>
        </>
    );
};

export default FeedbackForm;
